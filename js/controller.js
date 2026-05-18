// User Controller
class UserController {
  constructor() {
    this.model = new UserModel();
    this.view = new UserView('main');
  }

  init() {
    // Ініціалізація залежно від поточної сторінки
    const path = window.location.pathname;
    
    if (path.includes('registration.html')) {
      this.initRegistration();
    } else if (path.includes('login.html')) {
      this.initLogin();
    } else if (path.includes('profile.html')) {
      this.initProfile();
    }

    this.updateNavigation();
  }

  initRegistration() {
    // Перевіряємо чи користувач вже увійшов
    if (this.model.isLoggedIn()) {
      window.location.href = '../workspace.html';
      return;
    }

    const form = document.getElementById('registrationForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleRegistration(e));
    }
  }

  initLogin() {
    // Перевіряємо чи користувач вже увійшов
    if (this.model.isLoggedIn()) {
      window.location.href = '../workspace.html';
      return;
    }

    const form = document.getElementById('loginForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleLogin(e));
    }
  }

  initProfile() {
    // Перевіряємо чи користувач увійшов
    if (!this.model.isLoggedIn()) {
      window.location.href = 'login.html';
      return;
    }

    this.renderProfile();
    
    const form = document.getElementById('profileForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleProfileUpdate(e));
    }
  }

  handleRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());
    
    // Валідація
    if (userData.password !== userData.confirmPassword) {
      this.view.showMessage('Паролі не співпадають', 'error');
      return;
    }

    if (userData.password.length < 6) {
      this.view.showMessage('Пароль повинен містити принаймні 6 символів', 'error');
      return;
    }

    // Видаляємо підтвердження пароля з даних
    delete userData.confirmPassword;

    const result = this.model.register(userData);
    
    if (result.success) {
      this.view.showMessage(result.message, 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      this.view.showMessage(result.message, 'error');
    }
  }

  handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData.entries());
    
    const result = this.model.login(email, password);
    
    if (result.success) {
      this.view.showMessage(result.message, 'success');
      setTimeout(() => {
        window.location.href = '../workspace.html';
      }, 1000);
    } else {
      this.view.showMessage(result.message, 'error');
    }
  }

  handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());
    
    const result = this.model.updateProfile(userData);
    
    if (result.success) {
      this.view.showMessage(result.message, 'success');
      this.renderProfile();
      this.toggleEditMode();
    } else {
      this.view.showMessage(result.message, 'error');
    }
  }

  renderProfile() {
    const user = this.model.getCurrentUser();
    if (user) {
      const profileContainer = document.querySelector('#profileContainer');
      if (profileContainer) {
        profileContainer.innerHTML = this.view.renderProfile(user);
      }
    }
  }

  logout() {
    this.model.logout();
    this.view.showMessage('Ви успішно вийшли з системи', 'info');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
  }

  updateNavigation() {
    const isLoggedIn = this.model.isLoggedIn();
    const user = this.model.getCurrentUser();
    
    // Оновлюємо навігацію залежно від статусу входу
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(link => {
      if (link.href.includes('login.html') || link.href.includes('registration.html')) {
        link.style.display = isLoggedIn ? 'none' : 'block';
      } else if (link.href.includes('profile.html')) {
        link.style.display = isLoggedIn ? 'block' : 'none';
        if (isLoggedIn && user) {
          link.textContent = `Профіль (${user.name})`;
        }
      }
    });

    // Додаємо кнопку виходу до навігації якщо користувач увійшов
    if (isLoggedIn && !document.getElementById('logoutBtn')) {
      const logoutBtn = document.createElement('li');
      logoutBtn.className = 'nav-item';
      logoutBtn.innerHTML = '<a class="nav-link" href="#" id="logoutBtn">Вийти</a>';
      document.querySelector('.navbar-nav').appendChild(logoutBtn);
      
      document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  }
}

// Timer Controller
class TimerController {
  constructor(timerModel, timerView) {
    this.model = timerModel || new TimerModel();
    this.view = timerView || new TimerView('#timer-app');
    this.userModel = new UserModel();
  }

  init() {
    // Перевіряємо чи користувач увійшов
    if (!this.userModel.isLoggedIn()) {
      window.location.href = 'html/login.html';
      return;
    }

    this.render();
    this.bindEvents();
  }

  render() {
    this.view.render(this.model);
  }

  bindEvents() {
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const sessionNameInput = document.getElementById('sessionNameInput');

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        if (this.model.isPaused) {
          this.resume();
        } else {
          this.start();
        }
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.pause());
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stop());
    }

    // Автозбереження назви сесії
    if (sessionNameInput) {
      sessionNameInput.addEventListener('input', (e) => {
        this.model.sessionName = e.target.value;
      });
    }
  }

  start() {
    const sessionNameInput = document.getElementById('sessionNameInput');
    const sessionName = sessionNameInput ? sessionNameInput.value : '';
    
    if (this.model.start(sessionName)) {
      this.view.showMessage('Таймер запущено', 'success');
      this.updateButtons();
    }
  }

  pause() {
    if (this.model.pause()) {
      this.view.showMessage('Таймер призупинено', 'warning');
      this.updateButtons();
    }
  }

  resume() {
    if (this.model.resume()) {
      this.view.showMessage('Таймер відновлено', 'success');
      this.updateButtons();
    }
  }

  stop() {
    const session = this.model.stop();
    if (session) {
      this.view.showMessage(`Сесію "${session.name}" завершено. Тривалість: ${this.model.formatTime(session.duration)}`, 'success');
      this.updateButtons();
      this.view.refreshSessionsList(this.model.getSessions());
      
      // Очищаємо поле назви сесії
      const sessionNameInput = document.getElementById('sessionNameInput');
      if (sessionNameInput) {
        sessionNameInput.value = '';
        sessionNameInput.disabled = false;
      }
    }
  }

  deleteSession(sessionId) {
    if (confirm('Ви впевнені, що хочете видалити цю сесію?')) {
      this.model.deleteSession(sessionId);
      this.view.refreshSessionsList(this.model.getSessions());
      this.view.showMessage('Сесію видалено', 'info');
    }
  }

  updateButtons() {
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const sessionNameInput = document.getElementById('sessionNameInput');

    if (startBtn) {
      startBtn.disabled = this.model.isRunning && !this.model.isPaused;
      startBtn.textContent = this.model.isPaused ? 'Продовжити' : 'Старт';
    }

    if (pauseBtn) {
      pauseBtn.disabled = !this.model.isRunning || this.model.isPaused;
    }

    if (stopBtn) {
      stopBtn.disabled = !this.model.isRunning;
    }

    if (sessionNameInput) {
      sessionNameInput.disabled = this.model.isRunning;
    }
  }
}

// Глобальні змінні для контролерів
let userController;
let timerController;

// Функції для глобального доступу
function toggleEditMode() {
  const editForm = document.getElementById('editProfileForm');
  if (editForm) {
    editForm.style.display = editForm.style.display === 'none' ? 'block' : 'none';
  }
}

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
  userController = new UserController();
  userController.init();
});