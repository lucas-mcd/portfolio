export const about = {
  name: 'Lucas Correa Macedo',
  role: 'Desenvolvedor Full Stack Python',
  summary: "Sou estudante de Engenharia de Software (6º período) na Estácio e Desenvolvedor Full Stack Python formado pela EBAC, com formação em Programação Full Stack pelo SENAI.",
  paragraphs: ["Estudante de Engenharia de Software (6º período) na Estácio, formado em Full Stack Python pela EBAC e em Programação Full-Stack pelo SENAI. Tenho experiência prática no desenvolvimento de sistemas backend com Python (Django, FastAPI, Flask), arquitetura de APIs REST e interfaces modernas com React e TypeScript. Aplico boas práticas de engenharia como Clean Code e SOLID em projetos modulares, focando na resolução de problemas, manutenibilidade e evolução de software. Atualmente, busco minha primeira oportunidade profissional como Desenvolvedor Full Stack Python Júnior."],
  languages: [{ name: 'Inglês', level: 'Fluente', institution: 'Fisk/MET' }],
};

// Links e descrições fornecidos pelo autor.
export const projects = [
  { id: 'cereon', title: 'E-commerce Loja Cereon (Full Stack)', technologies: ['Python', 'Django REST Framework', 'REST', 'React', 'Vite', 'Tailwind CSS', 'JWT', 'PIX', 'Mercado Pago', 'Cloudinary'], holograms: ['python', 'django', 'react', 'tailwindcss'], repositoryUrl: 'https://github.com/lucas-mcd/projeto_loja', liveUrl: 'https://projeto-loja-phi.vercel.app/', description: [
    'Plataforma de comércio eletrônico desenvolvida com arquitetura full stack, integrando uma vitrine virtual voltada ao usuário final e um painel administrativo (backoffice) para gestão completa de operações, inventário e pedidos.',
    'Desenvolvimento de API RESTful utilizando Python, Django REST Framework e autenticação JWT; implementação de rotinas transacionais para controle de estoque, motor de cupons, cálculo de frete via API e integração de pagamentos via PIX (Mercado Pago). Desenvolvimento da interface Single Page Application (SPA) responsiva com React, Vite, Tailwind CSS e armazenamento de mídias em nuvem (Cloudinary), resultando em um sistema otimizado com fluxo de compra seguro e painel gerencial.'
  ] },
  { id: 'erp', title: 'ERP System (Full Stack)', technologies: ['Python', 'FastAPI', 'SQLAlchemy', 'Pydantic', 'Alembic', 'PyJWT', 'JWT', 'REST', 'React', 'TypeScript', 'Vite', 'Tailwind CSS', 'React Router', 'MySQL', 'PostgreSQL', 'PyTest', 'Docker', 'Docker Compose'], repositoryUrl: 'https://github.com/lucas-mcd/ERPsystem', liveUrl: null, description: [
'Sistema ERP desenvolvido com arquitetura full stack, integrando uma plataforma de gestão empresarial para centralização de operações de RH, financeiro, vendas, estoque, fornecedores, relatórios e auditoria.',
'Desenvolvimento de API RESTful utilizando Python, FastAPI, SQLAlchemy, Pydantic, Alembic e PyJWT, com autenticação JWT baseada em diferentes níveis de acesso e implementação de validação, controle de segurança e registro de operações. Desenvolvimento da interface web utilizando React, TypeScript, Vite, Tailwind CSS e React Router, com integração ao backend e gerenciamento de diferentes módulos do sistema. Utilização de MySQL/PostgreSQL para persistência de dados, testes unitários e de integração com Pytest e suporte a execução do ambiente através de Docker e Docker Compose.'
] },
  { id: 'moto', title: 'Plataforma Concessionária Moto / Landing Page', technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'GSAP', 'ScrollTrigger', 'Vercel'], holograms: ['nextjs', 'react', 'typescript', 'tailwindcss'], repositoryUrl: 'https://github.com/lucas-mcd/motos', liveUrl: 'https://motos-steel.vercel.app/', description: [
    'Landing page frontend desenvolvida para uma concessionária de motocicletas, integrando catálogo interativo de modelos, apresentação de diferenciais da empresa e elementos de prova social, com foco em experiência do usuário e apresentação visual dos produtos.',
    'Desenvolvimento da interface utilizando Next.js, React, TypeScript e Tailwind CSS; implementação de componentes responsivos, navegação entre seções e animações de alta performance utilizando GSAP e ScrollTrigger, proporcionando uma experiência de usuário moderna e dinâmica. Deploy da aplicação em ambiente de produção através da Vercel.'
  ] },
  { id: 'loja-modelo', title: 'Loja Modelo / Landing Page', technologies: ['Astro', 'TypeScript', 'JavaScript', 'CSS3', 'Tailwind CSS', 'Vercel', 'Git', 'GitHub'], repositoryUrl: 'https://github.com/lucas-mcd/loja-modelo', liveUrl: 'https://loja-modelo-ten.vercel.app/', description: [
'Landing page frontend desenvolvida para apresentação de uma loja modelo, com foco na organização de produtos, estruturação de conteúdo e experiência do usuário.',
'Desenvolvimento da interface utilizando Astro, TypeScript, JavaScript, CSS e Tailwind CSS; implementação de estrutura baseada em componentes, páginas e assets estáticos, com foco em responsividade, organização do código e boas práticas de desenvolvimento frontend. Configuração do processo de build e deploy em ambiente de produção utilizando Vercel, com gerenciamento do código-fonte através de Git e GitHub.'
] },
];
export const skills = [
  { id: 'backend', category: 'Backend', items: ['Python', 'Django', 'Flask', 'REST', 'FastAPI', 'PostgreSQL', 'MySQL', 'SQLite', 'PyTest', 'Django REST Framework', 'SQLAlchemy', 'Pydantic', 'Alembic', 'PyJWT', 'JWT'] },
  { id: 'frontend', category: 'Frontend', items: ['HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Next.js', 'Astro', 'Tailwind CSS', 'React Router', 'GSAP', 'ScrollTrigger'] },
  { id: 'tools', category: 'Ferramentas', items: ['Git', 'Docker', 'PyCharm', 'VS Code', 'GitHub', 'Vite', 'Docker Compose'] },
  { id: 'integrations', category: 'Deploy e integrações', items: ['Vercel', 'Cloudinary', 'PIX', 'Mercado Pago'] },
];
export const education = [
  { id: "estacio", course: "Engenharia de Software", institution: "Estácio", status: "Cursando", summary: "Graduação sobre o ciclo de vida do software, da análise de requisitos ao projeto, implementação, testes e manutenção de sistemas.", detail: "6º período", grade: "CR geral 9,33" },
  { id: "ebac", course: "Full Stack Python", institution: "EBAC", status: "Concluído", summary: "Formação em desenvolvimento web com Python, integrando interfaces, lógica de servidor e bancos de dados em aplicações completas." },
  { id: "ebac-kotlin", course: "Desenvolvedor Android Kotlin", institution: "EBAC", status: "Concluído", summary: "Desenvolvimento Android nativo em Kotlin com arquitetura MVVM, integração de APIs REST, persistência local, Jetpack e boas práticas de UI e UX mobile." },
  { id: "fisk", course: "Inglês", institution: "Fisk / MET", status: "Fluente", summary: "Formação em língua inglesa com foco em compreensão oral, leitura, escrita e conversação.", detail: "Formação em língua inglesa" },
  { id: "senai", course: "Programação Full-Stack", institution: "SENAI", status: "Concluído", summary: "Formação em programação para a web, da construção de interfaces à implementação de serviços e integração com bancos de dados." },
  { id: "sycp", course: "Certified Pentester", institution: "Solyd", status: "Cursando", summary: "Testes de invasão em aplicações web, do reconhecimento à análise de vulnerabilidades, exploração de falhas do OWASP Top 10, pós-exploração e elaboração de relatórios técnicos.", credential: "SYCP" },
  { id: "sywp", course: "Wireless Pentester", institution: "Solyd", status: "Cursando", summary: "Auditoria de redes sem fio, com estudo de captura e quebra de handshakes, ataques Evil Twin, segurança dos protocolos WPA, WPA2 e WPA3 e defesa da infraestrutura Wi-Fi.", credential: "SYWP" },
  { id: "syh2", course: "Hardware Hacker", institution: "Solyd", status: "Cursando", summary: "Segurança de dispositivos físicos e embarcados, incluindo análise de circuitos, extração de firmware, interfaces UART, SPI e JTAG, ataques via USB e RFID e criação de gadgets de hacking.", credential: "SYH2" },
  { id: "syap", course: "App Pentester", institution: "Solyd", status: "Cursando", summary: "Segurança ofensiva de aplicações Android, com engenharia reversa de APKs, análise estática e dinâmica, bypass de SSL pinning e detecção de root e estudo de falhas em armazenamento e APIs.", credential: "SYAP" },
  { id: "syes", course: "Evasion Specialist", institution: "Solyd", status: "Cursando", summary: "Pós-exploração e evasão de defesas corporativas, com estudo de bypass de antivírus e EDR, ofuscação de payloads, técnicas furtivas em memória e persistência.", credential: "SYES" },
];
// Coloque o PDF em public e informe a URL relativa à BASE_URL, ex.: cv/lucas.pdf.
export const resume = { path: 'cv/Lucas_Correa_Macedo_CV.pdf' };
export const skillIcons = {
  Python: 'python', Django: 'django', Flask: 'flask', REST: 'rest', FastAPI: 'fastapi',
  PostgreSQL: 'postgresql', MySQL: 'mysql', SQLite: 'sqlite', PyTest: 'pytest',
  HTML5: 'html5', CSS3: 'css3', JavaScript: 'javascript', TypeScript: 'typescript',
  React: 'react', 'Vue.js': 'vuejs', Git: 'git', Docker: 'docker', PyCharm: 'pycharm', 'VS Code': 'vscode',
};
export const portfolioData = { about, projects, skills, education, resume };

