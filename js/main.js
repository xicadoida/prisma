(function() {
  const user = Auth.requireAuth();
  if (!user) return;

  UI.buildSidebar(user);

  const page = window.location.pathname.split('/').pop() || 'dashboard.html';

  if (page === 'dashboard.html' || page === '') {
    if (user.role === 'aluno')     Aluno.renderDashboard(user);
    if (user.role === 'professor') Professor.renderDashboard(user);
    if (user.role === 'empresa')   Empresa.renderDashboard(user);
  }

  else if (page === 'perfil.html') {
    if (!document.getElementById('modal-perfil')) {
      const m = document.createElement('div');
      m.innerHTML = `<div class="modal-overlay hidden" id="modal-perfil"><div class="modal modal-lg"><div class="modal-header"><h3>Editar Perfil</h3><button class="modal-close" onclick="UI.closeModal('modal-perfil')">✕</button></div><div class="modal-body" id="modal-perfil-body"></div></div></div>`;
      document.body.appendChild(m.firstElementChild);
    }
    if (user.role === 'aluno')     Aluno.renderPerfil(user);
    if (user.role === 'professor') Professor.renderPerfil(user);
    if (user.role === 'empresa')   Empresa.renderPerfil(user);
  }

  else if (page === 'professores.html') {
    if (user.role !== 'professor') { window.location.href = 'dashboard.html'; return; }
    Professor.renderGerenciarAlunos(user);
  }

  else if (page === 'empresas.html') {
    if (user.role === 'empresa') {
      Empresa.renderBuscarTalentos(user);
    } else if (user.role === 'aluno') {
      renderExplorarVagas(user);
    } else {
      window.location.href = 'dashboard.html';
    }
  }

  function renderExplorarVagas(user) {
    document.getElementById('topbar-title').textContent = 'Explorar Empresas';
    const empresas = Auth.getUsers().filter(u => u.role === 'empresa');
    document.getElementById('page-content').innerHTML = `
      <div class="dashboard-welcome"><h2>Empresas na Plataforma</h2><p>Essas empresas estão buscando talentos como você. Complete seu perfil para ser encontrado!</p></div>
      <div class="talent-grid">
        ${empresas.length ? empresas.map(e=>`<div class="talent-card"><div class="talent-card-top"><div class="talent-avatar" style="font-size:1.6rem">🏢</div><div class="talent-info"><strong>${e.nomeEmpresa||e.name}</strong><div class="talent-uni">${e.setor||'—'}</div></div></div>${e.bio?`<p style="font-size:.82rem;color:var(--gray-600);margin-bottom:.75rem">${e.bio}</p>`:''}<div class="talent-card-footer"><span class="text-muted" style="font-size:.75rem">✅ Contratante verificada</span></div></div>`).join('') : UI.emptyState('🏢','Nenhuma empresa cadastrada ainda.')}
      </div>
      <div class="alert alert-info mt-2">💡 Complete seu perfil ao máximo para aumentar suas chances de ser encontrado!<a href="perfil.html" style="font-weight:700;margin-left:.5rem">Ir ao meu perfil →</a></div>`;
  }

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) { if (e.target === this) this.classList.add('hidden'); });
  });
})();
