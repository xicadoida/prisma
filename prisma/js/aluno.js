const Aluno = (() => {

  function renderDashboard(user) {
    const stats = Data.getAlunoStats(user.id);
    const contatos = Data.getContatosByAluno(user.id);
    const naoLidos = contatos.filter(c => !c.lido).length;
    document.getElementById('topbar-title').textContent = 'Dashboard';
    document.getElementById('page-content').innerHTML = `
      <div class="dashboard-welcome"><h2>Olá, ${user.name.split(' ')[0]}! 👋</h2><p>Bem-vindo de volta à CapacitaJob.</p></div>
      <div class="stats-row">
        <div class="stat-card"><div class="stat-icon">📊</div><div class="stat-value">${stats.score}%</div><div class="stat-label">Completude do Perfil</div></div>
        <div class="stat-card"><div class="stat-icon">💼</div><div class="stat-value">${stats.experiencias}</div><div class="stat-label">Experiências</div></div>
        <div class="stat-card"><div class="stat-icon">🏆</div><div class="stat-value">${stats.certificados}</div><div class="stat-label">Certificados</div></div>
        <div class="stat-card"><div class="stat-icon">✉️</div><div class="stat-value">${contatos.length}${naoLidos > 0 ? `<span class="badge badge-blue" style="font-size:.6rem;vertical-align:top;margin-left:4px">${naoLidos}</span>` : ''}</div><div class="stat-label">Contatos de Empresas</div></div>
      </div>
      ${UI.scoreBar(stats.score)}
      ${stats.score < 80 ? `<div class="card mt-2 mb-2" style="border-left:4px solid var(--blue-500)"><div class="card-header"><span class="card-title">💡 Dicas para melhorar seu perfil</span></div><div style="padding:0 1.25rem 1.25rem">${!user.bio?'<p class="text-muted mt-1">• Adicione uma bio profissional</p>':''}${!user.foto?'<p class="text-muted mt-1">• Adicione uma foto ao seu perfil</p>':''}${(user.competencias||[]).length<3?'<p class="text-muted mt-1">• Adicione pelo menos 3 competências</p>':''}${stats.experiencias<1?'<p class="text-muted mt-1">• Cadastre uma experiência profissional</p>':''}${stats.certificados<1?'<p class="text-muted mt-1">• Adicione um certificado</p>':''}</div></div>` : `<div class="alert alert-success mt-2 mb-2">🎉 Perfil excelente! Você está bem posicionado para ser encontrado por empresas.</div>`}
      <div class="grid-2 mt-2">
        <div class="card"><div class="card-header"><span class="card-title">📬 Últimas Mensagens</span>${naoLidos>0?`<span class="badge badge-blue">${naoLidos} nova${naoLidos>1?'s':''}</span>`:''}</div>${renderContatosPreview(contatos)}</div>
        <div class="card"><div class="card-title" style="padding:1.25rem 1.25rem .75rem">🎓 Atividades Orientadas</div>${renderAtividadesPreview(user.id)}</div>
      </div>`;
  }

  function renderContatosPreview(contatos) {
    if (!contatos.length) return UI.emptyState('📭', 'Nenhuma mensagem ainda.<br>Complete seu perfil para ser encontrado!');
    const users = Auth.getUsers();
    return contatos.slice(-3).reverse().map(c => {
      const empresa = users.find(u => u.id === c.empresaId);
      if (c.lido === false) Data.marcarLido(c.id);
      return `<div class="contact-item ${!c.lido?'contact-unread':''}"><div class="contact-avatar">🏢</div><div class="contact-body"><strong>${empresa?(empresa.nomeEmpresa||empresa.name):'Empresa'}</strong><p>${c.mensagem.slice(0,80)}${c.mensagem.length>80?'...':''}</p><span class="contact-meta">${c.tipo==='entrevista'?'📅 Convite para entrevista · ':''}${UI.timeAgo(c.criadoEm)}</span></div></div>`;
    }).join('');
  }

  function renderAtividadesPreview(alunoId) {
    const atividades = Data.getAtividades(alunoId);
    if (!atividades.length) return UI.emptyState('🎓', 'Nenhuma atividade orientada ainda.');
    return atividades.slice(-2).map(a => `<div class="atividade-item"><div class="ativ-badge">✓ Validado por Professor</div><strong>${a.titulo}</strong><p>${a.descricao.slice(0,80)}${a.descricao.length>80?'...':''}</p><div class="ativ-meta">Por ${a.professorNome} · ${UI.formatDate(a.criadoEm)}</div></div>`).join('');
  }

  function renderPerfil(user) {
    const stats = Data.getAlunoStats(user.id);
    const exps = Data.getExperiencias(user.id);
    const certs = Data.getCertificados(user.id);
    const atividades = Data.getAtividades(user.id);
    document.getElementById('topbar-title').textContent = 'Meu Perfil';
    document.getElementById('page-content').innerHTML = `
      <div class="profile-hero">
        <div class="profile-avatar-big">${user.foto?`<img src="${user.foto}"/>`:`${user.name.charAt(0).toUpperCase()}`}</div>
        <div class="profile-hero-info">
          <h2>${user.name}</h2>
          <p class="profile-sub">${user.universidade||'Universidade não informada'} · ${user.curso||'Curso não informado'} · <span class="pill-status pill-${user.statusCurso||'cursando'}">${user.statusCurso==='formado'?'🎓 Formado':'📚 Cursando'}</span>${user.anoSemestre?' · '+user.anoSemestre:''}</p>
          <div class="tags-wrap">${(user.areasInteresse||[]).map(a=>`<span class="tag">${a}</span>`).join('')}</div>
        </div>
        <div class="profile-hero-actions">
          <button class="btn btn-outline" onclick="Aluno.openEditPerfil()">✏️ Editar Perfil</button>
          <button class="btn btn-primary" onclick="UI.toast('Link copiado: capacitajob.app/u/${user.id}','info')">🔗 Compartilhar</button>
        </div>
      </div>
      <div class="card mb-2">${UI.scoreBar(stats.score)}${stats.score<100?'<p class="text-muted mt-1" style="font-size:.8rem">Complete seu perfil para aparecer mais nas buscas das empresas.</p>':''}</div>
      <div class="profile-sections">
        <div class="section-card"><div class="section-card-header"><h3>💬 Sobre mim</h3><button class="btn btn-sm btn-ghost" onclick="Aluno.openEditPerfil()">Editar</button></div><div class="section-card-body">${user.bio?`<p style="color:var(--gray-700);font-size:.9rem;line-height:1.7">${user.bio}</p>`:'<p class="text-muted">Nenhuma bio adicionada ainda.</p>'}${(user.competencias||[]).length?`<div class="tags-wrap mt-2">${user.competencias.map(c=>`<span class="tag">${c}</span>`).join('')}</div>`:''}${user.links?renderLinks(user.links):''}</div></div>
        <div class="section-card"><div class="section-card-header"><h3>💼 Experiências</h3><button class="btn btn-sm btn-primary" onclick="Aluno.openAddExp()">+ Adicionar</button></div><div class="section-card-body" id="exps-list">${exps.length?exps.map(e=>renderExpItem(e)).join(''):UI.emptyState('💼','Nenhuma experiência cadastrada.')}</div></div>
        <div class="section-card"><div class="section-card-header"><h3>🏆 Certificados</h3><button class="btn btn-sm btn-primary" onclick="Aluno.openAddCert()">+ Adicionar</button></div><div class="section-card-body" id="certs-list">${certs.length?certs.map(c=>renderCertItem(c)).join(''):UI.emptyState('🏆','Nenhum certificado adicionado.')}</div></div>
        <div class="section-card"><div class="section-card-header"><h3>🎓 Projetos Orientados por Professores</h3></div><div class="section-card-body">${atividades.length?atividades.map(a=>renderAtividadeItem(a)).join(''):UI.emptyState('🎓','Nenhum projeto orientado por professor ainda.<br>Peça ao seu professor para adicionar projetos ao seu perfil!')}</div></div>
      </div>`;
  }

  function renderLinks(links) {
    const items = [];
    if (links.github)    items.push(`<a href="https://${links.github}" target="_blank" class="tag tag-gray">🐙 GitHub</a>`);
    if (links.portfolio) items.push(`<a href="https://${links.portfolio}" target="_blank" class="tag tag-gray">🌐 Portfólio</a>`);
    if (links.linkedin)  items.push(`<a href="https://${links.linkedin}" target="_blank" class="tag tag-gray">💼 LinkedIn</a>`);
    return items.length ? `<div class="tags-wrap mt-2">${items.join('')}</div>` : '';
  }

  function renderExpItem(e) {
    return `<div class="exp-item"><div class="exp-icon">${UI.expIcon(e.tipo)}</div><div class="exp-body"><strong>${e.titulo}</strong><div class="exp-company">${e.empresa||''}</div><div class="exp-date">${UI.formatDate(e.inicio)}${e.fim?' → '+UI.formatDate(e.fim):' → Atual'}</div><div class="exp-desc">${e.descricao||''}</div></div><div class="exp-actions"><button class="btn btn-icon btn-ghost btn-sm" onclick="Aluno.removeExp('${e.id}')" title="Remover">🗑</button></div></div>`;
  }

  function renderCertItem(c) {
    return `<div class="cert-item"><div class="cert-icon">🏅</div><div class="cert-body" style="flex:1"><strong>${c.nome}</strong><span>${c.emissor} · ${UI.formatDate(c.data)}${c.validade?' (válido até '+UI.formatDate(c.validade)+')':''}</span></div><button class="btn btn-icon btn-ghost btn-sm" onclick="Aluno.removeCert('${c.id}')" title="Remover">🗑</button></div>`;
  }

  function renderAtividadeItem(a) {
    return `<div class="atividade-item"><div class="ativ-badge">✓ Validado por Professor</div><strong>${a.titulo}</strong><p>${a.descricao}</p>${(a.tags||[]).length?`<div class="tags-wrap mt-1">${a.tags.map(t=>`<span class="tag tag-green">${t}</span>`).join('')}</div>`:''}<div class="ativ-meta">Por <strong>${a.professorNome}</strong> · ${a.inicio?UI.formatDate(a.inicio):''} ${a.fim?'→ '+UI.formatDate(a.fim):''} · Papel: ${a.papel||'—'}</div></div>`;
  }

  function openEditPerfil() {
    const user = Auth.getCurrentUser();
    document.getElementById('modal-perfil-body').innerHTML = `
      <div class="avatar-upload"><div class="avatar-preview" id="avatar-preview">${user.foto?`<img src="${user.foto}"/>`:'📷'}</div><label for="avatar-input">📷 Trocar foto</label><input type="file" id="avatar-input" accept="image/*" /></div>
      <div class="form-group"><label>Nome completo</label><input type="text" id="edit-name" value="${user.name}" /></div>
      <div class="form-group"><label>Bio profissional</label><textarea id="edit-bio" rows="3" maxlength="300">${user.bio||''}</textarea></div>
      <div class="form-row"><div class="form-group"><label>Universidade</label><input type="text" id="edit-uni" value="${user.universidade||''}" /></div><div class="form-group"><label>Curso</label><input type="text" id="edit-curso" value="${user.curso||''}" /></div></div>
      <div class="form-row"><div class="form-group"><label>Status</label><select id="edit-status"><option value="cursando" ${user.statusCurso==='cursando'?'selected':''}>Cursando</option><option value="formado" ${user.statusCurso==='formado'?'selected':''}>Formado</option></select></div><div class="form-group"><label>Semestre / Ano</label><input type="text" id="edit-periodo" value="${user.anoSemestre||''}" placeholder="Ex: 7º sem / 2025" /></div></div>
      <div class="form-group"><label>Competências</label><div class="chip-input-wrap" id="chip-comp-wrap"></div></div>
      <div class="form-group"><label>Áreas de Interesse</label><div class="chip-input-wrap" id="chip-area-wrap"></div></div>
      <div class="form-group"><label>GitHub</label><input type="text" id="edit-github" value="${(user.links||{}).github||''}" placeholder="github.com/seuperfil" /></div>
      <div class="form-group"><label>Portfólio</label><input type="text" id="edit-portfolio" value="${(user.links||{}).portfolio||''}" placeholder="seusite.com.br" /></div>
      <div class="form-group"><label>LinkedIn</label><input type="text" id="edit-linkedin" value="${(user.links||{}).linkedin||''}" placeholder="linkedin.com/in/seuperfil" /></div>
      <div id="edit-alert" class="alert hidden"></div>
      <div style="display:flex;gap:.75rem;justify-content:flex-end;margin-top:.5rem"><button class="btn btn-outline" onclick="UI.closeModal('modal-perfil')">Cancelar</button><button class="btn btn-primary" onclick="Aluno.saveEditPerfil()">Salvar alterações</button></div>`;
    const compChips = UI.initChipInput('chip-comp-wrap', 'chip-comp-input', user.competencias || []);
    const areaChips = UI.initChipInput('chip-area-wrap', 'chip-area-input', user.areasInteresse || []);
    UI.initAvatarUpload('avatar-preview', 'avatar-input', user.foto);
    window._editChips = { comp: compChips, area: areaChips };
    UI.openModal('modal-perfil');
  }

  async function saveEditPerfil() {
    const name = document.getElementById('edit-name')?.value.trim();
    if (!name) { UI.showAlert('edit-alert', 'Informe seu nome.', 'error'); return; }
    const updates = {
      name, bio: document.getElementById('edit-bio')?.value.trim()||'',
      universidade: document.getElementById('edit-uni')?.value.trim()||'',
      curso: document.getElementById('edit-curso')?.value.trim()||'',
      statusCurso: document.getElementById('edit-status')?.value||'cursando',
      anoSemestre: document.getElementById('edit-periodo')?.value.trim()||'',
      competencias: window._editChips?.comp?.getValues()||[],
      areasInteresse: window._editChips?.area?.getValues()||[],
      links: { github: document.getElementById('edit-github')?.value.trim()||'', portfolio: document.getElementById('edit-portfolio')?.value.trim()||'', linkedin: document.getElementById('edit-linkedin')?.value.trim()||'' }
    };
    const avatarData = await UI.getAvatarData('avatar-input');
    if (avatarData) updates.foto = avatarData;
    Auth.updateUser(updates);
    UI.closeModal('modal-perfil');
    UI.toast('Perfil atualizado com sucesso!', 'success');
    const updatedUser = Auth.getCurrentUser();
    const page = window.location.pathname.split('/').pop();
    if (page === 'perfil.html') renderPerfil(updatedUser); else renderDashboard(updatedUser);
  }

  function openAddExp() {
    ['exp-tipo','exp-titulo','exp-empresa','exp-inicio','exp-fim','exp-desc'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
    UI.openModal('modal-exp');
  }

  function saveExperiencia() {
    const titulo = document.getElementById('exp-titulo')?.value.trim();
    if (!titulo) { UI.showAlert('exp-alert', 'Informe o título.', 'error'); return; }
    const user = Auth.getCurrentUser();
    Data.addExperiencia({ alunoId: user.id, tipo: document.getElementById('exp-tipo').value, titulo, empresa: document.getElementById('exp-empresa').value.trim(), inicio: document.getElementById('exp-inicio').value, fim: document.getElementById('exp-fim').value, descricao: document.getElementById('exp-desc').value.trim() });
    UI.closeModal('modal-exp');
    UI.toast('Experiência adicionada!', 'success');
    renderPerfil(Auth.getCurrentUser());
  }

  function removeExp(id) {
    if (!confirm('Remover esta experiência?')) return;
    Data.removeExperiencia(id);
    renderPerfil(Auth.getCurrentUser());
    UI.toast('Experiência removida.', 'info');
  }

  function openAddCert() {
    ['cert-nome','cert-emissor','cert-data','cert-validade'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
    UI.openModal('modal-cert');
  }

  function saveCertificado() {
    const nome = document.getElementById('cert-nome')?.value.trim();
    if (!nome) { UI.showAlert('cert-alert', 'Informe o nome do certificado.', 'error'); return; }
    const user = Auth.getCurrentUser();
    Data.addCertificado({ alunoId: user.id, nome, emissor: document.getElementById('cert-emissor').value.trim(), data: document.getElementById('cert-data').value, validade: document.getElementById('cert-validade').value });
    UI.closeModal('modal-cert');
    UI.toast('Certificado adicionado!', 'success');
    renderPerfil(Auth.getCurrentUser());
  }

  function removeCert(id) {
    if (!confirm('Remover este certificado?')) return;
    Data.removeCertificado(id);
    renderPerfil(Auth.getCurrentUser());
    UI.toast('Certificado removido.', 'info');
  }

  return { renderDashboard, renderPerfil, openEditPerfil, saveEditPerfil, openAddExp, saveExperiencia, removeExp, openAddCert, saveCertificado, removeCert };
})();
