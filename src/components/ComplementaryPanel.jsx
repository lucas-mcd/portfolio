import { usePortfolioStore } from '../store/usePortfolioStore';

const courses = [
  {
    id: 'basico', issuer: 'Hackers do Bem', name: { pt: 'Básico', en: 'Basic' }, hours: 64, width: 1115, height: 788,
    topics: {
      pt: [
        'Compreender os tipos, modelos e conceitos da computação em nuvem',
        'Compreender os principais conceitos de desenvolvimento',
        'Identificar as principais ameaças cibernéticas',
        'Compreender os principais elementos associados a vulnerabilidades',
        'Compreender as principais aplicações de criptografia (1 e 2)',
        'Compreender os principais elementos relacionados a Governança, Riscos e Compliance (1 e 2)',
      ],
      en: [
        'Understand cloud computing types, models and concepts',
        'Understand core development concepts',
        'Identify major cyber threats',
        'Understand the main elements associated with vulnerabilities',
        'Understand the main applications of cryptography (1 and 2)',
        'Understand the main elements of governance, risk and compliance (1 and 2)',
      ],
    },
  },
  {
    id: 'nivelamento', issuer: 'Hackers do Bem', name: { pt: 'Nivelamento', en: 'Foundations' }, hours: 80, width: 1113, height: 791,
    topics: {
      pt: [
        'Introdução à cibersegurança',
        'Identificar componentes de hardware de computador',
        'Compreender a internet e a camada de acesso à rede',
        'Compreender o acesso à rede e a camada de internet (IP)',
        'Compreender IPv6 e a camada de transporte',
        'Compreender a camada de aplicação e os serviços de rede',
        'Utilizar sistemas operacionais Windows',
        'Utilizar sistemas operacionais Linux',
        'Lógica de programação',
        'Desenvolvimento de scripts',
      ],
      en: [
        'Introduction to cybersecurity',
        'Identify computer hardware components',
        'Understand the internet and the network access layer',
        'Understand network access and the internet layer (IP)',
        'Understand IPv6 and the transport layer',
        'Understand the application layer and network services',
        'Use Windows operating systems',
        'Use Linux operating systems',
        'Programming logic',
        'Script development',
      ],
    },
  },
  {
    id: 'pericia', issuer: 'IBSEC', width: 1014, height: 780,
    name: { pt: 'Perícia Digital, Investigação e Prevenção a Fraudes na Era da IA', en: 'Digital Forensics, Investigation and Fraud Prevention in the AI Era' },
    topics: {
      pt: [
        'Compreender os fundamentos da perícia digital, evidência e valor probatório',
        'Aplicar a cadeia de custódia e os requisitos legais do Pacote Anticrime (Lei 13.964/2019)',
        'Executar protocolos de primeiro respondente e preservação de dispositivos suspeitos',
        'Aplicar a ordem de volatilidade na coleta de dados em memória RAM e discos',
        'Utilizar hashes de integridade, write blockers e técnicas de imagem forense',
        'Identificar fraudes financeiras, corporativas, em meios de pagamento (PIX e cartão) e engenharia social',
        'Detectar fraudes com inteligência artificial, incluindo deepfakes, clonagem de voz e documentos falsificados',
        'Aplicar o uso supervisionado de IA como apoio na triagem de investigações digitais',
        'Compreender o Marco Civil da Internet e a LGPD no acesso e preservação de dados e logs',
        'Distinguir os papéis e limites de atuação entre TI, investigador corporativo, assistente técnico e perito judicial',
      ],
      en: [
        'Understand the foundations of digital forensics, evidence and probative value',
        'Apply chain of custody procedures and the legal requirements of Brazil’s Anti-Crime Package (Law 13.964/2019)',
        'Follow first responder protocols and preserve devices under suspicion',
        'Apply the order of volatility when collecting data from RAM and disks',
        'Use integrity hashes, write blockers and forensic imaging techniques',
        'Identify financial, corporate and payment fraud (PIX and cards), as well as social engineering',
        'Detect AI-enabled fraud, including deepfakes, voice cloning and forged documents',
        'Use supervised AI assistance to triage digital investigations',
        'Understand Brazil’s Internet Civil Framework and LGPD in relation to accessing and preserving data and logs',
        'Distinguish the roles and limits of IT staff, corporate investigators, technical assistants and court-appointed experts',
      ],
    },
  },
  {
    id: 'python', issuer: 'IBSEC', width: 1014, height: 784,
    name: { pt: 'Python para Cibersegurança', en: 'Python for Cybersecurity' },
    topics: {
      pt: [
        'Lógica de programação aplicada', 'Diagramação de sistemas', 'Fundamentos da linguagem Python',
        'Desenvolvimento de módulos e scripts', 'Convenções e sintaxe Python', 'Execução e depuração de código',
        'Compatibilidade multiplataforma', 'Ambiente interativo Python (REPL)', 'Estruturas de dados e manipulação',
      ],
      en: [
        'Applied programming logic', 'System diagramming', 'Python language fundamentals',
        'Developing modules and scripts', 'Python conventions and syntax', 'Running and debugging code',
        'Cross-platform compatibility', 'The interactive Python environment (REPL)', 'Data structures and manipulation',
      ],
    },
  },
  {
    id: 'analista-soc', issuer: 'IBSEC', width: 1015, height: 783,
    name: { pt: 'Analista SOC na Era da IA', en: 'SOC Analyst in the AI Era' },
    topics: {
      pt: [
        'Princípios CIA (Confidencialidade, Integridade, Disponibilidade)',
        'Identificação de ameaças, vulnerabilidades e riscos',
        'Tipos de ataque: phishing, malware, ransomware, DDoS, dia zero',
        'Phishing gerado por IA: personalização, vetores modernos e ausência de erros gramaticais',
        'Vishing com voz clonada, deepfake em videoconferência e BEC potencializado por IA',
        'Ataques de supply chain, slopsquatting e backdoors em software legítimo',
        'SIEM, IDS/IPS e análise de logs',
        'SIEM com IA: detecção adaptativa, enriquecimento de alertas e papel do analista',
        'Análise de tráfego de rede e identificação de exfiltração',
        'Detecção por assinatura vs. detecção comportamental',
        'UEBA: conceito, casos de uso e gestão de falsos positivos',
        'SOAR: automação de resposta, ações reversíveis vs. irreversíveis e aprovação humana',
        'Integração SIEM + UEBA + SOAR e novo papel do analista Tier 1',
        'Prompt injection em ferramentas e agentes de IA no SOC',
        'Menor privilégio, human-in-the-loop e higiene com IA generativa',
        'Ciclo de vida do incidente: preparação, contenção, erradicação e recuperação',
        'Triagem, escalonamento e resposta a ransomware ativo',
        'Forense inicial: ordem de volatilidade, preservação de evidências e cadeia de custódia',
        'Comunicação e documentação de incidentes',
        'MFA: eficácia e limitações (fadiga de MFA, SIM swapping)',
        'Menor privilégio e gestão de contas privilegiadas',
        'LGPD para o SOC: dado pessoal sensível, prazo ANPD e papel do analista vs. DPO',
        'Regra 3-2-1, backups imutáveis, RTO e RPO',
        'Políticas de segurança, conscientização e patches',
        'Plano de resposta a incidentes vs. plano de continuidade de negócios',
      ],
      en: [
        'CIA principles (confidentiality, integrity and availability)',
        'Identifying threats, vulnerabilities and risks',
        'Attack types: phishing, malware, ransomware, DDoS and zero-day attacks',
        'AI-generated phishing: personalization, modern vectors and grammatically correct messages',
        'Voice-cloning vishing, video conference deepfakes and AI-enhanced business email compromise',
        'Supply chain attacks, slopsquatting and backdoors in legitimate software',
        'SIEM, IDS/IPS and log analysis',
        'AI-enabled SIEM: adaptive detection, alert enrichment and the analyst’s role',
        'Network traffic analysis and detection of data exfiltration',
        'Signature-based and behavioral detection',
        'UEBA concepts, use cases and false positive management',
        'SOAR: automated response, reversible and irreversible actions, and human approval',
        'Integrating SIEM, UEBA and SOAR and the evolving role of the Tier 1 analyst',
        'Prompt injection in SOC AI tools and agents',
        'Least privilege, human oversight and safe practices with generative AI',
        'Incident lifecycle: preparation, containment, eradication and recovery',
        'Triage, escalation and response to active ransomware',
        'Initial forensics: order of volatility, evidence preservation and chain of custody',
        'Incident communication and documentation',
        'MFA effectiveness and limitations, including MFA fatigue and SIM swapping',
        'Least privilege and privileged account management',
        'Brazil’s LGPD for the SOC: sensitive personal data, ANPD deadlines and the roles of the analyst and DPO',
        'The 3-2-1 rule, immutable backups, RTO and RPO',
        'Security policies, awareness and patching',
        'Incident response plans and business continuity plans',
      ],
    },
  },
  {
    id: 'malware', issuer: 'IBSEC', width: 1016, height: 782,
    name: { pt: 'Malware: Prevenção, Proteção e Resposta na Era da IA', en: 'Malware: Prevention, Protection and Response in the AI Era' },
    topics: {
      pt: [
        'Tipos de ameaças: funcionamento e diferenças entre vírus, worms, trojans, ransomware, spyware, rootkits, botnets e malwares sem arquivo (fileless).',
        'Vetores de ataque: diferença entre falha (CVE), exploração (exploit) e ameaça, além dos canais de entrada (phishing, engenharia social, USB, supply chain).',
        'Prevenção e arquitetura: uso e limites de Antivírus/EDR, gestão de atualizações (patches), segmentação de rede e estratégia de backups (regra 3-2-1).',
        'Detecção e resposta: identificação de sinais de invasão e IOCs, contenção (isolar vs. desligar), preservação de evidências e gestão de crise nas primeiras horas de um ataque.',
        'Inteligência Artificial: uso de IA pelo atacante (phishing avançado, deepfakes, criação de variantes) e na defesa (triagem automatizada).',
        'Carreira: exigências do mercado de trabalho e caminhos para atuar na defesa contra malwares.',
      ],
      en: [
        'Threat types: how viruses, worms, trojans, ransomware, spyware, rootkits, botnets and fileless malware work and how they differ.',
        'Attack vectors: vulnerabilities and their CVE identifiers, exploits and threats. Entry points include phishing, social engineering, USB devices and the supply chain.',
        'Prevention and architecture: capabilities and limits of antivirus and EDR, patch management, network segmentation and the 3-2-1 backup rule.',
        'Detection and response: signs of intrusion, indicators of compromise, isolation versus shutdown, evidence preservation and crisis management in the first hours.',
        'Artificial intelligence: attackers’ use of AI for advanced phishing, deepfakes and malware variants, and defenders’ use of AI for automated triage.',
        'Careers: job requirements and pathways into malware defense.',
      ],
    },
  },
  {
    id: 'ransomware', issuer: 'IBSEC', width: 1013, height: 782,
    name: { pt: 'Ransomware: Identificar, Recuperar e Proteger na Era da IA', en: 'Ransomware: Identification, Recovery and Protection in the AI Era' },
    topics: {
      pt: [
        'Fundamentos e modelos: funcionamento da criptografia como arma, diferença entre locker, crypto e wipers (destruição), dupla extorsão e o modelo de negócios RaaS (Ransomware as a Service).',
        'Vetores de entrada: principais portas de acesso, incluindo phishing, RDP exposto, credenciais vazadas, vulnerabilidades e ataques à cadeia de suprimentos (supply chain).',
        'Detecção e sinais: identificação de indícios precoces (lentidão, tráfego anômalo) e sinais críticos de ataque ativo (arquivos alterados e análise segura da nota de resgate).',
        'Resposta e gestão de crise: ações imediatas de contenção (isolar sem apagar evidências), o que evitar nas primeiras horas, critérios de escalonamento, comunicação e obrigações legais da LGPD.',
        'Impacto da Inteligência Artificial: uso de IA ofensiva (deepfakes, phishing avançado e automação) e defensiva (EDRs com IA, gestão de falsos positivos/negativos e a importância da validação humana).',
        'Cenário atual: panorama dos grupos ativos, alvos prioritários e evolução das táticas de ataque.',
      ],
      en: [
        'Fundamentals and models: malicious use of encryption, lockers, crypto ransomware, destructive wipers, double extortion and the ransomware-as-a-service business model.',
        'Entry points: phishing, exposed RDP, leaked credentials, vulnerabilities and supply chain attacks.',
        'Detection and warning signs: slowdowns and anomalous traffic, file changes during an active attack and safe assessment of ransom notes.',
        'Response and crisis management: isolation while preserving evidence, early response pitfalls, escalation criteria, communication and LGPD obligations.',
        'Impact of AI: offensive uses such as deepfakes, advanced phishing and automation, and defensive uses including AI-enabled EDR, false positive and false negative management, and human validation.',
        'Threat landscape: active groups, priority targets and evolving attack tactics.',
      ],
    },
  },
  {
    id: 'pentest', issuer: 'IBSEC', width: 1013, height: 781,
    name: { pt: 'Pentester na Era da IA', en: 'Penetration Tester in the AI Era' },
    topics: {
      pt: [
        'Fundamentos e metodologia: diferença entre pentest e outros testes, mapeamento da superfície de ataque, etapas do processo, abordagens (black, gray e white-box) e escopos (rede vs. aplicação web).',
        'Reconhecimento e coleta: técnicas passivas, uso de OSINT (fontes abertas) e vetores de engenharia social (phishing e pretexting).',
        'Exploração e métricas: vocabulário técnico (vulnerabilidade, exploit e payload), falhas comuns (injeção, autenticação, exposição de dados) e classificação de risco via CVSS.',
        'Aspectos legais e governança: autorização formal, regras de engajamento (RoE) e respaldo jurídico no Brasil (Lei 12.737/Lei Carolina Dieckmann).',
        'Entregáveis e postura defensiva: estruturação do relatório técnico, priorização de achados por severidade e como usar a visão ofensiva para fortalecer defesas.',
        'Inteligência Artificial no pentest: uso de IA para apoio e ataques em escala, prevenção de alucinações técnicas (CVEs falsos), sigilo de dados (NDA) e responsabilidade jurídica sobre o uso das ferramentas.',
      ],
      en: [
        'Fundamentals and methodology: penetration testing and other assessments, attack surface mapping, testing stages, black-, gray- and white-box approaches, and network versus web application scopes.',
        'Reconnaissance and collection: passive techniques, open-source intelligence (OSINT) and social engineering vectors such as phishing and pretexting.',
        'Exploitation and metrics: vulnerability, exploit and payload terminology, common weaknesses such as injection, authentication flaws and data exposure, and CVSS severity ratings.',
        'Legal aspects and governance: formal authorization, rules of engagement and the Brazilian legal framework (Law 12.737, known as the Carolina Dieckmann Law).',
        'Deliverables and defensive practice: structuring technical reports, prioritizing findings by severity and using the attacker’s perspective to strengthen defenses.',
        'AI in penetration testing: assistance and attacks at scale, avoiding technical hallucinations such as fictitious CVEs, confidentiality under NDAs and legal responsibility for tool use.',
      ],
    },
  },
];

