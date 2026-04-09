# ⚡ CapacitaJob

Plataforma de capacitação profissional e empregabilidade que conecta alunos, professores e empresas.

## 🚀 Como usar

1. Abra `index.html` em qualquer navegador moderno
2. Use as contas de demonstração na tela de login
3. Escolha seu perfil e explore as funcionalidades

> Não precisa de servidor. Tudo roda localmente via `localStorage`.

## 🧪 Contas de demonstração

| Role       | E-mail               | Senha    |
|------------|----------------------|----------|
| Aluno      | aluno@demo.com       | demo123  |
| Professor  | professor@demo.com   | demo123  |
| Empresa    | empresa@demo.com     | demo123  |

Clique nos botões de demo na tela de login — os dados são criados automaticamente.

## 🗂 Estrutura

```
capacitajob/
├── index.html          Landing page
├── login.html          Login + contas demo
├── register.html       Cadastro em 2 etapas
├── dashboard.html      Dashboard por role
├── perfil.html         Perfil editável
├── professores.html    Painel do professor
├── empresas.html       Busca de talentos / Explorar
├── css/style.css       Estilos completos
├── js/
│   ├── auth.js         Autenticação
│   ├── data.js         Dados + seed demo
│   ├── ui.js           Helpers de interface
│   ├── aluno.js        Funcionalidades do aluno
│   ├── professor.js    Funcionalidades do professor
│   ├── empresa.js      Funcionalidades da empresa
│   └── main.js         Roteamento
└── assets/images/
```

## ✨ Funcionalidades por role

**Aluno:** perfil completo, experiências, certificados, projetos orientados por professor, barra de completude, mensagens de empresas.

**Professor:** buscar alunos, adicionar projetos ao perfil, anotações privadas (visíveis só para empresas).

**Empresa:** busca avançada com filtros, ver perfil completo, anotações de professores, enviar mensagem ou convite de entrevista.
