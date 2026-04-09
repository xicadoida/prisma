const UI = (() => {
  function showAlert(elId, msg, type = 'error') {
    const el = document.getElementById(elId);
    if (!el) return;
    el.className = 'alert ' + (type === 'success' ? 'alert-success' : type === 'info' ? 'alert-info' : 'alert-error');
    el.textContent = msg;
    el.classList.remove('hidden');
    if (type === 'success') setTimeout(() => el.classList.add('hidden'), 3000);
  }

  function toast(msg, type = 'success', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) { container = document.createElement('div'); container.id = 'toast-container'; container.className = 'toast-container'; document.body.appendChild(container); }
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    t.innerHTML = `<span>${icons[type]||'•'}</span><span>${msg}</span>`;
    container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, duration);
  }

  function openModal(id) { const el = document.getElementById(id); if (el) el.classList.remove('hidden'); }
  function closeModal(id) { const el = document.getElementById(id); if (el) el.classList.add('hidden'); }

  function buildSidebar(user) {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;
    const menus = {
      aluno:     [{ href:'dashboard.html', icon:'📊', label:'Dashboard' }, { href:'perfil.html', icon:'👤', label:'Meu Perfil' }, { href:'empresas.html', icon:'🔍', label:'Explorar Vagas' }],
      professor: [{ href:'dashboard.html', icon:'📊', label:'Dashboard' }, { href:'perfil.html', icon:'👤', label:'Meu Perfil' }, { href:'professores.html', icon:'🎓', label:'Meus Alunos' }],
      empresa:   [{ href:'dashboard.html', icon:'📊', label:'Dashboard' }, { href:'perfil.html', icon:'🏢', label:'Perfil da Empresa' }, { href:'empresas.html', icon:'🔍', label:'Buscar Talentos' }]
    };
    const items = menus[user.role] || [];
    const current = window.location.pathname.split('/').pop();
    nav.innerHTML = items.map(item => `<a href="${item.href}" class="${item.href === current ? 'active' : ''}"><span class="nav-icon">${item.icon}</span><span>${item.label}</span></a>`).join('');
    const sideUser = document.getElementById('sidebar-user');
    if (sideUser) sideUser.innerHTML = `<div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div><div class="user-info"><strong>${user.name.split(' ')[0]}</strong><span>${roleLabel(user.role)}</span></div>`;
    const avatar = document.getElementById('topbar-avatar');
    if (avatar) avatar.textContent = user.name.charAt(0).toUpperCase();
  }

  function roleLabel(role) { return { aluno:'Aluno', professor:'Professor', empresa:'Empresa' }[role] || role; }

  function initChipInput(wrapperId, inputId, initialValues = []) {
    const wrap = document.getElementById(wrapperId);
    if (!wrap) return;
    let values = [...initialValues];
    function render() {
      wrap.innerHTML = values.map(v => `<span class="chip">${v}<button onclick="UI._removeChipVal('${wrapperId}', '${v.replace(/'/g,"\\'").replace(/"/g,'\\"')}')">×</button></span>`).join('') + `<input class="chip-input" id="${inputId}" placeholder="Digite e pressione Enter..." />`;
      const inp = wrap.querySelector('.chip-input');
      inp.addEventListener('keydown', function(e) {
        if ((e.key === 'Enter' || e.key === ',') && this.value.trim()) {
          e.preventDefault();
          const val = this.value.trim().replace(/,$/, '');
          if (val && !values.includes(val)) { values.push(val); render(); } else this.value = '';
        }
        if (e.key === 'Backspace' && !this.value && values.length) { values.pop(); render(); }
      });
    }
    wrap._getValues = () => values;
    wrap._setValues = (v) => { values = [...v]; render(); };
    wrap.addEventListener('click', () => wrap.querySelector('.chip-input')?.focus());
    render();
    return { getValues: () => values, setValues: (v) => { values = [...v]; render(); } };
  }

  function _removeChipVal(wrapperId, val) {
    const wrap = document.getElementById(wrapperId);
    if (!wrap || !wrap._getValues) return;
    const values = wrap._getValues().filter(v => v !== val);
    wrap._setValues(values);
  }

  function initAvatarUpload(previewId, inputId, currentFoto = '') {
    const preview = document.getElementById(previewId);
    const input   = document.getElementById(inputId);
    if (!preview || !input) return;
    if (currentFoto) preview.innerHTML = `<img src="${currentFoto}" alt="Avatar" />`; else preview.textContent = '📷';
    input.addEventListener('change', function() {
      const file = this.files[0];
      if (!file) return;
      if (file.size > 500000) { UI.toast('Imagem muito grande. Máx. 500KB.', 'error'); return; }
      const reader = new FileReader();
      reader.onload = e => { preview.innerHTML = `<img src="${e.target.result}" alt="Avatar" />`; };
      reader.readAsDataURL(file);
    });
  }

  function getAvatarData(inputId) {
    const input = document.getElementById(inputId);
    if (!input || !input.files || !input.files[0]) return Promise.resolve(null);
    return new Promise(res => { const reader = new FileReader(); reader.onload = e => res(e.target.result); reader.readAsDataURL(input.files[0]); });
  }

  function formatDate(str) {
    if (!str) return '';
    if (str.includes('T')) return new Date(str).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' });
    if (str.length === 7) { const [y,m] = str.split('-'); const months=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']; return `${months[parseInt(m)-1]} ${y}`; }
    return str;
  }

  function timeAgo(str) {
    const diff = Date.now() - new Date(str).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}min atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrás`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d atrás`;
    return formatDate(str);
  }

  function emptyState(icon, msg, btnHtml = '') { return `<div class="empty-state"><div class="empty-icon">${icon}</div><p>${msg}</p>${btnHtml}</div>`; }

  function scoreBar(score) {
    const color = score >= 80 ? '#16a34a' : score >= 50 ? '#2563eb' : '#d97706';
    return `<div class="progress-label"><span>Completude do Perfil</span><span style="color:${color};font-weight:700">${score}%</span></div><div class="progress-wrap"><div class="progress-bar" style="width:${score}%"></div></div>`;
  }

  function expIcon(tipo) { return { estagio:'💼', freelance:'🖥', projeto:'🚀', voluntario:'🤝' }[tipo] || '📁'; }

  return { showAlert, toast, openModal, closeModal, buildSidebar, initChipInput, _removeChipVal, initAvatarUpload, getAvatarData, formatDate, timeAgo, emptyState, scoreBar, expIcon, roleLabel };
})();

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
  document.getElementById('sidebar-overlay')?.classList.toggle('open');
}