export const socialLinks = [
  { id: 'linkedin', label: '[CONNECT://LINKEDIN]', url: 'https://www.linkedin.com/in/lucas-macedo-6655042a1/' },
  { id: 'github', label: '[CONNECT://GITHUB]', url: 'https://github.com/lucas-mcd' },
];

// Descrições das tecnologias, sem atribuir níveis de proficiência ao autor.
export const technologyDiagnostics = {
  "Python": {
    "name": "Python",
    "pt": {
      "type": "Linguagem de programação",
      "desc": "Linguagem de alto nível com sintaxe clara, usada em automações, scripts, processamento de dados e aplicações backend."
    },
    "en": {
      "type": "Programming language",
      "desc": "A high-level language with clear syntax, used for automation, scripting, data processing and backend applications."
    }
  },
  "Django": {
    "name": "Django",
    "pt": {
      "type": "Framework web",
      "desc": "Framework Python com ORM, autenticação e painel administrativo integrados para desenvolver aplicações web estruturadas."
    },
    "en": {
      "type": "Web framework",
      "desc": "A Python framework with an integrated ORM, authentication and admin interface for structured web applications."
    }
  },
  "Flask": {
    "name": "Flask",
    "pt": {
      "type": "Microframework web",
      "desc": "Estrutura minimalista e extensível em Python para APIs leves, microsserviços e aplicações web personalizadas."
    },
    "en": {
      "type": "Web microframework",
      "desc": "A minimal, extensible Python framework for lightweight APIs, microservices and custom web applications."
    }
  },
  "REST": {
    "name": "REST",
    "pt": {
      "type": "Estilo arquitetural",
      "desc": "Estilo de arquitetura para sistemas distribuídos, baseado em recursos, interfaces uniformes e comunicação sem estado."
    },
    "en": {
      "type": "Architectural style",
      "desc": "An architectural style for distributed systems based on resources, uniform interfaces and stateless communication."
    }
  },
  "FastAPI": {
    "name": "FastAPI",
    "pt": {
      "type": "Framework de APIs",
      "desc": "Framework Python para APIs com validação baseada em tipos, documentação OpenAPI e suporte a operações assíncronas."
    },
    "en": {
      "type": "API framework",
      "desc": "A Python API framework with type-based validation, OpenAPI documentation and support for asynchronous operations."
    }
  },
  "PostgreSQL": {
    "name": "PostgreSQL",
    "pt": {
      "type": "Banco de dados relacional",
      "desc": "Sistema de banco de dados com SQL, transações e recursos extensíveis para modelagem e consultas complexas."
    },
    "en": {
      "type": "Relational database",
      "desc": "A database system with SQL, transactions and extensible features for data modelling and complex queries."
    }
  },
  "MySQL": {
    "name": "MySQL",
    "pt": {
      "type": "Banco de dados relacional",
      "desc": "Sistema relacional baseado em SQL para persistência, organização e consulta de dados em aplicações."
    },
    "en": {
      "type": "Relational database",
      "desc": "A SQL-based relational system for storing, organising and querying application data."
    }
  },
  "SQLite": {
    "name": "SQLite",
    "pt": {
      "type": "Banco de dados embarcado",
      "desc": "Banco relacional embutido na aplicação, armazenado em arquivo e sem necessidade de um servidor separado."
    },
    "en": {
      "type": "Embedded database",
      "desc": "An embedded relational database stored in a file, with no separate database server required."
    }
  },
  "PyTest": {
    "name": "PyTest",
    "pt": {
      "type": "Framework de testes",
      "desc": "Ferramenta de testes para Python com assertions, fixtures e parametrização para verificar unidades e integrações."
    },
    "en": {
      "type": "Testing framework",
      "desc": "A Python testing tool with assertions, fixtures and parametrisation for checking units and integrations."
    }
  },
  "HTML5": {
    "name": "HTML5",
    "pt": {
      "type": "Linguagem de marcação",
      "desc": "Estrutura o conteúdo das páginas com elementos semânticos, formulários e suporte a conteúdo multimídia."
    },
    "en": {
      "type": "Markup language",
      "desc": "Structures page content through semantic elements, forms and support for multimedia content."
    }
  },
  "CSS3": {
    "name": "CSS3",
    "pt": {
      "type": "Linguagem de estilos",
      "desc": "Define apresentação, layouts responsivos, tipografia, transições e animações das interfaces web."
    },
    "en": {
      "type": "Style sheet language",
      "desc": "Defines presentation, responsive layouts, typography, transitions and animations for web interfaces."
    }
  },
  "JavaScript": {
    "name": "JavaScript",
    "pt": {
      "type": "Linguagem de programação",
      "desc": "Linguagem usada para interatividade, manipulação de interfaces e comunicação assíncrona em aplicações web."
    },
    "en": {
      "type": "Programming language",
      "desc": "A language used for interactivity, interface manipulation and asynchronous communication in web applications."
    }
  },
  "TypeScript": {
    "name": "TypeScript",
    "pt": {
      "type": "Linguagem de programação",
      "desc": "Estende JavaScript com um sistema de tipos estáticos para apoiar manutenção, refatoração e organização do código."
    },
    "en": {
      "type": "Programming language",
      "desc": "Extends JavaScript with a static type system to support maintenance, refactoring and code organisation."
    }
  },
  "React": {
    "name": "React",
    "pt": {
      "type": "Biblioteca de interfaces",
      "desc": "Biblioteca para construir interfaces declarativas com componentes reutilizáveis, estado e composição."
    },
    "en": {
      "type": "UI library",
      "desc": "A library for building declarative interfaces with reusable components, state and composition."
    }
  },
  "Vue.js": {
    "name": "Vue.js",
    "pt": {
      "type": "Framework de interfaces",
      "desc": "Framework progressivo com reatividade e componentes para construir interfaces e aplicações web."
    },
    "en": {
      "type": "UI framework",
      "desc": "A progressive framework with reactivity and components for building interfaces and web applications."
    }
  },
  "Git": {
    "name": "Git",
    "pt": {
      "type": "Controle de versões",
      "desc": "Sistema distribuído para registrar alterações, trabalhar com branches e integrar contribuições de uma equipe."
    },
    "en": {
      "type": "Version control",
      "desc": "A distributed system for tracking changes, working with branches and integrating team contributions."
    }
  },
  "Docker": {
    "name": "Docker",
    "pt": {
      "type": "Plataforma de contêineres",
      "desc": "Empacota aplicações e dependências em imagens para executar ambientes consistentes em contêineres."
    },
    "en": {
      "type": "Container platform",
      "desc": "Packages applications and dependencies into images to run consistent environments in containers."
    }
  },
  "PyCharm": {
    "name": "PyCharm",
    "pt": {
      "type": "Ambiente de desenvolvimento",
      "desc": "IDE voltada a Python com navegação de código, depuração, refatoração e integração com ferramentas de desenvolvimento."
    },
    "en": {
      "type": "Integrated development environment",
      "desc": "A Python-focused IDE with code navigation, debugging, refactoring and development tool integrations."
    }
  },
  "VS Code": {
    "name": "VS Code",
    "pt": {
      "type": "Editor de código",
      "desc": "Editor extensível com terminal integrado, depuração e suporte a diferentes linguagens por meio de extensões."
    },
    "en": {
      "type": "Code editor",
      "desc": "An extensible editor with an integrated terminal, debugging and support for different languages through extensions."
    }
  }
};