const groups = [
  { id: 'hackers-do-bem', name: 'Hackers do Bem' },
  { id: 'ibsec', name: 'IBSEC' },
].map(group => ({ ...group, courses: courses.filter(course => course.issuer === group.name) }));

function useSelectedCourse() {
  return usePortfolioStore(state => courses.find(course => course.id === state.hoveredItem));
}

function certificateFor(group, course, language) {
  return { file: `${group.id}-${course.id}.png`, label: `${course.issuer} — ${course.name[language]}` };
}

export function ComplementaryPanel({ desktop, language, onOpenCertificate }) {
  const selected = useSelectedCourse();
  const { setHoveredItem, clearHoveredItem } = usePortfolioStore.getState();
  const en = language === 'en';
  function selectCourse(group, course) {
    setHoveredItem(course.id);
    if (desktop) onOpenCertificate(certificateFor(group, course, language));
    else document.getElementById('certificate-preview')?.scrollIntoView({ block: 'start' });
  }
  return <section className="education-panel">
    <p className="eyebrow">COURSE ARCHIVE / 05</p>
    <h1>{en ? 'Additional Training' : 'Complementares'}</h1>
    <div className="project-accordion border-panel min-w-0">
      {groups.map((group, index) => {
        const expanded = selected?.issuer === group.name;
        return <div key={group.id}>
          <button type="button" className="file-row" aria-expanded={expanded} aria-controls={group.id}
            onClick={() => expanded ? clearHoveredItem() : setHoveredItem(group.courses[0].id)}>
            <span className="file-number">{String(index + 1).padStart(2, '0')}</span>
            <span><strong>{group.name}</strong><small>{String(group.courses.length).padStart(2, '0')} {en ? 'certifications' : 'certificações'}</small></span>
            <span className="critical" aria-hidden="true">{expanded ? '−' : '+'}</span>
          </button>
          <ul id={group.id} hidden={!expanded}>
            {group.courses.map(course => <li key={course.id}>
              <button type="button" className="education-row flex justify-between items-center w-full text-left"
                aria-haspopup={desktop ? "dialog" : undefined} aria-pressed={course === selected} aria-controls="certificate-preview"
                onPointerEnter={event => { if (event.pointerType === 'mouse') setHoveredItem(course.id); }}
                onFocus={() => setHoveredItem(course.id)} onClick={() => selectCourse(group, course)}>
                <span>{course.name[language]}</span>{course.hours && <span className="muted">{course.hours} h</span>}
              </button>
            </li>)}
          </ul>
        </div>;
      })}
    </div>
  </section>;
}

export function complementarySelection(id) {
  const course = courses.find(item => item.id === id);
  return { course, group: groups.find(item => item.name === course?.issuer) };
}

export function CertificateCaption({ desktop, language, course, group, onOpenCertificate }) {
  const en = language === 'en';
  return course ? (
      <section key={course.id} tabIndex={0} className="hologram-caption course-caption">
        <h2>{course.name[language]}{course.hours && ` · ${course.hours} h`}</h2>
        {!desktop && <button type="button" className="action justify-self-start" aria-haspopup="dialog"
          onClick={() => onOpenCertificate(certificateFor(group, course, language))}>
          {en ? 'View certificate' : 'Ver certificado'}
        </button>}
        <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">{course.topics[language].map(topic => <li key={topic}>{topic}</li>)}</ul>
      </section>
    ) : <p className="muted text-sm p-5">{en ? 'Open a group to view its certificates.' : 'Abra um grupo para ver os certificados.'}</p>;
}
