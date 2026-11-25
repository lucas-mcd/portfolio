import { about, projects, education, skills } from './portfolioData.js';

const projectEnglish = {
  cereon: { title: 'Cereon E-commerce Store (Full Stack)', description: [
    'A full-stack e-commerce platform combining a customer-facing storefront with an administrative back office for managing operations, inventory and orders.',
    'Developed a RESTful API using Python, Django REST Framework and JWT authentication, including transactional inventory operations, a coupon engine, shipping calculations through an API and PIX payments through Mercado Pago. Built a responsive single-page application with React, Vite and Tailwind CSS, with cloud media storage through Cloudinary, delivering a streamlined checkout flow and management dashboard.'
  ] },
  erp: { title: 'ERP System (Full Stack)', description: [
    'A full-stack ERP platform that centralizes business operations across HR, finance, sales, inventory, suppliers, reporting and auditing.',
    'Developed a RESTful API using Python, FastAPI, SQLAlchemy, Pydantic, Alembic and PyJWT, with JWT authentication, multiple access levels, validation, security controls and operation logging. Built the web interface with React, TypeScript, Vite, Tailwind CSS and React Router, integrating backend services and business modules. Used MySQL/PostgreSQL for persistence, Pytest for unit and integration testing, and Docker with Docker Compose to run the environment.'
  ] },
  moto: { title: 'Motorcycle Dealership / Landing Page', description: [
    'A frontend landing page for a motorcycle dealership, combining an interactive model catalog, company highlights and social proof, with a focus on user experience and visual product presentation.',
    'Built the interface with Next.js, React, TypeScript and Tailwind CSS, implementing responsive components, section navigation and high-performance animations with GSAP and ScrollTrigger. Deployed the application to production on Vercel.'
  ] },
  'loja-modelo': { title: 'Model Store / Landing Page', description: [
    'A frontend landing page showcasing a model store, focused on product organization, content structure and user experience.',
    'Built the interface with Astro, TypeScript, JavaScript, CSS and Tailwind CSS, using components, pages and static assets with an emphasis on responsiveness, code organization and frontend best practices. Configured the production build and deployment on Vercel, with source control through Git and GitHub.'
  ] }
};
const educationEnglish = {
  'estacio': { status: "In progress", summary: "A degree covering the software lifecycle, from requirements analysis and design to implementation, testing and maintenance.", course: "Software Engineering", detail: "6th semester", grade: "Overall academic average (CR): 9.33/10" },
  'ebac': { status: "Completed", summary: "Web development with Python, connecting user interfaces, server-side logic and databases in complete applications.", course: "Full Stack Python" },
  'ebac-kotlin': { status: "Completed", summary: "Native Android development in Kotlin with MVVM architecture, REST API integration, local data storage, Jetpack and mobile UI and UX practices.", course: "Android Kotlin Developer" },
  'fisk': { status: "Fluent", summary: "English language studies covering listening, reading, writing and conversation.", course: "English", detail: "English language training" },
  'senai': { status: "Completed", summary: "Web programming from interface development to server-side services and database integration.", course: "Full-Stack Programming" },
  'sycp': { status: "In progress", summary: "Web application penetration testing, from reconnaissance and vulnerability analysis to OWASP Top 10 exploitation, post-exploitation and technical reporting." },
  'sywp': { status: "In progress", summary: "Wireless network auditing, including handshake capture and cracking, Evil Twin attacks, WPA, WPA2 and WPA3 security, and Wi-Fi infrastructure defense." },
  'syh2': { status: "In progress", summary: "Physical and embedded device security, including circuit analysis, firmware extraction, UART, SPI and JTAG interfaces, USB and RFID attacks, and hardware hacking tools." },
  'syap': { status: "In progress", summary: "Android application security, including APK reverse engineering, static and dynamic analysis, SSL pinning and root detection bypass, and vulnerabilities in storage and APIs." },
  'syes': { status: "In progress", summary: "Post-exploitation and evasion of enterprise defenses, covering antivirus and EDR bypass, payload obfuscation, in-memory stealth techniques and persistence." },
};
export const categoryName = (group, language) => language === 'en'
  ? ({ tools: 'Tools', integrations: 'Deployment & integrations' }[group.id] || group.category) : group.category;

function localize(language) {
  const english = language === 'en';
  return {
    about: english ? { ...about, role: 'Python Full Stack Developer',
      summary: 'I am a sixth-semester Software Engineering student at Estácio, a Full Stack Python graduate from EBAC, and a Full-Stack Programming graduate from SENAI.',
      paragraphs: ['I am a sixth-semester Software Engineering student at Estácio, with qualifications in Full Stack Python from EBAC and Full-Stack Programming from SENAI. I have practical experience building Python backend systems with Django, FastAPI and Flask, designing REST APIs, and developing modern interfaces with React and TypeScript. I apply engineering practices such as Clean Code and SOLID to modular projects, focusing on problem solving, maintainability and software evolution. I am currently seeking my first professional opportunity as a Junior Python Full Stack Developer.'],
      languages: [{ name: 'English', level: 'Fluent', institution: 'Fisk/MET' }]
    } : about,
    projects: projects.map(item => ({ ...item, ...(english ? projectEnglish[item.id] : {}), hoverKey: item.title })),
    education: education.map(item => ({ ...item, ...(english ? educationEnglish[item.id] : {}) })),
    skills: skills.map(group => ({ ...group, category: categoryName(group, language) }))
  };
}

const localized = { pt: localize('pt'), en: localize('en') };
export function getPortfolioContent(language) {
  return language === 'en' ? localized.en : localized.pt;
}