export function getTechnologyDiagnostic(name, language = "pt") {
  const entry = technologyDiagnostics[name];
  return entry ? { name: entry.name, ...entry[language === "en" ? "en" : "pt"] } : null;
}

export const institutionIcons = { 'Estácio': 'estacio', EBAC: 'ebac', SENAI: 'senai', 'Fisk / MET': 'fisk', Solyd: 'solyd' };

// Identificadores compartilhados por Skills e pelos grupos de hologramas.
skillIcons["Django REST Framework"] = "djangorest";
technologyDiagnostics["Django REST Framework"] = {"name": "Django REST Framework", "pt": {"type": "Framework de APIs", "desc": "Construção de APIs REST com Django."}, "en": {"type": "Technology", "desc": "REST APIs built with Django."}};
skillIcons["SQLAlchemy"] = "sqlalchemy";
technologyDiagnostics["SQLAlchemy"] = {"name": "SQLAlchemy", "pt": {"type": "ORM", "desc": "Mapeamento de modelos e acesso a bancos SQL."}, "en": {"type": "Technology", "desc": "Model mapping and SQL database access."}};
skillIcons["Pydantic"] = "pydantic";
technologyDiagnostics["Pydantic"] = {"name": "Pydantic", "pt": {"type": "Validação", "desc": "Validação de dados baseada em tipos Python."}, "en": {"type": "Technology", "desc": "Data validation using Python types."}};
skillIcons["Alembic"] = "alembic";
technologyDiagnostics["Alembic"] = {"name": "Alembic", "pt": {"type": "Migrações", "desc": "Versionamento do esquema do banco de dados."}, "en": {"type": "Technology", "desc": "Database schema migrations."}};
skillIcons["PyJWT"] = "pyjwt";
technologyDiagnostics["PyJWT"] = {"name": "PyJWT", "pt": {"type": "Autenticação", "desc": "Codificação e validação de tokens JWT em Python."}, "en": {"type": "Technology", "desc": "JWT encoding and validation in Python."}};
skillIcons["JWT"] = "jwt";
technologyDiagnostics["JWT"] = {"name": "JWT", "pt": {"type": "Autenticação", "desc": "Tokens assinados para transmissão de informações de autenticação."}, "en": {"type": "Technology", "desc": "Signed tokens for authentication information."}};
skillIcons["Next.js"] = "nextjs";
technologyDiagnostics["Next.js"] = {"name": "Next.js", "pt": {"type": "Framework web", "desc": "Aplicações React com roteamento e renderização integrada."}, "en": {"type": "Technology", "desc": "React applications with routing and integrated rendering."}};
skillIcons["Astro"] = "astro";
technologyDiagnostics["Astro"] = {"name": "Astro", "pt": {"type": "Framework web", "desc": "Páginas orientadas a conteúdo e componentes estáticos."}, "en": {"type": "Technology", "desc": "Content-focused pages and static components."}};
skillIcons["Tailwind CSS"] = "tailwindcss";
technologyDiagnostics["Tailwind CSS"] = {"name": "Tailwind CSS", "pt": {"type": "Estilização", "desc": "Interfaces responsivas com classes utilitárias."}, "en": {"type": "Technology", "desc": "Responsive interfaces using utility classes."}};
skillIcons["React Router"] = "reactrouter";
technologyDiagnostics["React Router"] = {"name": "React Router", "pt": {"type": "Roteamento", "desc": "Navegação e rotas em aplicações React."}, "en": {"type": "Technology", "desc": "Navigation and routing in React applications."}};
skillIcons["GSAP"] = "gsap";
technologyDiagnostics["GSAP"] = {"name": "GSAP", "pt": {"type": "Animação", "desc": "Animações e sequências coordenadas de interface."}, "en": {"type": "Technology", "desc": "Coordinated interface animations and timelines."}};
skillIcons["ScrollTrigger"] = "scrolltrigger";
technologyDiagnostics["ScrollTrigger"] = {"name": "ScrollTrigger", "pt": {"type": "Animação", "desc": "Controle de animações GSAP associado à rolagem."}, "en": {"type": "Technology", "desc": "Scroll-linked GSAP animation control."}};
skillIcons["GitHub"] = "github";
technologyDiagnostics["GitHub"] = {"name": "GitHub", "pt": {"type": "Versionamento", "desc": "Hospedagem e colaboração em repositórios Git."}, "en": {"type": "Technology", "desc": "Git repository hosting and collaboration."}};
skillIcons["Vite"] = "vitejs";
technologyDiagnostics["Vite"] = {"name": "Vite", "pt": {"type": "Build", "desc": "Servidor de desenvolvimento e build frontend."}, "en": {"type": "Technology", "desc": "Frontend development server and build tooling."}};
skillIcons["Docker Compose"] = "dockercompose";
technologyDiagnostics["Docker Compose"] = {"name": "Docker Compose", "pt": {"type": "Contêineres", "desc": "Configuração e execução de serviços em múltiplos contêineres."}, "en": {"type": "Technology", "desc": "Configuration and execution of multi-container services."}};
skillIcons["Vercel"] = "vercel";
technologyDiagnostics["Vercel"] = {"name": "Vercel", "pt": {"type": "Deploy", "desc": "Publicação e hospedagem de aplicações web."}, "en": {"type": "Technology", "desc": "Web application deployment and hosting."}};
skillIcons["Cloudinary"] = "cloudinary";
technologyDiagnostics["Cloudinary"] = {"name": "Cloudinary", "pt": {"type": "Mídia", "desc": "Armazenamento e distribuição de imagens em nuvem."}, "en": {"type": "Technology", "desc": "Cloud media storage and delivery."}};
skillIcons["PIX"] = "pix";
technologyDiagnostics["PIX"] = {"name": "PIX", "pt": {"type": "Pagamentos", "desc": "Integração de pagamentos instantâneos."}, "en": {"type": "Technology", "desc": "Instant payment integration."}};
skillIcons["Mercado Pago"] = "mercadopago";
technologyDiagnostics["Mercado Pago"] = {"name": "Mercado Pago", "pt": {"type": "Pagamentos", "desc": "Processamento de pagamentos integrado ao e-commerce."}, "en": {"type": "Technology", "desc": "Payment processing integrated into e-commerce."}};
skillIcons.Tailwind = 'tailwindcss';
for (const project of projects) project.holograms = [...new Set(project.technologies.map(name => skillIcons[name]).filter(Boolean))];
