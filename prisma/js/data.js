const Data = (() => {
  const KEYS = { users:'cj_users', experiencias:'cj_experiencias', certificados:'cj_certificados', atividades:'cj_atividades', notas:'cj_notas', contatos:'cj_contatos' };
  function get(key) { return JSON.parse(localStorage.getItem(key) || '[]'); }
  function set(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
  function getUsers() { return Auth.getUsers(); }

  function getExperiencias(alunoId) { return get(KEYS.experiencias).filter(e => e.alunoId === alunoId); }
  function addExperiencia(exp) { const all = get(KEYS.experiencias); exp.id = 'exp_' + Date.now(); exp.criadoEm = new Date().toISOString(); all.push(exp); set(KEYS.experiencias, all); return exp; }
  function removeExperiencia(id) { set(KEYS.experiencias, get(KEYS.experiencias).filter(e => e.id !== id)); }

  function getCertificados(alunoId) { return get(KEYS.certificados).filter(c => c.alunoId === alunoId); }
  function addCertificado(cert) { const all = get(KEYS.certificados); cert.id = 'cert_' + Date.now(); cert.criadoEm = new Date().toISOString(); all.push(cert); set(KEYS.certificados, all); return cert; }
  function removeCertificado(id) { set(KEYS.certificados, get(KEYS.certificados).filter(c => c.id !== id)); }

  function getAtividades(alunoId) { return get(KEYS.atividades).filter(a => a.alunoId === alunoId); }
  function getAtividadesByProfessor(profId) { return get(KEYS.atividades).filter(a => a.professorId === profId); }
  function addAtividade(ativ) { const all = get(KEYS.atividades); ativ.id = 'ativ_' + Date.now(); ativ.criadoEm = new Date().toISOString(); all.push(ativ); set(KEYS.atividades, all); return ativ; }
  function removeAtividade(id) { set(KEYS.atividades, get(KEYS.atividades).filter(a => a.id !== id)); }

  function getNotas(alunoId) { return get(KEYS.notas).filter(n => n.alunoId === alunoId); }
  function getNotaByProfAluno(profId, alunoId) { return get(KEYS.notas).find(n => n.professorId === profId && n.alunoId === alunoId) || null; }
  function saveNota(nota) {
    const all = get(KEYS.notas);
    const idx = all.findIndex(n => n.professorId === nota.professorId && n.alunoId === nota.alunoId);
    if (idx >= 0) { all[idx] = { ...all[idx], ...nota, atualizadoEm: new Date().toISOString() }; }
    else { nota.id = 'nota_' + Date.now(); nota.criadoEm = new Date().toISOString(); nota.atualizadoEm = nota.criadoEm; all.push(nota); }
    set(KEYS.notas, all);
  }

  function getContatosByAluno(alunoId) { return get(KEYS.contatos).filter(c => c.alunoId === alunoId); }
  function getContatosByEmpresa(empresaId) { return get(KEYS.contatos).filter(c => c.empresaId === empresaId); }
  function addContato(contato) { const all = get(KEYS.contatos); contato.id = 'cont_' + Date.now(); contato.criadoEm = new Date().toISOString(); contato.lido = false; all.push(contato); set(KEYS.contatos, all); return contato; }
  function marcarLido(id) { const all = get(KEYS.contatos); const idx = all.findIndex(c => c.id === id); if (idx >= 0) { all[idx].lido = true; set(KEYS.contatos, all); } }

  function seedDemoData() {
    const users = Auth.getUsers();
    if (users.some(u => u.email === 'aluno@demo.com')) return;
    const demoUsers = [
      { id: 'demo_aluno', name: 'Lucas Ferreira', email: 'aluno@demo.com', password: btoa('demo123'), role: 'aluno', universidade: 'UFMG', curso: 'Ciência da Computação', statusCurso: 'cursando', anoSemestre: '7º Semestre', bio: 'Desenvolvedor apaixonado por tecnologia e inovação. Busco minha primeira oportunidade em desenvolvimento web full-stack.', foto: '', competencias: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'], areasInteresse: ['Desenvolvimento Web', 'Inteligência Artificial', 'Cloud Computing'], links: { github: 'github.com/lucas-dev', portfolio: 'lucasdev.com.br', linkedin: '' }, createdAt: new Date().toISOString() },
      { id: 'demo_professor', name: 'Dra. Ana Paula Ribeiro', email: 'professor@demo.com', password: btoa('demo123'), role: 'professor', universidade: 'UFMG', departamento: 'Engenharia de Software', bio: 'Professora de Engenharia de Software com 12 anos de experiência.', foto: '', competencias: [], areasInteresse: [], links: { github: '', portfolio: '', linkedin: '' }, createdAt: new Date().toISOString() },
      { id: 'demo_empresa', name: 'Carla Mendes', email: 'empresa@demo.com', password: btoa('demo123'), role: 'empresa', nomeEmpresa: 'TechStart Ltda.', setor: 'Tecnologia', bio: 'Startup de fintech em crescimento acelerado.', foto: '', competencias: [], areasInteresse: [], links: { github: '', portfolio: '', linkedin: '' }, createdAt: new Date().toISOString() }
    ];
    localStorage.setItem('cj_users', JSON.stringify([...users, ...demoUsers]));

    const exps = [
      { id: 'exp_d1', alunoId: 'demo_aluno', tipo: 'estagio', titulo: 'Desenvolvedor Frontend Jr.', empresa: 'WebAgência BH', inicio: '2024-03', fim: '2024-09', descricao: 'Desenvolvimento de interfaces com React e integração com APIs REST. Participei de 3 projetos entregues em produção.', criadoEm: new Date().toISOString() },
      { id: 'exp_d2', alunoId: 'demo_aluno', tipo: 'projeto', titulo: 'App de Finanças Pessoais', empresa: 'Projeto Pessoal', inicio: '2023-06', fim: '2023-12', descricao: 'Aplicativo mobile desenvolvido em React Native com Node.js no backend. +500 downloads na Play Store.', criadoEm: new Date().toISOString() }
    ];
    const certs = [
      { id: 'cert_d1', alunoId: 'demo_aluno', nome: 'JavaScript Moderno (ES6+)', emissor: 'Alura', data: '2024-02', validade: '', criadoEm: new Date().toISOString() },
      { id: 'cert_d2', alunoId: 'demo_aluno', nome: 'React do Zero ao Avançado', emissor: 'Udemy', data: '2024-05', validade: '', criadoEm: new Date().toISOString() },
      { id: 'cert_d3', alunoId: 'demo_aluno', nome: 'AWS Cloud Practitioner', emissor: 'Amazon Web Services', data: '2024-08', validade: '2027-08', criadoEm: new Date().toISOString() }
    ];
    const atividades = [
      { id: 'ativ_d1', alunoId: 'demo_aluno', professorId: 'demo_professor', professorNome: 'Dra. Ana Paula Ribeiro', titulo: 'TCC — Sistema Inteligente de Recomendação de Vagas', descricao: 'Desenvolvimento de um sistema de recomendação usando Machine Learning para conectar candidatos a vagas de emprego. O aluno foi o desenvolvedor principal do projeto.', inicio: '2024-08', fim: '2025-06', tags: ['Python', 'Machine Learning', 'FastAPI', 'PostgreSQL'], papel: 'Desenvolvedor Principal', criadoEm: new Date().toISOString() },
      { id: 'ativ_d2', alunoId: 'demo_aluno', professorId: 'demo_professor', professorNome: 'Dra. Ana Paula Ribeiro', titulo: 'Projeto de Extensão — Inclusão Digital', descricao: 'Projeto de ensino de programação para jovens em situação de vulnerabilidade social. Lucas foi monitor voluntário e criou todo o material didático.', inicio: '2023-03', fim: '2023-12', tags: ['Educação', 'JavaScript', 'HTML', 'CSS'], papel: 'Monitor e Criador de Conteúdo', criadoEm: new Date().toISOString() }
    ];
    const notas = [
      { id: 'nota_d1', alunoId: 'demo_aluno', professorId: 'demo_professor', professorNome: 'Dra. Ana Paula Ribeiro', conteudo: 'Lucas é um dos melhores alunos que orientei nos últimos 3 anos. Destaca-se pela capacidade de resolver problemas complexos de forma autônoma e pela qualidade do código que produz. Demonstrou excelente trabalho em equipe durante o projeto de extensão e liderança natural entre os colegas. Recomendo fortemente para posições júnior a pleno em desenvolvimento de software.', criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() }
    ];

    set(KEYS.experiencias, [...get(KEYS.experiencias), ...exps]);
    set(KEYS.certificados, [...get(KEYS.certificados), ...certs]);
    set(KEYS.atividades,   [...get(KEYS.atividades),   ...atividades]);
    set(KEYS.notas,        [...get(KEYS.notas),        ...notas]);
  }

  function buscarAlunos({ q = '', universidade = '', competencia = '', status = '' } = {}) {
    return Auth.getUsers().filter(u => u.role === 'aluno').filter(u => {
      const qLow = q.toLowerCase();
      const matchQ = !q || u.name.toLowerCase().includes(qLow) || (u.curso&&u.curso.toLowerCase().includes(qLow)) || (u.bio&&u.bio.toLowerCase().includes(qLow)) || (u.competencias&&u.competencias.some(c=>c.toLowerCase().includes(qLow)));
      const matchUni  = !universidade || (u.universidade&&u.universidade.toLowerCase().includes(universidade.toLowerCase()));
      const matchComp = !competencia  || (u.competencias&&u.competencias.some(c=>c.toLowerCase().includes(competencia.toLowerCase())));
      const matchSt   = !status || u.statusCurso === status;
      return matchQ && matchUni && matchComp && matchSt;
    });
  }

  function calcScore(alunoId) {
    const user = Auth.getUsers().find(u => u.id === alunoId);
    if (!user) return 0;
    let score = 0;
    if (user.bio) score += 15;
    if (user.foto) score += 10;
    if (user.universidade) score += 10;
    if ((user.competencias||[]).length >= 3) score += 15;
    if ((user.areasInteresse||[]).length >= 1) score += 5;
    if (getExperiencias(alunoId).length >= 1) score += 20;
    if (getCertificados(alunoId).length >= 1) score += 15;
    if (getAtividades(alunoId).length >= 1)   score += 10;
    return Math.min(score, 100);
  }

  function getAlunoStats(alunoId) {
    return { experiencias: getExperiencias(alunoId).length, certificados: getCertificados(alunoId).length, atividades: getAtividades(alunoId).length, contatos: getContatosByAluno(alunoId).length, score: calcScore(alunoId) };
  }

  return { getUsers, getExperiencias, addExperiencia, removeExperiencia, getCertificados, addCertificado, removeCertificado, getAtividades, getAtividadesByProfessor, addAtividade, removeAtividade, getNotas, getNotaByProfAluno, saveNota, getContatosByAluno, getContatosByEmpresa, addContato, marcarLido, buscarAlunos, getAlunoStats, calcScore, seedDemoData };
})();
