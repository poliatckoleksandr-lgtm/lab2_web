// User View
class UserView {
  constructor(containerId) {
    this.container = document.querySelector(containerId);
  }

  showMessage(message, type = 'info') {
    const alertClass = {
      'success': 'alert-success',
      'error': 'alert-danger',
      'info': 'alert-info',
      'warning': 'alert-warning'
    }[type] || 'alert-info';

    const messageHTML = `
      <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;

    // Вставляємо повідомлення на початок контейнера
    this.container.insertAdjacentHTML('afterbegin', messageHTML);

    // Автоматично приховуємо через 5 секунд
    setTimeout(() => {
      const alert = this.container.querySelector('.alert');
      if (alert) {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
      }
    }, 5000);
  }

  renderRegistrationForm() {
    return `
      <form id="registrationForm">
        <div class="mb-3">
          <label for="name" class="form-label">Ім'я *</label>
          <input type="text" class="form-control" id="name" name="name" required placeholder="Введіть ім'я">
        </div>
        <div class="mb-3">
          <label for="email" class="form-label">Email *</label>
          <input type="email" class="form-control" id="email" name="email" required placeholder="name@example.com">
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Пароль *</label>
          <input type="password" class="form-control" id="password" name="password" required placeholder="Введіть пароль">
        </div>
        <div class="mb-3">
          <label for="confirmPassword" class="form-label">Підтвердіть пароль *</label>
          <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" required placeholder="Підтвердіть пароль">
        </div>
        <div class="mb-3">
          <label for="gender" class="form-label">Стать</label>
          <select class="form-select" id="gender" name="gender">
            <option value="">Оберіть стать</option>
            <option value="Чоловіча">Чоловіча</option>
            <option value="Жіноча">Жіноча</option>
            <option value="Інша">Інша</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="dateOfBirth" class="form-label">Дата народження</label>
          <input type="date" class="form-control" id="dateOfBirth" name="dateOfBirth">
        </div>
        <button type="submit" class="btn btn-primary">Зареєструватися</button>
        <a href="login.html" class="btn btn-link">Вже маєте акаунт? Увійти</a>
      </form>
    `;
  }

  renderLoginForm() {
    return `
      <form id="loginForm">
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input type="email" class="form-control" id="email" name="email" required placeholder="name@example.com">
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Пароль</label>
          <input type="password" class="form-control" id="password" name="password" required placeholder="Пароль">
        </div>
        <button type="submit" class="btn btn-primary">Увійти</button>
        <a href="registration.html" class="btn btn-link">Немає акаунту? Зареєструватися</a>
      </form>
    `;
  }

  renderProfile(user) {
    return `
      <div class="row">
        <div class="col-md-6">
          <h2>Інформація про профіль</h2>
          <table class="table table-bordered">
            <tbody>
              <tr><th>Ім'я</th><td>${user.name || 'Не вказано'}</td></tr>
              <tr><th>Email</th><td>${user.email}</td></tr>
              <tr><th>Стать</th><td>${user.gender || 'Не вказано'}</td></tr>
              <tr><th>Дата народження</th><td>${user.dateOfBirth || 'Не вказано'}</td></tr>
              <tr><th>Дата реєстрації</th><td>${new Date(user.registrationDate).toLocaleDateString('uk-UA')}</td></tr>
            </tbody>
          </table>
          <button class="btn btn-primary" onclick="toggleEditMode()">Редагувати профіль</button>
          <button class="btn btn-outline-danger ms-2" onclick="userController.logout()">Вийти</button>
        </div>
        <div class="col-md-6">
          <div id="editProfileForm" style="display: none;">
            <h3>Редагувати профіль</h3>
            <form id="profileForm">
              <div class="mb-3">
                <label for="editName" class="form-label">Ім'я</label>
                <input type="text" class="form-control" id="editName" name="name" value="${user.name || ''}" required>
              </div>
              <div class="mb-3">
                <label for="editGender" class="form-label">Стать</label>
                <select class="form-select" id="editGender" name="gender">
                  <option value="">Оберіть стать</option>
                  <option value="Чоловіча" ${user.gender === 'Чоловіча' ? 'selected' : ''}>Чоловіча</option>
                  <option value="Жіноча" ${user.gender === 'Жіноча' ? 'selected' : ''}>Жіноча</option>
                  <option value="Інша" ${user.gender === 'Інша' ? 'selected' : ''}>Інша</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="editDateOfBirth" class="form-label">Дата народження</label>
                <input type="date" class="form-control" id="editDateOfBirth" name="dateOfBirth" value="${user.dateOfBirth || ''}">
              </div>
              <button type="submit" class="btn btn-success">Зберегти</button>
              <button type="button" class="btn btn-secondary ms-2" onclick="toggleEditMode()">Скасувати</button>
            </form>
          </div>
        </div>
      </div>
    `;
  }
}

// Timer View
class TimerView {
  constructor(containerId) {
    this.container = document.querySelector(containerId);
    this.updateInterval = null;
  }

  render(timerModel) {
    this.container.innerHTML = `
      <div class="row">
        <div class="col-lg-6">
          <div class="card">
            <div class="card-body text-center">
              <h2 class="card-title">Таймер</h2>
              <div class="timer-display mb-4" id="timerDisplay">00:00:00</div>
              
              <div class="mb-3">
                <input type="text" class="form-control" id="sessionNameInput" 
                       placeholder="Назва сесії (необов'язково)" 
                       ${timerModel.isRunning ? 'disabled' : ''}>
              </div>
              
              <div class="btn-group" role="group">
                <button class="btn btn-success" id="startBtn" 
                        ${timerModel.isRunning && !timerModel.isPaused ? 'disabled' : ''}>
                  ${timerModel.isPaused ? 'Продовжити' : 'Старт'}
                </button>
                <button class="btn btn-warning" id="pauseBtn" 
                        ${!timerModel.isRunning || timerModel.isPaused ? 'disabled' : ''}>
                  Пауза
                </button>
                <button class="btn btn-danger" id="stopBtn" 
                        ${!timerModel.isRunning ? 'disabled' : ''}>
                  Стоп
                </button>
              </div>
              
              <div class="mt-3">
                <small class="text-muted">
                  Статус: ${this.getStatusText(timerModel)}
                </small>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-6">
          <div class="card">
            <div class="card-body">
              <h3 class="card-title">Історія сесій</h3>
              <div id="sessionsList">
                ${this.renderSessionsList(timerModel.getSessions())}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.startTimer(timerModel);
  }

