const Professor = (() => {

  function renderDashboard(user) {
    const atividades = Data.getAtividadesByProfessor(user.id);
    const alunosIds = [...new Set(atividades.map(a => a.alunoId))];
    const allUsers = Auth.getUsers();
    document.getElementById('topbar-title').textContent = 'Dashboard';
    document.getElementById('page-content').innerHTML = `
      <div class="dashboard-welcome"><h2>Olá, ${user.name.split(' ')[0]}! 👋</h2><p>${user.universidade||''} ${user.departamento?'· '+user.departamento:''}</p></div>
      <div class="stats-row">
        <div class="stat-card"><div class="stat-icon">🎓</div><div class="stat-value">${alunosIds.length}</div><div class="stat-label">Alunos Orientados</div></div>
        <div class="stat-card"><div class="stat-icon">📋</div><div class="stat-value">${atividades.length}</div><div class="stat-label">Atividades Registradas</div></div>
        <div class="stat-card"><div class="stat-icon">🔒</div><div class="stat-value">${alunosIds.filter(id=>Data.getNotas(id).length>0).length}</div><div class="stat-label">Alunos com Nota Privada</div></div>
        <div class="stat-card"><div class="stat-icon">👁️</div><div class="stat-value">${allUsers.filter(u=>u.role==='aluno').length}</div><div class="stat-label">Alunos na Plataforma</div></div>
      </div>
      <div class="grid-2 mt-2">
        <div class="card">
          <div class="card-header"><span class="card-title">🎓 Últimas Atividades Registradas</span><a href="professores.html" class="btn btn-sm btn-outline">Ver todos</a></div>
          ${atividades.length ? atividades.slice(-4).reverse().map(a => { const aluno=allUsers.find(u=>u.id===a.alunoId); return `<div class="contact-item"><div class="contact-avatar">🎓</div><div class="contact-body"><strong>${a.titulo}</strong><p>Aluno: ${aluno?aluno.name:'—'}</p><span class="contact-meta">${UI.timeAgo(a.criadoEm)}</span></div></div>`; }).join('') : UI.emptyState('📋','Nenhuma atividade registrada ainda.<br><a href="professores.html">Ir para Meus Alunos</a>')}
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">💡 Como usar a plataforma</span></div>
          <div style="padding:.5rem 0">
            <div class="contact-item"><div class="contact-avatar">1️⃣</div><div class="contact-body"><strong>Busque um aluno cadastrado</strong><p>Vá em "Meus Alunos" e procure pelo nome</p></div></div>
            <div class="contact-item"><div class="contact-avatar">2️⃣</div><div class="contact-body"><strong>Adicione um projeto ao perfil</strong><p>Registre atividades extracurriculares com tags</p></div></div>
            <div class="contact-item"><div class="contact-avatar">3️⃣</div><div class="contact-body"><strong>Crie uma anotação privada</strong><p>Sua avaliação chega direto para as empresas</p></div></div>
          </div>
        </div>
      </div>`;
  }

  function renderPerfil(user) {
    document.getElementById('topbar-title').textContent = 'Meu Perfil';
    document.getElementById('page-content').innerHTML = `
      <div class="profile-hero">
        <div class="profile-avatar-big">${user.foto?`<img src="${user.foto}"/>`:`${user.name.charAt(0).toUpperCase()}`}</div>
        <div class="profile-hero-info"><h2>${user.name}</h2><p class="profile-sub">${user.universidade||'Universidade não informada'}${user.departamento?' · '+user.departamento:''}</p></div>
        <div class="profile-hero-actions"><button class="btn btn-outline" onclick="Professor.openEditPerfil()">✏️ Editar Perfil</button></div>
      </div>
      <div class="section-card"><div class="section-card-header"><h3>💬 Sobre</h3></div><div class="section-card-body">${user.bio?`<p>${user.bio}</p>`:'<p class="text-muted">Nenhuma bio adicionada.</p>'}</div></div>`;
  }

  function openEditPerfil() {
    const user = Auth.getCurrentUser();
    document.getElementById('modal-perfil-body').innerHTML = `
      <div class="avatar-upload"><div class="avatar-preview" id="avatar-preview">${user.foto?`<img src="${user.foto}"/>`:'📷'}</div><label for="avatar-input">📷 Trocar foto</label><input type="file" id="avatar-input" accept="image/*" /></div>
      <div class="form-group"><label>Nome completo</label><input type="text" id="edit-name" value="${user.name}" /></div>
      <div class="form-group"><label>Bio</label><textarea id="edit-bio" rows="3">${user.bio||''}</textarea></div>
      <div class="form-row"><div class="form-group"><label>Universidade</label><input type="text" id="edit-uni" value="${user.universidade||''}" /></div><div class="form-group"><label>Departamento</label><input type="text" id="edit-depto" value="${user.departamento||''}" /></div></div>
      <div id="edit-alert" class="alert hidden"></div>
      <div style="display:flex;gap:.75rem;justify-content:flex-end;margin-top:.5rem"><button class="btn btn-outline" onclick="UI.closeModal('modal-perfil')">Cancelar</button><button class="btn btn-primary" onclick="Professor.saveEditPerfil()">Salvar</button></div>`;
    UI.initAvatarUpload('avatar-preview', 'avatar-input', user.foto);
    UI.openModal('modal-perfil');
  }

  async function saveEditPerfil() {
    const name = document.getElementById('edit-name')?.value.trim();
    if (!name) { UI.showAlert('edit-alert','Informe seu nome.','error'); return; }
    const updates = { name, bio: document.getElementById('edit-bio')?.value.trim()||'', universidade: document.getElementById('edit-uni')?.value.trim()||'', departamento: document.getElementById('edit-depto')?.value.trim()||'' };
    const avatarData = await UI.getAvatarData('avatar-input');
    if (avatarData) updates.foto = avatarData;
    Auth.updateUser(updates);
    UI.closeModal('modal-perfil');
    UI.toast('Perfil atualizado!', 'success');
    renderPerfil(Auth.getCurrentUser());
  }

  function renderGerenciarAlunos(user) {
    document.getElementById('topbar-title').textContent = 'Meus Alunos';
    document.getElementById('page-content').innerHTML = `
      <div class="card mb-2">
        <div class="card-header"><span class="card-title">🔍 Buscar aluno na plataforma</span></div>
        <div style="padding:0 1.25rem 1.25rem">
          <div class="search-bar"><input type="text" id="aluno-search" placeholder="Nome ou e-mail do aluno..." oninput="Professor.filterAlunos()" /></div>
          <div id="search-results" class="hidden"><p class="text-muted mb-1" style="font-size:.82rem">Resultados:</p><div id="search-list"></div></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">🎓 Alunos que Orientei</span><span class="badge badge-blue">${[...new Set(Data.getAtividadesByProfessor(user.id).map(a=>a.alunoId))].length}</span></div>
        <div id="alunos-orientados-list">${renderAlunosOrientados(user)}</div>
      </div>`;
  }

  function renderAlunosOrientados(user) {
    const atividades = Data.getAtividadesByProfessor(user.id);
    const alunosIds = [...new Set(atividades.map(a => a.alunoId))];
    if (!alunosIds.length) return UI.emptyState('🎓','Nenhum aluno orientado ainda.<br>Use a busca acima para encontrar alunos.');
    const allUsers = Auth.getUsers();
    return alunosIds.map(id => {
      const aluno = allUsers.find(u => u.id === id);
      if (!aluno) return '';
      const qtdAtiv = atividades.filter(a => a.alunoId === id).length;
      const nota = Data.getNotaByProfAluno(user.id, id);
      return `<div class="aluno-row"><div class="aluno-avatar">${aluno.name.charAt(0).toUpperCase()}</div><div class="aluno-info"><strong>${aluno.name}</strong><span>${aluno.universidade||'—'} · ${aluno.curso||'—'} · ${qtdAtiv} atividade${qtdAtiv!==1?'s':''}</span></div><div class="aluno-actions">${nota?`<button class="btn btn-sm btn-ghost" onclick="Professor.verNota('${aluno.id}','${aluno.name.replace(/'/g,"\\'")}')">🔒 Nota</button>`:''}<button class="btn btn-sm btn-outline" onclick="Professor.openAddAtividade('${aluno.id}','${aluno.name.replace(/'/g,"\\'")}')">+ Atividade</button><button class="btn btn-sm btn-green" onclick="Professor.openNota('${aluno.id}','${aluno.name.replace(/'/g,"\\'")}')">🔒 ${nota?'Editar':'Anotar'}</button></div></div>`;
    }).join('');
  }

  function filterAlunos() {
    const q = document.getElementById('aluno-search')?.value.trim().toLowerCase();
    const results = document.getElementById('search-results');
    const list = document.getElementById('search-list');
    if (!q || q.length < 2) { results?.classList.add('hidden'); return; }
    const found = Auth.getUsers().filter(u => u.role === 'aluno' && (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
    results?.classList.remove('hidden');
    if (!found.length) { list.innerHTML = '<p class="text-muted">Nenhum aluno encontrado.</p>'; return; }
    list.innerHTML = found.map(a => `<div class="aluno-row" style="border:1px solid var(--gray-200);border-radius:var(--radius-md);margin-bottom:.5rem"><div class="aluno-avatar">${a.name.charAt(0).toUpperCase()}</div><div class="aluno-info"><strong>${a.name}</strong><span>${a.universidade||'—'} · ${a.curso||'—'} · ${a.email}</span></div><div class="aluno-actions"><button class="btn btn-sm btn-outline" onclick="Professor.openAddAtividade('${a.id}','${a.name.replace(/'/g,"\\'")}')">+ Atividade</button><button class="btn btn-sm btn-green" onclick="Professor.openNota('${a.id}','${a.name.replace(/'/g,"\\'")}')">🔒 Anotar</button></div></div>`).join('');
  }

  function openAddAtividade(alunoId, alunoNome) {
    document.getElementById('ativ-aluno-id').value = alunoId;
    document.getElementById('ativ-aluno-nome').textContent = alunoNome;
    ['ativ-titulo','ativ-desc','ativ-inicio','ativ-fim','ativ-tags','ativ-papel'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
    UI.openModal('modal-atividade');
  }

  function saveAtividade() {
    const titulo = document.getElementById('ativ-titulo')?.value.trim();
    const alunoId = document.getElementById('ativ-aluno-id')?.value;
    if (!titulo) { UI.showAlert('ativ-alert','Informe o título da atividade.','error'); return; }
    if (!alunoId) { UI.showAlert('ativ-alert','Aluno não identificado.','error'); return; }
    const user = Auth.getCurrentUser();
    const tagsRaw = document.getElementById('ativ-tags')?.value || '';
    const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
    Data.addAtividade({ alunoId, professorId: user.id, professorNome: user.name, titulo, descricao: document.getElementById('ativ-desc')?.value.trim()||'', inicio: document.getElementById('ativ-inicio')?.value||'', fim: document.getElementById('ativ-fim')?.value||'', tags, papel: document.getElementById('ativ-papel')?.value.trim()||'' });
    UI.closeModal('modal-atividade');
    UI.toast('Atividade adicionada ao perfil do aluno!', 'success');
    document.getElementById('alunos-orientados-list').innerHTML = renderAlunosOrientados(user);
  }

  function openNota(alunoId, alunoNome) {
    const user = Auth.getCurrentUser();
    const nota = Data.getNotaByProfAluno(user.id, alunoId);
    document.getElementById('nota-aluno-id').value = alunoId;
    document.getElementById('nota-aluno-nome').textContent = alunoNome;
    document.getElementById('nota-conteudo').value = nota ? nota.conteudo : '';
    document.getElementById('nota-char').textContent = `${(nota?.conteudo||'').length} / 800 caracteres`;
    document.getElementById('nota-conteudo').oninput = function() { document.getElementById('nota-char').textContent = `${this.value.length} / 800 caracteres`; };
    UI.openModal('modal-nota');
  }

  function saveNota() {
    const conteudo = document.getElementById('nota-conteudo')?.value.trim();
    const alunoId  = document.getElementById('nota-aluno-id')?.value;
    if (!conteudo) { UI.showAlert('nota-alert','Escreva a anotação.','error'); return; }
    if (!alunoId)  { UI.showAlert('nota-alert','Aluno não identificado.','error'); return; }
    const user = Auth.getCurrentUser();
    Data.saveNota({ alunoId, professorId: user.id, professorNome: user.name, conteudo });
    UI.closeModal('modal-nota');
    UI.toast('Anotação salva! Visível apenas para empresas.', 'success');
    document.getElementById('alunos-orientados-list').innerHTML = renderAlunosOrientados(user);
  }

  function verNota(alunoId, alunoNome) {
    const user = Auth.getCurrentUser();
    const nota = Data.getNotaByProfAluno(user.id, alunoId);
    document.getElementById('ver-nota-nome').textContent = alunoNome;
    document.getElementById('modal-ver-nota-body').innerHTML = nota ? `<div class="nota-privada-box"><div class="nota-header">🔒 Anotação Privada (visível só para empresas)</div><p>${nota.conteudo}</p><div class="nota-meta">Atualizada em ${UI.formatDate(nota.atualizadoEm)}</div></div>` : UI.emptyState('🔒','Nenhuma anotação para este aluno.');
    document.getElementById('btn-editar-nota').onclick = () => { UI.closeModal('modal-ver-nota'); openNota(alunoId, alunoNome); };
    UI.openModal('modal-ver-nota');
  }

  return { renderDashboard, renderPerfil, openEditPerfil, saveEditPerfil, renderGerenciarAlunos, filterAlunos, openAddAtividade, saveAtividade, openNota, saveNota, verNota };
})();
