// User Model
class UserModel {
  constructor() {
    this.currentUser = null;
    this.users = this.loadUsers();
  }

  loadUsers() {
    const users = JSON.parse(localStorage.getItem('timetracker_users') || '[]');
    // Додаємо тестового користувача якщо база порожня
    if (users.length === 0) {
      const testUser = {
        id: 1,
        name: 'Іван Іваненко',
        email: 'ivan@example.com',
        password: 'password123',
        gender: 'Чоловіча',
        dateOfBirth: '1990-05-01',
        registrationDate: new Date().toISOString()
      };
      users.push(testUser);
      this.saveUsers(users);
    }
    return users;
  }

  saveUsers(users = this.users) {
    localStorage.setItem('timetracker_users', JSON.stringify(users));
  }

  register(userData) {
    // Перевіряємо чи email вже використовується
    if (this.users.find(user => user.email === userData.email)) {
      return { success: false, message: 'Користувач з таким email вже існує' };
    }

    const newUser = {
      id: Date.now(),
      ...userData,
      registrationDate: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveUsers();
    
    return { success: true, message: 'Реєстрація успішна', user: newUser };
  }

  login(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    
    if (user) {
      this.currentUser = user;
      localStorage.setItem('timetracker_currentUser', JSON.stringify(user));
      return { success: true, message: 'Вхід успішний', user };
    }
    
    return { success: false, message: 'Невірний email або пароль' };
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('timetracker_currentUser');
  }

  getCurrentUser() {
    if (!this.currentUser) {
      const saved = localStorage.getItem('timetracker_currentUser');
      if (saved) {
        this.currentUser = JSON.parse(saved);
      }
    }
    return this.currentUser;
  }

  isLoggedIn() {
    return this.getCurrentUser() !== null;
  }

  updateProfile(userData) {
    if (!this.currentUser) return { success: false, message: 'Користувач не авторизований' };

    const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
    if (userIndex === -1) return { success: false, message: 'Користувач не знайдений' };

    // Оновлюємо дані користувача (крім email та id)
    this.users[userIndex] = { ...this.users[userIndex], ...userData, id: this.currentUser.id };
    this.currentUser = this.users[userIndex];
    
    this.saveUsers();
    localStorage.setItem('timetracker_currentUser', JSON.stringify(this.currentUser));
    
    return { success: true, message: 'Профіль оновлено', user: this.currentUser };
  }
}

// Timer Model
class TimerModel {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = null;
    this.pausedTime = 0;
    this.elapsedTime = 0;
    this.sessionName = '';
    this.sessions = this.loadSessions();
  }

  loadSessions() {
    const userModel = new UserModel();
    const currentUser = userModel.getCurrentUser();
    if (!currentUser) return [];
    
    const key = `timetracker_sessions_${currentUser.id}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  saveSessions() {
    const userModel = new UserModel();
    const currentUser = userModel.getCurrentUser();
    if (!currentUser) return;
    
    const key = `timetracker_sessions_${currentUser.id}`;
    localStorage.setItem(key, JSON.stringify(this.sessions));
  }

  start(sessionName = '') {
    if (this.isRunning) return false;
    
    this.sessionName = sessionName || 'Робоча сесія';
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now() - this.pausedTime;
    return true;
  }

  pause() {
    if (!this.isRunning || this.isPaused) return false;
    
    this.isPaused = true;
    this.pausedTime = Date.now() - this.startTime;
    return true;
  }

  resume() {
    if (!this.isRunning || !this.isPaused) return false;
    
    this.isPaused = false;
    this.startTime = Date.now() - this.pausedTime;
    return true;
  }

  stop() {
    if (!this.isRunning) return false;
    
    this.elapsedTime = this.isPaused ? this.pausedTime : Date.now() - this.startTime;
    
    const session = {
      id: Date.now(),
      name: this.sessionName,
      duration: this.elapsedTime,
      startTime: new Date(Date.now() - this.elapsedTime).toISOString(),
      endTime: new Date().toISOString()
    };
    
    this.sessions.unshift(session);
    this.saveSessions();
    
    // Скидаємо стан таймера
    this.reset();
    
    return session;
  }

  reset() {
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = null;
    this.pausedTime = 0;
    this.elapsedTime = 0;
    this.sessionName = '';
  }

  getCurrentTime() {
    if (!this.isRunning) return 0;
    if (this.isPaused) return this.pausedTime;
    return Date.now() - this.startTime;
  }

  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getSessions() {
    return this.sessions;
  }

  deleteSession(sessionId) {
    this.sessions = this.sessions.filter(session => session.id !== sessionId);
    this.saveSessions();
  }
}