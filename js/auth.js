const Auth = (() => {
  const SESSION_KEY = 'cj_session';
  const USERS_KEY   = 'cj_users';

  function getUsers() { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

  function getCurrentUser() {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;
    try {
      const { userId } = JSON.parse(session);
      return getUsers().find(u => u.id === userId) || null;
    } catch { return null; }
  }

  function login(email, password) {
    const user = getUsers().find(u => u.email === email.toLowerCase().trim());
    if (!user) return { success: false, message: 'E-mail não cadastrado.' };
    if (user.password !== btoa(password)) return { success: false, message: 'Senha incorreta.' };
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
    return { success: true, user };
  }

  function register(data) {
    const users = getUsers();
    const email = data.email.toLowerCase().trim();
    if (users.find(u => u.email === email)) return { success: false, message: 'E-mail já cadastrado.' };
    const user = {
      id: 'u_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      name: data.name.trim(), email, password: btoa(data.password), role: data.role,
      createdAt: new Date().toISOString(),
      universidade: data.universidade || '', curso: data.curso || '',
      statusCurso: data.statusCurso || '', anoSemestre: data.anoSemestre || '',
      departamento: data.departamento || '', nomeEmpresa: data.nomeEmpresa || '',
      setor: data.setor || '', bio: '', foto: '',
      competencias: [], areasInteresse: [],
      links: { github: '', portfolio: '', linkedin: '' }
    };
    users.push(user);
    saveUsers(users);
    return { success: true, user };
  }

  function updateUser(updates) {
    const current = getCurrentUser();
    if (!current) return false;
    const users = getUsers();
    const idx = users.findIndex(u => u.id === current.id);
    if (idx === -1) return false;
    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
    return true;
  }

  function logout() { localStorage.removeItem(SESSION_KEY); window.location.href = 'login.html'; }

  function requireAuth(allowedRoles) {
    const user = getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return null; }
    if (allowedRoles && !allowedRoles.includes(user.role)) { window.location.href = 'dashboard.html'; return null; }
    return user;
  }

  return { login, register, logout, getCurrentUser, updateUser, requireAuth, getUsers };
})();
