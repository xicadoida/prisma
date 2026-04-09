const Empresa = (() => {
  let _currentAlunoId = null;

  function renderDashboard(user) {
    const contatos = Data.getContatosByEmpresa(user.id);
    const allAlunos = Auth.getUsers().filter(u => u.role === 'aluno');
    document.getElementById('topbar-title').textContent = 'Dashboard';
    document.getElementById('page-content').innerHTML = `
      <div class="dashboard-welcome"><h2>Olá, ${(user.nomeEmpresa||user.name).split(' ')[0]}! 👋</h2><p>${user.setor?user.setor+' · ':''}Plataforma de Talentos</p></div>
      <div class="stats-row">
        <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-value">${allAlunos.length}</div><div class="stat-label">Alunos Disponíveis</div></div>
        <div class="stat-card"><div class="stat-icon">✉️</div><div class="stat-value">${contatos.length}</div><div class="stat-label">Contatos Enviados</div></div>
        <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-value">${allAlunos.filter(u=>Data.getAtividades(u.id).length>0).length}</div><div class="stat-label">Com Projetos Orientados</div></div>
        <div class="stat-card"><div class="stat-icon">🏆</div><div class="stat-value">${allAlunos.filter(u=>Data.getCertificados(u.id).length>0).length}</div><div class="stat-label">Com Certificados</div></div>
      </div>
      <div class="grid-2 mt-2">
        <div class="card"><div class="card-header"><span class="card-title">✉️ Últimos Contatos Enviados</span><a href="empresas.html" class="btn btn-sm btn-outline">Buscar talentos</a></div>${contatos.length?renderContatosEmpresa(contatos):UI.emptyState('✉️','Nenhum contato enviado ainda.<br><a href="empresas.html">Buscar talentos agora</a>')}</div>
        <div class="card"><div class="card-header"><span class="card-title">🔥 Talentos em Destaque</span></div>${renderTalentosDestaque(allAlunos)}</div>
      </div>`;
  }

  function renderContatosEmpresa(contatos) {
    const allUsers = Auth.getUsers();
    return contatos.slice(-5).reverse().map(c => {
      const aluno = allUsers.find(u => u.id === c.alunoId);
      return `<div class="contact-item"><div class="contact-avatar">👤</div><div class="contact-body"><strong>${aluno?aluno.name:'—'}</strong><p>${c.mensagem.slice(0,60)}${c.mensagem.length>60?'...':''}</p><span class="contact-meta">${c.tipo==='entrevista'?'📅 Entrevista · ':''}${UI.timeAgo(c.criadoEm)}</span></div></div>`;
    }).join('');
  }

  function renderTalentosDestaque(alunos) {
    const top = alunos.map(a=>({...a,score:Data.calcScore(a.id)})).sort((a,b)=>b.score-a.score).slice(0,3);
    if (!top.length) return UI.emptyState('👥','Nenhum aluno cadastrado ainda.');
    return top.map(a=>`<div class="aluno-row"><div class="aluno-avatar">${a.name.charAt(0).toUpperCase()}</div><div class="aluno-info"><strong>${a.name}</strong><span>${a.universidade||'—'} · ${a.score}% completo</span></div><button class="btn btn-sm btn-primary" onclick="Empresa.openPerfilAluno('${a.id}')">Ver</button></div>`).join('');
  }

  function renderPerfil(user) {
    document.getElementById('topbar-title').textContent = 'Perfil da Empresa';
    document.getElementById('page-content').innerHTML = `
      <div class="profile-hero">
        <div class="profile-avatar-big">${user.foto?`<img src="${user.foto}"/>`:'🏢'}</div>
        <div class="profile-hero-info"><h2>${user.nomeEmpresa||user.name}</h2><p class="profile-sub">${user.setor||'Setor não informado'}</p></div>
        <div class="profile-hero-actions"><button class="btn btn-outline" onclick="Empresa.openEditPerfil()">✏️ Editar</button></div>
      </div>
      <div class="section-card"><div class="section-card-header"><h3>💬 Sobre a Empresa</h3></div><div class="section-card-body">${user.bio?`<p>${user.bio}</p>`:'<p class="text-muted">Nenhuma descrição adicionada.</p>'}</div></div>`;
  }

  function openEditPerfil() {
    const user = Auth.getCurrentUser();
    document.getElementById('modal-perfil-body').innerHTML = `
      <div class="form-group"><label>Nome da Empresa</label><input type="text" id="edit-nome-emp" value="${user.nomeEmpresa||user.name}" /></div>
      <div class="form-group"><label>Setor</label><input type="text" id="edit-setor" value="${user.setor||''}" /></div>
      <div class="form-group"><label>Descrição</label><textarea id="edit-bio" rows="3">${user.bio||''}</textarea></div>
      <div id="edit-alert" class="alert hidden"></div>
      <div style="display:flex;gap:.75rem;justify-content:flex-end;margin-top:.5rem"><button class="btn btn-outline" onclick="UI.closeModal('modal-perfil')">Cancelar</button><button class="btn btn-primary" onclick="Empresa.saveEditPerfil()">Salvar</button></div>`;
    UI.openModal('modal-perfil');
  }

  function saveEditPerfil() {
    const nome = document.getElementById('edit-nome-emp')?.value.trim();
    if (!nome) { UI.showAlert('edit-alert','Informe o nome da empresa.','error'); return; }
    Auth.updateUser({ nomeEmpresa: nome, setor: document.getElementById('edit-setor')?.value.trim()||'', bio: document.getElementById('edit-bio')?.value.trim()||'' });
    UI.closeModal('modal-perfil');
    UI.toast('Perfil atualizado!','success');
    renderPerfil(Auth.getCurrentUser());
  }

  function renderBuscarTalentos(user) {
    document.getElementById('topbar-title').textContent = 'Buscar Talentos';
    const alunos = Data.buscarAlunos();
    const unis = [...new Set(alunos.map(a=>a.universidade).filter(Boolean))];
    const competencias = [...new Set(alunos.flatMap(a=>a.competencias||[]))].slice(0,20);
    document.getElementById('page-content').innerHTML = `
      <div class="card mb-2">
        <div class="card-header"><span class="card-title">🔍 Filtros de Busca</span></div>
        <div style="padding:0 1.25rem 1.25rem">
          <div class="search-bar"><input type="text" id="talent-search" placeholder="Buscar por nome, curso, competência..." oninput="Empresa.doSearch()" /><button class="btn btn-primary" onclick="Empresa.doSearch()">Buscar</button></div>
          <div class="filters-row">
            <select id="filter-uni" onchange="Empresa.doSearch()"><option value="">Todas as universidades</option>${unis.map(u=>`<option value="${u}">${u}</option>`).join('')}</select>
            <select id="filter-comp" onchange="Empresa.doSearch()"><option value="">Todas as competências</option>${competencias.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
            <select id="filter-status" onchange="Empresa.doSearch()"><option value="">Qualquer status</option><option value="cursando">Cursando</option><option value="formado">Formado</option></select>
          </div>
        </div>
      </div>
      <div id="talent-count" class="text-muted mb-1" style="font-size:.85rem">${alunos.length} aluno${alunos.length!==1?'s':''} encontrado${alunos.length!==1?'s':''}</div>
      <div class="talent-grid" id="talent-grid">${renderTalentCards(alunos)}</div>`;
  }

  function doSearch() {
    const q   = document.getElementById('talent-search')?.value.trim()||'';
    const uni = document.getElementById('filter-uni')?.value||'';
    const comp= document.getElementById('filter-comp')?.value||'';
    const st  = document.getElementById('filter-status')?.value||'';
    const results = Data.buscarAlunos({ q, universidade: uni, competencia: comp, status: st });
    document.getElementById('talent-count').textContent = `${results.length} aluno${results.length!==1?'s':''} encontrado${results.length!==1?'s':''}`;
    document.getElementById('talent-grid').innerHTML = renderTalentCards(results);
  }

  function renderTalentCards(alunos) {
    if (!alunos.length) return `<div class="no-results" style="grid-column:1/-1"><div class="no-icon">🔍</div><p>Nenhum aluno encontrado com esses critérios.</p></div>`;
    return alunos.map(a => {
      const notas = Data.getNotas(a.id);
      const atividades = Data.getAtividades(a.id);
      return `<div class="talent-card" onclick="Empresa.openPerfilAluno('${a.id}')">
        <div class="talent-card-top">
          <div class="talent-avatar">${a.foto?`<img src="${a.foto}"/>`:`${a.name.charAt(0).toUpperCase()}`}</div>
          <div class="talent-info"><strong>${a.name}</strong><div class="talent-uni">🏫 ${a.universidade||'—'}</div><div class="talent-course">📚 ${a.curso||'—'}</div></div>
        </div>
        <div class="tags-wrap">${(a.competencias||[]).slice(0,4).map(c=>`<span class="tag">${c}</span>`).join('')}${(a.competencias||[]).length>4?`<span class="tag tag-gray">+${(a.competencias||[]).length-4}</span>`:''}</div>
        <div class="talent-card-footer">
          <div style="display:flex;flex-direction:column;gap:.2rem">${notas.length?`<div class="talent-nota-badge">🔒 Avaliação de professor</div>`:''} ${atividades.length?`<div style="font-size:.72rem;color:var(--green-700)">✓ ${atividades.length} projeto${atividades.length>1?'s':''} orientado${atividades.length>1?'s':''}</div>`:''}</div>
          <div class="talent-actions"><button class="btn btn-sm btn-primary" onclick="event.stopPropagation();Empresa.openContato('${a.id}','${a.name.replace(/'/g,"\\'")}')">✉ Contato</button></div>
        </div>
      </div>`;
    }).join('');
  }

  function openPerfilAluno(alunoId) {
    _currentAlunoId = alunoId;
    const aluno = Auth.getUsers().find(u => u.id === alunoId);
    if (!aluno) return;
    const exps = Data.getExperiencias(alunoId);
    const certs = Data.getCertificados(alunoId);
    const atividades = Data.getAtividades(alunoId);
    const notas = Data.getNotas(alunoId);

    document.getElementById('modal-perfil-aluno-body').innerHTML = `
      <div class="modal-profile-header">
        <div class="modal-profile-avatar">${aluno.foto?`<img src="${aluno.foto}"/>`:`${aluno.name.charAt(0).toUpperCase()}`}</div>
        <div class="modal-profile-info"><h3>${aluno.name}</h3><p>🏫 ${aluno.universidade||'—'} · 📚 ${aluno.curso||'—'}</p><p>${aluno.statusCurso==='formado'?'🎓 Formado':'📚 Cursando'}${aluno.anoSemestre?' · '+aluno.anoSemestre:''}</p><div class="tags-wrap mt-1">${(aluno.areasInteresse||[]).map(a=>`<span class="tag" style="background:rgba(255,255,255,.2);color:#fff">${a}</span>`).join('')}</div></div>
      </div>
      ${aluno.bio?`<div class="modal-section"><h4>💬 Sobre</h4><p style="font-size:.9rem;color:var(--gray-700)">${aluno.bio}</p></div>`:''}
      <div class="modal-section"><h4>⚡ Competências</h4><div class="tags-wrap">${(aluno.competencias||[]).map(c=>`<span class="tag">${c}</span>`).join('')||'<p class="text-muted">Nenhuma competência cadastrada.</p>'}</div></div>
      ${exps.length?`<div class="modal-section"><h4>💼 Experiências</h4>${exps.map(e=>`<div class="exp-item"><div class="exp-icon">${UI.expIcon(e.tipo)}</div><div class="exp-body"><strong>${e.titulo}</strong><div class="exp-company">${e.empresa||''}</div><div class="exp-date">${UI.formatDate(e.inicio)}${e.fim?' → '+UI.formatDate(e.fim):' → Atual'}</div><div class="exp-desc">${e.descricao||''}</div></div></div>`).join('')}</div>`:''}
      ${certs.length?`<div class="modal-section"><h4>🏆 Certificados</h4>${certs.map(c=>`<div class="cert-item"><div class="cert-icon">🏅</div><div class="cert-body"><strong>${c.nome}</strong><span>${c.emissor} · ${UI.formatDate(c.data)}</span></div></div>`).join('')}</div>`:''}
      ${atividades.length?`<div class="modal-section"><h4>🎓 Projetos Orientados por Professores</h4>${atividades.map(a=>`<div class="atividade-item"><div class="ativ-badge">✓ Validado por Professor</div><strong>${a.titulo}</strong><p>${a.descricao}</p>${(a.tags||[]).length?`<div class="tags-wrap mt-1">${a.tags.map(t=>`<span class="tag tag-green">${t}</span>`).join('')}</div>`:''}<div class="ativ-meta">Por ${a.professorNome} · Papel: ${a.papel||'—'}</div></div>`).join('')}</div>`:''}
      <div class="modal-section"><h4>🔒 Avaliações de Professores</h4>${notas.length?notas.map(n=>`<div class="nota-privada-box"><div class="nota-header">🔒 Avaliação de ${n.professorNome}</div><p>${n.conteudo}</p><div class="nota-meta">Atualizada em ${UI.formatDate(n.atualizadoEm)}</div></div>`).join(''):'<p class="text-muted">Nenhuma avaliação de professor disponível.</p>'}</div>`;

    document.getElementById('btn-contato-modal').dataset.alunoId = alunoId;
    document.getElementById('btn-contato-modal').dataset.alunoNome = aluno.name;
    UI.openModal('modal-perfil-aluno');
  }

  function openContatoFromModal() {
    const btn = document.getElementById('btn-contato-modal');
    UI.closeModal('modal-perfil-aluno');
    openContato(btn.dataset.alunoId, btn.dataset.alunoNome);
  }

  function openContato(alunoId, alunoNome) {
    _currentAlunoId = alunoId;
    document.getElementById('contato-aluno-id').value = alunoId;
    document.getElementById('contato-aluno-nome').textContent = alunoNome;
    document.getElementById('contato-msg').value = '';
    document.getElementById('contato-data').value = '';
    const tipoSel = document.getElementById('contato-tipo');
    tipoSel.value = 'mensagem';
    document.getElementById('contato-entrevista-fields')?.classList.add('hidden');
    tipoSel.onchange = function() { const ef=document.getElementById('contato-entrevista-fields'); if(this.value==='entrevista') ef?.classList.remove('hidden'); else ef?.classList.add('hidden'); };
    UI.openModal('modal-contato');
  }

  function sendContato() {
    const alunoId = document.getElementById('contato-aluno-id')?.value;
    const msg     = document.getElementById('contato-msg')?.value.trim();
    const tipo    = document.getElementById('contato-tipo')?.value;
    const dataEnt = document.getElementById('contato-data')?.value;
    if (!msg) { UI.showAlert('contato-alert','Escreva uma mensagem.','error'); return; }
    const empresa = Auth.getCurrentUser();
    Data.addContato({ empresaId: empresa.id, empresaNome: empresa.nomeEmpresa||empresa.name, alunoId, mensagem: msg, tipo, dataEntrevista: tipo==='entrevista'?dataEnt:'' });
    UI.closeModal('modal-contato');
    UI.toast('Mensagem enviada com sucesso!', 'success');
  }

  return { renderDashboard, renderPerfil, openEditPerfil, saveEditPerfil, renderBuscarTalentos, doSearch, openPerfilAluno, openContato, openContatoFromModal, sendContato };
})();