  getStatusText(timerModel) {
    if (!timerModel.isRunning) return 'Зупинено';
    if (timerModel.isPaused) return 'На паузі';
    return 'Виконується';
  }

  renderSessionsList(sessions) {
    if (sessions.length === 0) {
      return '<p class="text-muted">Поки що немає збережених сесій</p>';
    }

    return `
      <div class="table-responsive">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Назва</th>
              <th>Тривалість</th>
              <th>Дата</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            ${sessions.map(session => `
              <tr>
                <td>${session.name}</td>
                <td>${this.formatDuration(session.duration)}</td>
                <td>${new Date(session.endTime).toLocaleDateString('uk-UA')}</td>
                <td>
                  <button class="btn btn-sm btn-outline-danger" 
                          onclick="timerController.deleteSession(${session.id})">
                    Видалити
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  formatDuration(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  updateTimer(currentTime) {
    const display = document.getElementById('timerDisplay');
    if (display) {
      display.textContent = this.formatDuration(currentTime);
    }
  }

  startTimer(timerModel) {
    this.stopTimer();
    this.updateInterval = setInterval(() => {
      this.updateTimer(timerModel.getCurrentTime());
    }, 1000);
  }

  stopTimer() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  showMessage(message, type = 'info') {
    const alertClass = {
      'success': 'alert-success',
      'error': 'alert-danger',
      'info': 'alert-info',
      'warning': 'alert-warning'
    }[type] || 'alert-info';

    const messageHTML = `
      <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;

    this.container.insertAdjacentHTML('afterbegin', messageHTML);

    setTimeout(() => {
      const alert = this.container.querySelector('.alert');
      if (alert) {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
      }
    }, 3000);
  }

  refreshSessionsList(sessions) {
    const sessionsList = document.getElementById('sessionsList');
    if (sessionsList) {
      sessionsList.innerHTML = this.renderSessionsList(sessions);
    }
  }
}