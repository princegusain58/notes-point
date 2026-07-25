/* ==========================================================================
   NOTES POINT — ULTIMATE ENTERPRISE PRODUCTION FRONTEND ENGINE (2026)
   Platform: Class 9th to 12th NCERT & Board Aspirants Platform
   Author: NotesPoint Core Engineering Team (Admin-Sync & Super-AI Patched)
   Version: 2026.9.5-ENTERPRISE-EXTENDED-ULTIMATE
   ========================================================================== */

(() => {
  'use strict';

  /* ==========================================================================
     01. GLOBAL CONFIGURATION & STORAGE TOKEN ENGINE (ADMIN SYNCED)
     ========================================================================== */
  const ENGINE_CONFIG = {
    version: '2026.9.5-ENTERPRISE-EXTENDED',
    platformName: 'Notes Point',
    teamName: 'NotesPoint Core Engineering Team',
    adminEmail: 'gusainprince7002@gmail.com', // Live Chat Log Collector Email
    storageKeys: {
      notes: 'notespoint_uploaded_notes_v7',          // Admin synced notes key
      ticker: 'notespoint_running_ticker_v7',        // Admin synced ticker key
      reviews: 'notespoint_student_reviews_v6',
      reviewUpvotes: 'notespoint_upvoted_reviews_v6',
      bookmarks: 'notespoint_saved_bookmarks_v6',
      chatHistory: 'notespoint_chat_session_v6',
      userSession: 'notespoint_user_session_v6',
      themePreference: 'notespoint_theme_preference'
    },
    audioEnabled: true,
    autoReplyDelay: 350,
    toastDuration: 3800,
    webSearchEnabled: true
  };

  /**
   * Safely reads JSON data from LocalStorage
   */
  function safeStorageRead(key, fallback = null) {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null || item === undefined) return fallback;
      return JSON.parse(item);
    } catch (e) {
      console.warn(`[StorageEngine] Exception reading key "${key}":`, e);
      return fallback;
    }
  }

  /**
   * Safely writes JSON data to LocalStorage
   */
  function safeStorageWrite(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[StorageEngine] Exception writing key "${key}":`, e);
    }
  }

  /* ==========================================================================
     01.1 LIVE ADMIN SYNC MANAGER (REAL-TIME FIRESTORE & TICKER LISTENERS)
     ========================================================================== */
  function initAdminSyncEngine() {
    const tickerTrack = document.getElementById('runningTickerText') || document.getElementById('tickerPreviewTrack') || document.querySelector('.ticker-track');
    
    // 1. Instant LocalStorage Load
    const savedTicker = window.localStorage.getItem(ENGINE_CONFIG.storageKeys.ticker);
    if (savedTicker && tickerTrack) {
      tickerTrack.textContent = savedTicker;
    }

    // 2. Real-Time Firestore Sync Listener (Zero Delay Live Sync)
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      try {
        const firestoreDb = firebase.firestore();
        firestoreDb.collection('settings').doc('ticker').onSnapshot((doc) => {
          if (doc.exists && doc.data().text && tickerTrack) {
            const liveText = doc.data().text;
            tickerTrack.textContent = liveText;
            window.localStorage.setItem(ENGINE_CONFIG.storageKeys.ticker, liveText);
          }
        }, (err) => {
          console.warn('[AdminSync] Live Ticker Snapshot Stream Notice:', err.message);
        });
      } catch (err) {
        console.warn('[AdminSync] Firestore ticker listener bypass:', err.message);
      }
    }

    // 3. Storage Event Listener For Multi-Tab & Multi-Port Sync
    window.addEventListener('storage', (e) => {
      if (e.key === ENGINE_CONFIG.storageKeys.ticker && e.newValue && tickerTrack) {
        tickerTrack.textContent = e.newValue;
      }
    });

    // 4. Load Synced Uploaded Notes
    const uploadedNotes = safeStorageRead(ENGINE_CONFIG.storageKeys.notes, []);
    if (uploadedNotes.length > 0) {
      console.log(`[AdminSync] Loaded ${uploadedNotes.length} live study materials from Admin Panel.`);
    }
  }

  /* ==========================================================================
     02. EXHAUSTIVE NCERT CURRICULUM DATABASE (CLASSES 9 - 12)
     ========================================================================== */
  const CURRICULUM_DATABASE = {
    9: {
      title: "Class 9 Foundation Year",
      description: "NCERT Core Subjects & Practice Worksheets for Strong Academic Foundation",
      subjects: [
        {
          id: 'maths_9',
          name: 'Mathematics',
          code: 'MATH-09',
          icon: '📐',
          weightage: '100 Marks',
          chapters: [
            'Chapter 1: Number Systems',
            'Chapter 2: Polynomials',
            'Chapter 3: Coordinate Geometry',
            'Chapter 4: Linear Equations in Two Variables',
            'Chapter 5: Introduction to Euclid\'s Geometry',
            'Chapter 6: Lines and Angles',
            'Chapter 7: Triangles',
            'Chapter 8: Quadrilaterals',
            'Chapter 9: Circles',
            'Chapter 10: Heron\'s Formula',
            'Chapter 11: Surface Areas and Volumes',
            'Chapter 12: Statistics'
          ]
        },
        {
          id: 'sci_9',
          name: 'Science',
          code: 'SCI-09',
          icon: '🧪',
          weightage: '100 Marks',
          chapters: [
            'Physics: Motion & Laws of Motion',
            'Physics: Gravitation & Work, Energy, Power',
            'Physics: Sound Waves & Acoustics',
            'Chemistry: Matter in Our Surroundings',
            'Chemistry: Is Matter Around Us Pure',
            'Chemistry: Atoms and Molecules',
            'Chemistry: Structure of the Atom',
            'Biology: The Fundamental Unit of Life (Cell)',
            'Biology: Tissues (Plant & Animal)',
            'Biology: Improvement in Food Resources'
          ]
        },
        {
          id: 'eng_9',
          name: 'English',
          code: 'ENG-09',
          icon: '📖',
          weightage: '100 Marks',
          chapters: [
            'Beehive: Prose & Poetry Chapters',
            'Moments: Supplementary Reader',
            'Grammar: Tenses, Modals & Passive Voice',
            'Writing: Story Writing & Descriptive Paragraphs'
          ]
        },
        {
          id: 'hin_9',
          name: 'Hindi',
          code: 'HIN-09',
          icon: '✍️',
          weightage: '100 Marks',
          chapters: [
            'Kshitij: Prose & Poetry Section',
            'Kritika: Supplementary Reader',
            'Vyakaran: Muhavare, Samas, Vakya Bhed'
          ]
        },
        {
          id: 'sst_9',
          name: 'Social Science',
          code: 'SST-09',
          icon: '🌍',
          weightage: '100 Marks',
          chapters: [
            'History: French Revolution & Nazism',
            'Geography: India Size & Physical Features',
            'Political Science: What is Democracy & Electoral Politics',
            'Economics: Story of Village Palampur & Poverty'
          ]
        },
        {
          id: 'sans_9',
          name: 'Sanskrit (Optional)',
          code: 'SAN-09',
          icon: '📜',
          isOptional: true,
          chapters: ['Shemushi Part 1', 'Vyakaranavithi']
        },
        {
          id: 'it_9',
          name: 'Information Technology (Optional)',
          code: 'IT-09',
          icon: '💻',
          isOptional: true,
          chapters: ['Digital Documentation', 'Electronic Spreadsheet', 'Digital Presentation']
        }
      ]
    },
    10: {
      title: "Class 10 Board Examination Special",
      description: "High-Priority Board Revision Notes, 10-Year PYQs & Official Sample Papers",
      subjects: [
        {
          id: 'maths_10',
          name: 'Mathematics',
          code: 'MATH-10',
          icon: '📐',
          weightage: '80 Board + 20 Internal',
          chapters: [
            'Chapter 1: Real Numbers',
            'Chapter 2: Polynomials',
            'Chapter 3: Pair of Linear Equations in Two Variables',
            'Chapter 4: Quadratic Equations',
            'Chapter 5: Arithmetic Progressions',
            'Chapter 6: Triangles',
            'Chapter 7: Coordinate Geometry',
            'Chapter 8: Introduction to Trigonometry',
            'Chapter 9: Applications of Trigonometry',
            'Chapter 10: Circles',
            'Chapter 11: Areas Related to Circles',
            'Chapter 12: Surface Areas and Volumes',
            'Chapter 13: Statistics',
            'Chapter 14: Probability'
          ]
        },
        {
          id: 'sci_10',
          name: 'Science',
          code: 'SCI-10',
          icon: '🧪',
          weightage: '80 Board + 20 Internal',
          chapters: [
            'Chemical Reactions and Equations',
            'Acids, Bases and Salts',
            'Metals and Non-metals',
            'Carbon and its Compounds',
            'Life Processes',
            'Control and Coordination',
            'How do Organisms Reproduce',
            'Heredity and Evolution',
            'Light Reflection and Refraction',
            'Human Eye and Colourful World',
            'Electricity',
            'Magnetic Effects of Electric Current',
            'Our Environment'
          ]
        },
        {
          id: 'eng_10',
          name: 'English Language & Literature',
          code: 'ENG-10',
          icon: '📖',
          weightage: '80 Board + 20 Internal',
          chapters: [
            'First Flight: Prose & Poetry Complete',
            'Footprints Without Feet: Supplementary',
            'Grammar: Subject-Verb Concord, Reported Speech',
            'Creative Writing Skills'
          ]
        },
        {
          id: 'hin_10',
          name: 'Hindi Course A/B',
          code: 'HIN-10',
          icon: '✍️',
          weightage: '80 Board + 20 Internal',
          chapters: ['Kshitij Part 2', 'Kritika Part 2', 'Vyakaran & Patra Lekhan']
        },
        {
          id: 'sst_10',
          name: 'Social Science',
          code: 'SST-10',
          icon: '🌍',
          weightage: '80 Board + 20 Internal',
          chapters: [
            'History: Rise of Nationalism in Europe & India',
            'Geography: Resources, Agriculture & Manufacturing',
            'Pol Science: Power Sharing, Federalism & Gender',
            'Economics: Development, Money & Globalization'
          ]
        },
        {
          id: 'sans_10',
          name: 'Sanskrit (Optional)',
          code: 'SAN-10',
          icon: '📜',
          isOptional: true,
          chapters: ['Shemushi Part 2', 'Abhyasavan Bhava']
        },
        {
          id: 'it_10',
          name: 'Information Technology (Optional)',
          code: 'IT-10',
          icon: '💻',
          isOptional: true,
          chapters: ['Web Applications & Security', 'Database Management System']
        }
      ]
    },
    11: {
      title: "Class 11 Higher Secondary Stream Preparation",
      description: "Stream-Wise In-Depth NCERT Material & Entrance Exam Foundations",
      streams: {
        Science: [
          { id: 'phy_11', name: 'Physics', code: 'PHY-11', icon: '⚡', chapters: ['Units & Measurements', 'Kinematics', 'Laws of Motion', 'Work Energy Power', 'Gravitation', 'Thermodynamics'] },
          { id: 'chem_11', name: 'Chemistry', code: 'CHEM-11', icon: '⚗️', chapters: ['Atomic Structure', 'Chemical Bonding', 'Equilibrium', 'Redox Reactions', 'Organic Chemistry Basics'] },
          { id: 'maths_11', name: 'Mathematics', code: 'MATH-11', icon: '📊', chapters: ['Sets and Functions', 'Trigonometric Functions', 'Calculus Intro', 'Coordinate Geometry'] },
          { id: 'bio_11', name: 'Biology', code: 'BIO-11', icon: '🧬', chapters: ['Diversity in Living World', 'Cell Structure', 'Plant Physiology', 'Human Physiology'] },
          { id: 'cs_11', name: 'Computer Science', code: 'CS-11', icon: '🖥️', chapters: ['Python Syntax', 'Control Flow', 'Strings & Lists', 'Cyber Safety'] },
          { id: 'eng_11', name: 'English', code: 'ENG-11', icon: '📖', chapters: ['Hornbill Prose', 'Snapshots Stories', 'Grammar & Writing'] },
          { id: 'pe_11', name: 'Physical Education', code: 'PE-11', icon: '⚽', chapters: ['Physical Fitness', 'Yoga', 'Physical Education for CWSN'] }
        ],
        Commerce: [
          { id: 'acc_11', name: 'Accountancy', code: 'ACC-11', icon: '📈', chapters: ['Accounting Equation', 'Journal & Ledger', 'Bank Reconciliation Statement', 'Trial Balance'] },
          { id: 'bst_11', name: 'Business Studies', code: 'BST-11', icon: '💼', chapters: ['Nature of Business', 'Forms of Business Organizations', 'Private Public Enterprises'] },
          { id: 'eco_11', name: 'Economics', code: 'ECO-11', icon: '📉', chapters: ['Introductory Microeconomics', 'Statistics for Economics'] },
          { id: 'eng_11_c', name: 'English', code: 'ENG-11', icon: '📖', chapters: ['Hornbill', 'Snapshots'] },
          { id: 'maths_11_c', name: 'Mathematics', code: 'MATH-11', icon: '📊', chapters: ['Core Mathematics'] },
          { id: 'ip_11', name: 'Informatics Practices', code: 'IP-11', icon: '💾', chapters: ['Python & Pandas', 'SQL Database'] }
        ],
        Humanities: [
          { id: 'hist_11', name: 'History', code: 'HIST-11', icon: '🏛️', chapters: ['Writing and City Life', 'An Empire Across Three Continents', 'Nomadic Empires'] },
          { id: 'geo_11', name: 'Geography', code: 'GEO-11', icon: '🗺️', chapters: ['Physical Geography', 'Earth Movements', 'Climate & Vegetation'] },
          { id: 'pol_11', name: 'Political Science', code: 'POL-11', icon: '⚖️', chapters: ['Indian Constitution', 'Rights in the Constitution', 'Executive & Legislature'] },
          { id: 'eco_11_h', name: 'Economics', code: 'ECO-11', icon: '📉', chapters: ['Microeconomics Basics'] },
          { id: 'soc_11', name: 'Sociology', code: 'SOC-11', icon: '👥', chapters: ['Sociology & Society', 'Culture & Socialisation'] },
          { id: 'psy_11', name: 'Psychology', code: 'PSY-11', icon: '🧠', chapters: ['What is Psychology', 'Human Development'] },
          { id: 'eng_11_h', name: 'English', code: 'ENG-11', icon: '📖', chapters: ['Hornbill & Snapshots'] },
          { id: 'hin_11_h', name: 'Hindi', code: 'HIN-11', icon: '✍️', chapters: ['Aroh & Vitan'] }
        ]
      }
    },
    12: {
      title: "Class 12 Final Board Examination Special",
      description: "Final Revision Notes, Derivations, Formula Sheets & Solved Board PYQs",
      streams: {
        PCM: [
          { id: 'phy_12', name: 'Physics', code: 'PHY-12', icon: '⚡', chapters: ['Electrostatics', 'Current Electricity', 'Magnetism', 'Electromagnetic Waves', 'Ray & Wave Optics', 'Modern Physics'] },
          { id: 'chem_12', name: 'Chemistry', code: 'CHEM-12', icon: '⚗️', chapters: ['Solutions', 'Electrochemistry', 'Chemical Kinetics', 'd and f Block Elements', 'Coordination Compounds', 'Organic Reactions'] },
          { id: 'maths_12', name: 'Mathematics', code: 'MATH-12', icon: '📊', chapters: ['Relations and Functions', 'Matrices & Determinants', 'Calculus (Continuity & Integrals)', 'Vector Algebra & 3D Geometry', 'Probability'] },
          { id: 'eng_12', name: 'English', code: 'ENG-12', icon: '📖', chapters: ['Flamingo Prose & Poetry', 'Vistas Supplementary', 'Report Writing & Letters'] },
          { id: 'cs_12', name: 'Computer Science', code: 'CS-12', icon: '🖥️', chapters: ['Python Revision Tour', 'Functions & Stacks', 'Computer Networks', 'SQL Queries & Joins'] },
          { id: 'pe_12', name: 'Physical Education', code: 'PE-12', icon: '⚽', chapters: ['Management in Sports', 'Children & Women in Sports', 'Kinesiology & Biomechanics'] }
        ],
        PCB: [
          { id: 'phy_12_b', name: 'Physics', code: 'PHY-12', icon: '⚡', chapters: ['Electrostatics', 'Current Electricity', 'Optics', 'Atoms & Nuclei'] },
          { id: 'chem_12_b', name: 'Chemistry', code: 'CHEM-12', icon: '⚗️', chapters: ['Solutions', 'Electrochemistry', 'Organic Chemistry', 'Biomolecules'] },
          { id: 'bio_12', name: 'Biology', code: 'BIO-12', icon: '🧬', chapters: ['Sexual Reproduction in Flowering Plants', 'Human Reproduction', 'Genetics & Inheritance', 'Molecular Basis of Inheritance', 'Biotechnology Principles', 'Ecology & Environment'] },
          { id: 'eng_12_b', name: 'English', code: 'ENG-12', icon: '📖', chapters: ['Flamingo & Vistas'] },
          { id: 'pe_12_b', name: 'Physical Education', code: 'PE-12', icon: '⚽', chapters: ['Sports & Nutrition', 'Test & Measurement'] }
        ],
        Commerce: [
          { id: 'acc_12', name: 'Accountancy', code: 'ACC-12', icon: '📈', chapters: ['Accounting for Partnership Firms', 'Company Accounts (Shares & Debentures)', 'Analysis of Financial Statements', 'Cash Flow Statement'] },
          { id: 'bst_12', name: 'Business Studies', code: 'BST-12', icon: '💼', chapters: ['Principles of Management', 'Business Environment', 'Planning & Organising', 'Financial Management', 'Marketing Management'] },
          { id: 'eco_12', name: 'Economics', code: 'ECO-12', icon: '📉', chapters: ['Introductory Macroeconomics (National Income & Money)', 'Indian Economic Development (1947-1990 & Current Challenges)'] },
          { id: 'eng_12_c', name: 'English', code: 'ENG-12', icon: '📖', chapters: ['Flamingo & Vistas'] },
          { id: 'maths_12_c', name: 'Mathematics', code: 'MATH-12', icon: '📊', chapters: ['Calculus & Linear Programming'] },
          { id: 'ip_12', name: 'Informatics Practices', code: 'IP-12', icon: '💾', chapters: ['Data Handling using Pandas', 'Database Query using SQL', 'Introduction to Computer Networks'] }
        ],
        'Arts/Humanities': [
          { id: 'hist_12', name: 'History', code: 'HIST-12', icon: '🏛️', chapters: ['Bricks, Beads and Bones', 'Kings, Farmers and Towns', 'Kinship, Caste and Class', 'Rebels and the Raj', 'Mahatma Gandhi and National Movement'] },
          { id: 'geo_12', name: 'Geography', code: 'GEO-12', icon: '🗺️', chapters: ['Human Geography Nature & Scope', 'World Population', 'Human Settlements', 'India Land Resources & Water Resources'] },
          { id: 'pol_12', name: 'Political Science', code: 'POL-12', icon: '⚖️', chapters: ['Contemporary World Politics', 'End of Bipolarity', 'New Centres of Power', 'Politics in India Since Independence', 'Nation Building'] },
          { id: 'eco_12_a', name: 'Economics', code: 'ECO-12', icon: '📉', chapters: ['Macroeconomics & Indian Economy'] },
          { id: 'soc_12', name: 'Sociology', code: 'SOC-12', icon: '👥', chapters: ['Demographic Structure of Indian Society', 'Social Institutions', 'Cultural Change'] },
          { id: 'psy_12', name: 'Psychology', code: 'PSY-12', icon: '🧠', chapters: ['Variations in Psychological Attributes', 'Self and Personality', 'Meeting Life Challenges'] },
          { id: 'eng_12_a', name: 'English', code: 'ENG-12', icon: '📖', chapters: ['Flamingo & Vistas'] },
          { id: 'hin_12_a', name: 'Hindi', code: 'HIN-12', icon: '✍️', chapters: ['Aroh Part 2 & Vitan Part 2'] }
        ]
      }
    }
  };

  /* ==========================================================================
     03. COMPREHENSIVE FORMULA, DEFINITION & DICTIONARY MATRIX
     ========================================================================== */
  const NCERT_KNOWLEDGE_BASE = {
    'photosynthesis': 'Photosynthesis is the biological process by which green plants synthesize nutrients from carbon dioxide and water using sunlight absorbed by chlorophyll. Equation: 6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂.',
    'ohm law': 'Ohm\'s Law states that current (I) flowing through a conductor is directly proportional to the potential difference (V) across its ends, provided temperature remains constant. Formula: V = I × R.',
    'newton first law': 'Newton\'s First Law of Motion (Law of Inertia) states that an object remains at rest or in uniform motion unless acted upon by an external unbalanced force.',
    'newton second law': 'Newton\'s Second Law states that the rate of change of momentum is proportional to the applied force. Formula: Force = Mass × Acceleration (F = m × a).',
    'newton third law': 'Newton\'s Third Law states that for every action, there is an equal and opposite reaction.',
    'pythagoras theorem': 'In a right-angled triangle, the square of the hypotenuse is equal to the sum of squares of the other two sides. Formula: c² = a² + b².',
    'mitochondria': 'Mitochondria are the powerhouses of the cell that release chemical energy in the form of ATP (Adenosine Triphosphate) molecules.',
    'gravitation': 'Universal Law of Gravitation: F = G(m1 · m2) / r², where G is the gravitational constant (6.674 × 10⁻¹¹ N m²/kg²).',
    'quadratic formula': 'For ax² + bx + c = 0, the roots are x = [-b ± √(b² - 4ac)] / (2a).'
  };

  /* ==========================================================================
     04. WEB AUDIO SYNTHESIZER (AUDIO FEEDBACK FX)
     ========================================================================== */
  class AudioSynthesizer {
    constructor() {
      this.context = null;
    }

    initContext() {
      if (!this.context && ENGINE_CONFIG.audioEnabled) {
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            this.context = new AudioContextClass();
          }
        } catch (err) {
          console.warn("[AudioSynth] Web Audio Context blocked.", err);
        }
      }
    }

    playPop() {
      this.initContext();
      if (!this.context) return;
      try {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.context.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(this.context.destination);
        osc.start();
        osc.stop(this.context.currentTime + 0.08);
      } catch (e) {}
    }

    playSend() {
      this.initContext();
      if (!this.context) return;
      try {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(640, this.context.currentTime + 0.1);
        gain.gain.setValueAtTime(0.07, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.context.destination);
        osc.start();
        osc.stop(this.context.currentTime + 0.1);
      } catch (e) {}
    }

    playSuccess() {
      this.initContext();
      if (!this.context) return;
      try {
        const now = this.context.currentTime;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.28);
        osc.connect(gain);
        gain.connect(this.context.destination);
        osc.start();
        osc.stop(now + 0.28);
      } catch (e) {}
    }
  }

  const audioFx = new AudioSynthesizer();

  /* ==========================================================================
     05. STACKED GLASSMORPHISM TOAST NOTIFICATION ENGINE
     ========================================================================== */
  class ToastManager {
    constructor() {
      this.container = this.getOrCreateContainer();
    }

    getOrCreateContainer() {
      let el = document.getElementById('toastContainer');
      if (!el) {
        el = document.createElement('div');
        el.id = 'toastContainer';
        el.style.cssText = `
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
        `;
        document.body.appendChild(el);
      }
      return el;
    }

    show(message, type = 'info', duration = ENGINE_CONFIG.toastDuration) {
      const toastNode = document.createElement('div');
      
      const typeStyles = {
        success: { border: '#10B981', icon: '✅', shadow: 'rgba(16, 185, 129, 0.35)' },
        error: { border: '#EF4444', icon: '❌', shadow: 'rgba(239, 68, 68, 0.35)' },
        warning: { border: '#F59E0B', icon: '⚠️', shadow: 'rgba(245, 158, 11, 0.35)' },
        info: { border: '#2563EB', icon: 'ℹ️', shadow: 'rgba(37, 99, 235, 0.35)' }
      };

      const styleConfig = typeStyles[type] || typeStyles.info;

      toastNode.style.cssText = `
        background: #0F172A;
        color: #FFFFFF;
        border-left: 4px solid ${styleConfig.border};
        padding: 14px 22px;
        border-radius: 12px;
        box-shadow: 0 14px 36px rgba(0,0,0,0.35), 0 0 15px ${styleConfig.shadow};
        font-size: 0.9rem;
        font-weight: 600;
        pointer-events: auto;
        opacity: 0;
        transform: translateX(40px) scale(0.95);
        transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 380px;
        font-family: var(--font-body);
      `;

      toastNode.innerHTML = `<span style="font-size:1.1rem;">${styleConfig.icon}</span> <span>${message}</span>`;
      this.container.appendChild(toastNode);

      requestAnimationFrame(() => {
        toastNode.style.opacity = '1';
        toastNode.style.transform = 'translateX(0) scale(1)';
      });

      if (type === 'success') {
        audioFx.playSuccess();
      } else {
        audioFx.playPop();
      }

      setTimeout(() => {
        toastNode.style.opacity = '0';
        toastNode.style.transform = 'translateX(40px) scale(0.95)';
        setTimeout(() => toastNode.remove(), 350);
      }, duration);
    }
  }

  const toast = new ToastManager();

  /* ==========================================================================
     06. FIREBASE CLOUD FIRESTORE SAFEGUARD CONTROLLER
     ========================================================================== */
  const firebaseConfig = {
    apiKey: "AIzaSyB8Q233ol5opi0Io8tEp498yDEmMesjmgE",
    authDomain: "notes-point-215c8.firebaseapp.com",
    projectId: "notes-point-215c8",
    storageBucket: "notes-point-215c8.firebasestorage.app",
    messagingSenderId: "945990871633",
    appId: "1:945990871633:web:4cfd8339055182317fa670"
  };

  let db = null;
  let notesCollection = null;

  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.firestore();
      notesCollection = db.collection('notes');
      console.log("[NotesPoint Engine] Firebase Cloud Firestore Engine Ready.");
    } else {
      console.info("[NotesPoint Engine] Running in Standalone Frontend Mode.");
    }
  } catch (err) {
    console.warn("[NotesPoint Engine] Firebase Initialization Warning:", err.message);
  }

  /* ==========================================================================
     07. NAVIGATION, HEADER SCROLL & MOBILE DRAWER CONTROLLER
     ========================================================================== */
  const header = document.getElementById('siteHeader');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  const closeMobileNav = () => {
    if (mainNav) mainNav.classList.remove('is-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  };

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isExpanded));
      audioFx.playPop();
    });

    mainNav.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        closeMobileNav();
      }
    });

    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
        closeMobileNav();
      }
    });
  }

  /* ==========================================================================
     08. BACK TO TOP SMOOTH SCROLL CONTROLLER
     ========================================================================== */
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    const toggleBackToTop = () => {
      if (window.scrollY > 400) {
        backToTopBtn.hidden = false;
        backToTopBtn.style.opacity = '1';
      } else {
        backToTopBtn.style.opacity = '0';
        setTimeout(() => {
          if (window.scrollY <= 400) backToTopBtn.hidden = true;
        }, 200);
      }
    };

    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();

    backToTopBtn.addEventListener('click', () => {
      audioFx.playPop();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================================================
     09. INTERSECTION OBSERVER & DYNAMIC ANIMATION ENGINE
     ========================================================================== */
  const revealTargets = document.querySelectorAll(
    '.feature-card, .class-card, .review-card, .about-card-modern, .section-head, .add-review-box'
  );

  revealTargets.forEach((el) => el.setAttribute('data-reveal', ''));

  if ('IntersectionObserver' in window && revealTargets.length > 0) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  /* ==========================================================================
     10. REAL-TIME CLOCK, DATE & DYNAMIC GREETING ENGINE
     ========================================================================== */
  function getLiveTimeString() {
    const now = new Date();
    const optionsDate = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', optionsDate);
    const timeStr = now.toLocaleTimeString('en-US', { hour12: true });
    return { dateStr, timeStr, fullNow: now };
  }

  function updateLiveClockAndGreeting() {
    const { dateStr, timeStr } = getLiveTimeString();
    const dateEl = document.getElementById('liveDateStr');
    const clockEl = document.getElementById('liveClockStr');

    if (dateEl) {
      dateEl.innerHTML = `📅 ${dateStr}`;
    }

    if (clockEl) {
      clockEl.innerHTML = `⏰ ${timeStr}`;
    }
  }

  setInterval(updateLiveClockAndGreeting, 1000);
  updateLiveClockAndGreeting();

  /* ==========================================================================
     11. LIVE WEB API FETCHER ENGINE (SAFE 404 SUPPRESSED FALLBACK)
     ========================================================================== */
  async function fetchLiveEducationalDefinition(query) {
    if (!ENGINE_CONFIG.webSearchEnabled || !query) return null;

    const rawTerm = query.trim().toLowerCase();

    const ignoredKeywords = [
      'login', 'signup', 'sign up', 'sign in', 'log in', 'password',
      'account', 'profile', 'dashboard', 'hello', 'hi', 'hey', 'kaise',
      'kya', 'kru', 'karu', 'help', 'kahan', 'notes', 'review'
    ];

    const containsIgnoredWord = ignoredKeywords.some(word => rawTerm.includes(word));
    if (containsIgnoredWord) {
      return null;
    }

    try {
      const cleanTerm = encodeURIComponent(rawTerm);
      const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${cleanTerm}`;

      const response = await fetch(endpoint, { method: 'GET', cache: 'force-cache' });
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (data && data.extract && data.type === 'standard') {
        return `📖 **Knowledge Result:**\n\n${data.extract}\n\n*(Full detailed chapter PDF notes & PYQs are available on the Student Dashboard)*`;
      }
    } catch (err) {
      // Silent handling
    }
    return null;
  }

  /* ==========================================================================
     11.1 SILENT EMAIL DISPATCHER ENGINE (CHAT LOGS TO ADMIN EMAIL)
     ========================================================================== */
  function dispatchChatLogToAdminEmail(queryText) {
    try {
      const formData = new FormData();
      formData.append('_subject', '🔥 New Chatbot Query Log - Notes Point');
      formData.append('_captcha', 'false');
      formData.append('student_query', queryText);
      formData.append('timestamp', new Date().toLocaleString('en-US'));

      fetch(`https://formsubmit.co/ajax/${ENGINE_CONFIG.adminEmail}`, {
        method: 'POST',
        body: formData
      }).catch((e) => {
        // Silent catch
      });
    } catch (e) {
      // Silent catch
    }
  }

  /* ==========================================================================
     12. SUPER-HUMAN EMPATHY ADVANCED AI CHATBOT ENGINE (SMART NLP AUTO-REPLY)
     ========================================================================== */
  const aiChatTrigger = document.getElementById('aiChatTrigger');
  const aiChatWindow = document.getElementById('aiChatWindow');
  const aiChatClose = document.getElementById('aiChatClose');
  const aiChatBody = document.getElementById('aiChatBody');
  const aiChatInput = document.getElementById('aiChatInput');
  const aiChatSendBtn = document.getElementById('aiChatSendBtn');
  const quickTagBtns = document.querySelectorAll('.quick-tag-btn');

  function enforceHeaderStyling() {
    const headerTitle = document.querySelector('.ai-chat-bot-info h4');
    if (headerTitle) {
      headerTitle.style.cssText = "color:#FFFFFF !important; font-weight:700 !important; font-size:0.98rem !important; margin:0 !important;";
    }
  }

  if (aiChatTrigger && aiChatWindow) {
    aiChatTrigger.addEventListener('click', () => {
      const isHidden = aiChatWindow.hasAttribute('hidden');
      if (isHidden) {
        aiChatWindow.removeAttribute('hidden');
        enforceHeaderStyling();
        audioFx.playPop();
        if (aiChatInput) aiChatInput.focus();
      } else {
        aiChatWindow.setAttribute('hidden', '');
      }
    });
  }

  if (aiChatClose && aiChatWindow) {
    aiChatClose.addEventListener('click', () => {
      aiChatWindow.setAttribute('hidden', '');
    });
  }

  async function generateSmartBotReply(rawQuery) {
    const q = rawQuery.toLowerCase().trim();
    const { dateStr, timeStr } = getLiveTimeString();

    if (q.includes('time') || q.includes('samay') || q.includes('kitne baje')) {
      return `⏰ **Live Time Update:**\nAbhi time **${timeStr}** ho raha hai! Full focus ke sath padhai karte rahein! 🎯`;
    }
    if (q.includes('date') || q.includes('tarikh') || q.includes('aaj kya date hai') || q.includes('day')) {
      return `📅 **Today's Date:**\nAaj **${dateStr}** hai. Har din naye targets achieve karne ka moka hai! 💪`;
    }

    if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('namaste') || q.includes('kaise ho') || q.includes('kaisa hai')) {
      return "Namaste! 👋 Main NotesPoint Smart AI Assistant hoon. Aapko kis class ya subject ke notes/PYQs chahiye? Poochhiye, main turant guide karunga! 🎓";
    }

    if (q.includes('banaya') || q.includes('creator') || q.includes('developer') || q.includes('who made you') || q.includes('kisne banaya')) {
      return `🚀 **About Us:**\nMujhe **NotesPoint Platform Development Team** ne design aur code kiya hai taaki Class 9th-12th ke students ko 100% free high-yield study material mil sake! 💎`;
    }

    if (q.includes('problem') || q.includes('error') || q.includes('dikkat') || q.includes('issue') || q.includes('help') || q.includes('contact')) {
      return `🤝 **Aapki Poori Help Hogi!**\nAgar aapko website par koi dikkat aa rahi hai, toh tension mat lijiye! Aap Student Dashboard ke support section se ya page footer me diye gaye Contact options se humse jud sakte hain.⚡`;
    }

    if (q.includes('where is') || q.includes('kahan hai') || q.includes('kahan milega') || q.includes('location') || q.includes('nav')) {
      if (q.includes('notes') || q.includes('subject') || q.includes('class')) {
        return "📍 **Notes Navigator:** Page ko thoda scroll kijiye aur **'Syllabus & Course Breakdown'** section me jayiye. Wahan Class 9th, 10th, 11th, 12th ke saare subjects ek-click par ready hain!";
      }
      if (q.includes('login') || q.includes('signup') || q.includes('dashboard')) {
        return "📍 **Login Location:** Website ke top-right corner par **'Login / Signup 🚀'** ka button hai. Click karke apne Student Dashboard me enter kar lijiye!";
      }
      if (q.includes('review') || q.includes('rating') || q.includes('feedback')) {
        return "📍 **Review Section Location:** Page ke bottom me About Us section ke upar **'What Students Say About Us'** ka review card grid hai, jahan aap feedback submit kar sakte hain!";
      }
    }

    if (q.includes('class 9') || q.includes('class9') || q.includes('9th')) {
      return "📚 **Class 9 Foundation:** Science, Maths, SST, English & Hindi ke NCERT Chapter summaries and practice questions Student Panel me uploaded hain! Top 'Login' button se open karein.";
    }
    if (q.includes('class 10') || q.includes('class10') || q.includes('10th')) {
      return "🧪 **Class 10 Board Special:** Science, Maths & SST ke last 10-Year Solved Board PYQs, Board Revision Sheets & Sample Papers ready hain! Login karke abhi padhna start karein.";
    }
    if (q.includes('class 11') || q.includes('class11') || q.includes('11th')) {
      return "📊 **Class 11 Stream Base:** Science (Physics, Chem, Bio, Maths), Commerce (Accounts, BST, Eco) & Humanities (Pol Science, History, Geo) ke detailed notes ready hain!";
    }
    if (q.includes('class 12') || q.includes('class12') || q.includes('12th')) {
      return "⚡ **Class 12 Final Board Prep:** Physics Derivations, Organic Chemistry Mechanisms, Accounts Numericals & Solved PYQs Student Panel par live hain!";
    }

    if (q.includes('stress') || q.includes('tension') || q.includes('dar') || q.includes('fail') || q.includes('board exam')) {
      return "❤️ **Aap Akele Nahi Hain!**\nExam tension hona normal hai, par yaad rakhein: **Hard work never goes waste!**\nChote-chote targets banayein, NotesPoint ke PYQs solve kijiye aur acchi neend zaroor lein. Aap board exams me zaroor top karenge! 🌟";
    }

    for (const [key, val] of Object.entries(NCERT_KNOWLEDGE_BASE)) {
      if (q.includes(key)) {
        return `💡 **NCERT Solution:**\n\n${val}\n\n*(Detailed NCERT Chapter Notes & PYQs available in Student Panel)*`;
      }
    }

    if (q.includes('free') || q.includes('paisa') || q.includes('pay') || q.includes('charge')) {
      return "NotesPoint par sabhi classes (9th to 12th) ke Chapter Notes, Formula Sheets, PYQs aur Sample Papers 100% FREE hain! No subscription required. 💎";
    }
    if (q.includes('pyq') || q.includes('previous year') || q.includes('board paper') || q.includes('10 year')) {
      return "Class 10 aur Class 12 ke last 10-Year Solved Board PYQs Student Dashboard par updated hain! Aap 'Login' button par click karke access kar sakte hain. 📚";
    }

    const webResult = await fetchLiveEducationalDefinition(rawQuery);
    if (webResult) {
      return webResult;
    }

    return `Aapka doubt: "${rawQuery}" receive ho gaya hai! Is topic ke saare Detailed Notes & Solved PYQs Student Panel ke andar structured view me ready hain. Page ke top par Login button se Dashboard access kar lijiye! 🎓`;
  }

  function appendChatMessage(text, sender) {
    if (!aiChatBody) return;
    const msgNode = document.createElement('div');
    msgNode.className = `chat-msg ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
    
    if (sender === 'user') {
      msgNode.style.cssText = "background:#2563EB !important; color:#FFFFFF !important; align-self:flex-end;";
      msgNode.innerHTML = `<p style="color:#FFFFFF !important; margin:0; font-weight:500;">${text}</p>`;
    } else {
      msgNode.style.cssText = "background:#FFFFFF !important; color:#0F172A !important; align-self:flex-start; border:1px solid #E2E8F0;";
      msgNode.innerHTML = `<p style="color:#0F172A !important; margin:0; line-height:1.5;">${text.replace(/\n/g, '<br>')}</p>`;
    }

    aiChatBody.appendChild(msgNode);
    aiChatBody.scrollTop = aiChatBody.scrollHeight;
  }

  function showTypingIndicator() {
    if (!aiChatBody) return null;
    const indicator = document.createElement('div');
    indicator.className = 'chat-msg bot-msg typing-indicator';
    indicator.id = 'typingIndicatorDots';
    indicator.style.cssText = "background:#FFFFFF !important; border:1px solid #E2E8F0;";
    indicator.innerHTML = `
      <p style="display:flex; gap:5px; align-items:center; margin:0;">
        <span style="display:inline-block; width:6px; height:6px; background:#2563EB; border-radius:50%; animation: pulseGlow 0.6s infinite alternate;"></span>
        <span style="display:inline-block; width:6px; height:6px; background:#2563EB; border-radius:50%; animation: pulseGlow 0.6s infinite 0.2s alternate;"></span>
        <span style="display:inline-block; width:6px; height:6px; background:#2563EB; border-radius:50%; animation: pulseGlow 0.6s infinite 0.4s alternate;"></span>
      </p>
    `;
    aiChatBody.appendChild(indicator);
    aiChatBody.scrollTop = aiChatBody.scrollHeight;
    return indicator;
  }

  async function handleUserChatInput(queryText) {
    const text = queryText || (aiChatInput ? aiChatInput.value : '');
    if (!text || !text.trim()) return;

    appendChatMessage(text, 'user');
    audioFx.playSend();
    if (aiChatInput) aiChatInput.value = '';

    dispatchChatLogToAdminEmail(text);

    const typingNode = showTypingIndicator();

    const reply = await generateSmartBotReply(text);

    setTimeout(() => {
      if (typingNode) typingNode.remove();
      appendChatMessage(reply, 'bot');
      audioFx.playPop();
    }, ENGINE_CONFIG.autoReplyDelay);
  }

  if (aiChatSendBtn) {
    aiChatSendBtn.addEventListener('click', () => handleUserChatInput());
  }

  if (aiChatInput) {
    aiChatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleUserChatInput();
    });
  }

  quickTagBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      handleUserChatInput(btn.textContent);
    });
  });

  /* ==========================================================================
     13. DYNAMIC STUDENT REVIEWS WITH UPVOTES & LOCALSTORAGE MATRIX
     ========================================================================== */
  const reviewForm = document.getElementById('reviewForm');
  const reviewsGrid = document.getElementById('reviewsGrid');

  const INITIAL_REVIEWS_SEED = [
    {
      id: 'rev_1001',
      name: 'Rohan Sharma',
      className: 'Class 10',
      comment: 'Class 10 Science PYQs and formula sheets helped me score 94% in my board exams! Notes Point is a lifesaver.',
      stars: 5,
      upvotes: 28,
      date: '2026-06-12'
    },
    {
      id: 'rev_1002',
      name: 'Priya Verma',
      className: 'Class 12',
      comment: 'Class 12 Physics derivations and Chemistry short notes are super clean. Last minute revision ke liye best site hai.',
      stars: 5,
      upvotes: 35,
      date: '2026-07-01'
    }
  ];

  function getStoredReviews() {
    return safeStorageRead(ENGINE_CONFIG.storageKeys.reviews, INITIAL_REVIEWS_SEED);
  }

  function saveReviewsToStorage(reviewsArray) {
    safeStorageWrite(ENGINE_CONFIG.storageKeys.reviews, reviewsArray);
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderReviewCard(revObj) {
    if (!reviewsGrid) return;

    const card = document.createElement('div');
    card.className = 'review-card';
    card.dataset.id = revObj.id;

    const starsStr = '⭐'.repeat(revObj.stars || 5);

    card.innerHTML = `
      <div class="review-stars">${starsStr}</div>
      <p class="review-text">"${escapeHTML(revObj.comment)}"</p>
      <div class="review-author" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>${escapeHTML(revObj.name)}</strong>
          <span>${escapeHTML(revObj.className)} Student</span>
        </div>
        <button type="button" class="upvote-btn" style="background:var(--primary-light); color:var(--primary); border:1px solid #BFDBFE; padding:4px 12px; border-radius:99px; font-size:0.75rem; font-weight:700; cursor:pointer; transition:all 0.2s;">
          👍 ${revObj.upvotes || 0}
        </button>
      </div>
    `;

    const upvoteBtn = card.querySelector('.upvote-btn');
    if (upvoteBtn) {
      upvoteBtn.addEventListener('click', () => {
        revObj.upvotes = (revObj.upvotes || 0) + 1;
        upvoteBtn.textContent = `👍 ${revObj.upvotes}`;
        
        const allRevs = getStoredReviews();
        const target = allRevs.find(r => r.id === revObj.id);
        if (target) {
          target.upvotes = revObj.upvotes;
          saveReviewsToStorage(allRevs);
        }
        audioFx.playPop();
        toast.show('Thank you for upvoting this review!', 'success', 1800);
      });
    }

    reviewsGrid.prepend(card);
  }

  function renderAllReviews() {
    if (!reviewsGrid) return;
    reviewsGrid.innerHTML = '';
    const reviews = getStoredReviews();
    reviews.forEach((r) => renderReviewCard(r));
  }

  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameEl = document.getElementById('reviewerName');
      const classEl = document.getElementById('reviewerClass');
      const commentEl = document.getElementById('reviewComment');

      const name = nameEl ? nameEl.value.trim() : '';
      const className = classEl ? classEl.value : '';
      const comment = commentEl ? commentEl.value.trim() : '';

      if (!name || !className || !comment) {
        toast.show('Please complete all form fields.', 'warning');
        return;
      }

      const newReview = {
        id: 'rev_' + Date.now(),
        name: name,
        className: className,
        comment: comment,
        stars: 5,
        upvotes: 1,
        date: new Date().toISOString().split('T')[0]
      };

      const currentRevs = getStoredReviews();
      currentRevs.unshift(newReview);
      saveReviewsToStorage(currentRevs);

      renderReviewCard(newReview);
      reviewForm.reset();

      toast.show('Thank you! Your review is now live on NotesPoint! 🚀', 'success');
    });
  }

  renderAllReviews();

  /* ==========================================================================
     14. CLIENT-SIDE INSTANT SEARCH INDEXER & FILTER ENGINE
     ========================================================================== */
  class SearchIndexer {
    constructor() {
      this.index = [];
      this.buildIndex();
    }

    buildIndex() {
      Object.keys(CURRICULUM_DATABASE).forEach((classKey) => {
        const classObj = CURRICULUM_DATABASE[classKey];
        if (classObj.subjects) {
          classObj.subjects.forEach(sub => {
            this.index.push({
              class: classKey,
              stream: 'General',
              subject: sub.name,
              code: sub.code,
              icon: sub.icon,
              chapters: sub.chapters || []
            });
          });
        } else if (classObj.streams) {
          Object.keys(classObj.streams).forEach(streamKey => {
            classObj.streams[streamKey].forEach(sub => {
              this.index.push({
                class: classKey,
                stream: streamKey,
                subject: sub.name,
                code: sub.code,
                icon: sub.icon,
                chapters: sub.chapters || []
              });
            });
          });
        }
      });
    }

    query(keyword) {
      if (!keyword || keyword.trim().length < 2) return [];
      const term = keyword.toLowerCase().trim();
      return this.index.filter(item => {
        return (
          item.subject.toLowerCase().includes(term) ||
          item.code.toLowerCase().includes(term) ||
          item.class.includes(term) ||
          item.stream.toLowerCase().includes(term) ||
          item.chapters.some(c => c.toLowerCase().includes(term))
        );
      });
    }
  }

  const searchEngine = new SearchIndexer();

  /* ==========================================================================
     15. LOCAL BOOKMARKS & SAVED MATERIAL MANAGER
     ========================================================================== */
  class BookmarkManager {
    constructor() {
      this.bookmarks = safeStorageRead(ENGINE_CONFIG.storageKeys.bookmarks, []);
    }

    isBookmarked(noteId) {
      return this.bookmarks.some(b => b.id === noteId);
    }

    toggle(noteItem) {
      if (this.isBookmarked(noteItem.id)) {
        this.bookmarks = this.bookmarks.filter(b => b.id !== noteItem.id);
        toast.show('Removed from saved bookmarks.', 'info');
      } else {
        this.bookmarks.push({ ...noteItem, savedAt: new Date().toISOString() });
        toast.show('Saved to your bookmarks! 🔖', 'success');
      }
      safeStorageWrite(ENGINE_CONFIG.storageKeys.bookmarks, this.bookmarks);
    }
  }

  const bookmarkManager = new BookmarkManager();

  /* ==========================================================================
     16. USER SESSION ANALYTICS & INTERACTION TRACKER
     ========================================================================== */
  class SessionTracker {
    constructor() {
      this.sessionData = safeStorageRead(ENGINE_CONFIG.storageKeys.userSession, {
        startTime: new Date().toISOString(),
        pageViews: 0,
        clicks: 0
      });
      this.sessionData.pageViews += 1;
      safeStorageWrite(ENGINE_CONFIG.storageKeys.userSession, this.sessionData);
      this.bindEvents();
    }

    bindEvents() {
      document.addEventListener('click', () => {
        this.sessionData.clicks += 1;
        safeStorageWrite(ENGINE_CONFIG.storageKeys.userSession, this.sessionData);
      }, { passive: true });
    }
  }

  const sessionTracker = new SessionTracker();

  /* ==========================================================================
     17. BROWSE NAVIGATION & SUBJECT REDIRECTION ENGINE
     ========================================================================== */
  const classPills = document.getElementById('classPills');
  const streamLevel = document.getElementById('streamLevel');
  const streamPills = document.getElementById('streamPills');
  const subjectLevel = document.getElementById('subjectLevel');
  const subjectLevelTitle = document.getElementById('subjectLevelTitle');
  const subjectGrid = document.getElementById('subjectGrid');
  const navPlaceholder = document.getElementById('navPlaceholder');

  let activeClass = '';
  let activeStream = '';

  function classHasStreams(classVal) {
    return Boolean(CURRICULUM_DATABASE[classVal] && CURRICULUM_DATABASE[classVal].streams);
  }

  if (classPills) {
    Object.keys(CURRICULUM_DATABASE).forEach((classVal) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'nav-pill';
      pill.dataset.class = classVal;
      pill.textContent = `Class ${classVal}`;
      pill.addEventListener('click', () => {
        audioFx.playPop();
        selectClassCategory(classVal);
      });
      classPills.appendChild(pill);
    });
  }

  function selectClassCategory(classVal) {
    activeClass = String(classVal);
    activeStream = '';

    if (classPills) {
      Array.from(classPills.children).forEach((pill) => {
        pill.classList.toggle('is-active', pill.dataset.class === activeClass);
      });
    }

    if (classHasStreams(activeClass)) {
      if (streamLevel) streamLevel.hidden = false;
      renderStreamPills(activeClass);
      if (subjectLevel) subjectLevel.hidden = true;
      if (subjectGrid) subjectGrid.innerHTML = '';
    } else {
      if (streamLevel) streamLevel.hidden = true;
      if (streamPills) streamPills.innerHTML = '';
      if (subjectLevel) subjectLevel.hidden = false;
      if (subjectLevelTitle) subjectLevelTitle.textContent = `Class ${activeClass} Core Subjects`;
      renderSubjectCardGrid(CURRICULUM_DATABASE[activeClass].subjects);
    }

    if (navPlaceholder) navPlaceholder.hidden = true;
  }

  function renderStreamPills(classVal) {
    if (!streamPills) return;
    streamPills.innerHTML = '';
    const streamsObj = CURRICULUM_DATABASE[classVal].streams;

    Object.keys(streamsObj).forEach((streamKey) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'nav-pill';
      pill.dataset.stream = streamKey;
      pill.textContent = streamKey;
      pill.addEventListener('click', () => {
        audioFx.playPop();
        selectStreamCategory(classVal, streamKey);
      });
      streamPills.appendChild(pill);
    });
  }

  function selectStreamCategory(classVal, streamKey) {
    activeStream = streamKey;

    if (streamPills) {
      Array.from(streamPills.children).forEach((pill) => {
        pill.classList.toggle('is-active', pill.dataset.stream === streamKey);
      });
    }

    if (subjectLevel) subjectLevel.hidden = false;
    if (subjectLevelTitle) subjectLevelTitle.textContent = `Class ${classVal} · ${streamKey} Subjects`;
    renderSubjectCardGrid(CURRICULUM_DATABASE[classVal].streams[streamKey]);
  }

  function renderSubjectCardGrid(subjectsArray) {
    if (!subjectGrid) return;
    subjectGrid.innerHTML = '';

    subjectsArray.forEach((subObj) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'subject-card';

      const iconSpan = document.createElement('span');
      iconSpan.style.marginRight = '8px';
      iconSpan.textContent = subObj.icon || '📖';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'subject-name';
      nameSpan.textContent = subObj.name;

      card.appendChild(iconSpan);
      card.appendChild(nameSpan);

      if (subObj.isOptional) {
        const badge = document.createElement('span');
        badge.className = 'subject-optional-badge';
        badge.textContent = 'Optional';
        card.appendChild(badge);
      }

      const hint = document.createElement('span');
      hint.className = 'subject-open-hint';
      hint.textContent = 'Open Panel →';
      card.appendChild(hint);

      // Redirection to Login Page
      card.addEventListener('click', () => {
        toast.show(`Redirecting to Student Dashboard for ${subObj.name}...`, 'info', 1400);
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 600);
      });

      subjectGrid.appendChild(card);
    });
  }

  /* ==========================================================================
     18. FOOTER & SMOOTH ANCHOR UTILITIES
     ========================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  const footerYear = document.getElementById('footerYear');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }
 
  enforceHeaderStyling();
  initAdminSyncEngine();

  console.log(`[${ENGINE_CONFIG.platformName}] Enterprise Engine v${ENGINE_CONFIG.version} Fully Loaded.`);

})();

/* =========================================================
   GLOBAL FUNCTION: TOGGLE SYLLABUS READ MORE / READ LESS
   ========================================================= */
function toggleSyllabus(id, btn) {
  const content = document.getElementById(id);
  if (!content) return;

  if (content.hidden) {
    content.hidden = false;
    btn.innerHTML = 'Close Syllabus... ✖';
  } else {
    content.hidden = true;
    btn.innerHTML = 'Read Detailed Syllabus... 📖';
  } 
}

/* =========================================================
   BULLETPROOF MOBILE HAMBURGER TOGGLE & EVENT ENGINE
   ========================================================= */
(function () {
  function setupMobileNav() {
    const toggle = document.getElementById("navToggle") || document.querySelector(".nav-toggle");
    const nav = document.getElementById("mainNav") || document.querySelector(".main-nav");

    if (toggle && nav) {
      const newToggle = toggle.cloneNode(true);
      toggle.parentNode.replaceChild(newToggle, toggle);

      newToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        nav.classList.toggle("is-open");
      });

      document.addEventListener("click", function (e) {
        if (!nav.contains(e.target) && !newToggle.contains(e.target)) {
          nav.classList.remove("is-open");
        }
      });

      nav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
          nav.classList.remove("is-open");
        });
      });
    }
  }

setupMobileNav();

/* =========================================================
     AI CHATBOT TOGGLE LOGIC
     ========================================================= */
  const chatTrigger = document.getElementById('aiChatTrigger');
  const chatWindow = document.getElementById('aiChatWindow');
  const chatClose = document.getElementById('aiChatClose');

  if (chatTrigger && chatWindow) {
    chatTrigger.addEventListener('click', () => {
      chatWindow.hidden = !chatWindow.hidden;
    });
  }

  if (chatClose && chatWindow) {
    chatClose.addEventListener('click', () => {
      chatWindow.hidden = true;
    });
  }

  /* =========================================================
   AI CHATBOT TOGGLE LOGIC (FIXED FOR VEDANTU FLOATING DOCK)
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const chatTrigger = document.getElementById('aiChatTrigger');
  const chatWindow = document.getElementById('aiChatWindow');
  const chatClose = document.getElementById('aiChatClose');

  if (chatTrigger && chatWindow) {
    chatTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (chatWindow.hasAttribute('hidden')) {
        chatWindow.removeAttribute('hidden');
        chatWindow.style.display = 'flex';
      } else {
        chatWindow.setAttribute('hidden', 'true');
        chatWindow.style.display = 'none';
      }
    });
  }

  if (chatClose && chatWindow) {
    chatClose.addEventListener('click', () => {
      chatWindow.setAttribute('hidden', 'true');
      chatWindow.style.display = 'none';
    });
  }
});

/* =========================================================
   HOMEPAGE FEEDBACK FORM SAVER (LOCALSTORAGE & FIRESTORE)
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const fbForm = document.getElementById('homeFeedbackForm');

  if (fbForm) {
    fbForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('fbStudentName').value.trim();
      const email = document.getElementById('fbStudentEmail').value.trim();
      const message = document.getElementById('fbStudentMsg').value.trim();

      const reviewObj = {
        id: 'rev_' + Date.now(),
        name: name,
        email: email,
        comment: message,
        className: 'General Feedback',
        stars: 5,
        status: 'approved',
        createdAt: new Date().toISOString()
      };

      // 1. Save to LocalStorage
      const reviews = JSON.parse(localStorage.getItem('notespoint_student_reviews_v7') || '[]');
      reviews.unshift(reviewObj);
      localStorage.setItem('notespoint_student_reviews_v7', JSON.stringify(reviews));

      // 2. Save to Firestore (if online)
      if (typeof firebase !== 'undefined' && firebase.apps.length) {
        try {
          await firebase.firestore().collection('reviews').doc(reviewObj.id).set(reviewObj);
        } catch (err) {}
      }

      // 3. Send email via FormSubmit in background
      fetch("https://formsubmit.co/ajax/gusainprince7002@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          message: message,
          _subject: "New Homepage Feedback - Notes Point"
        })
      }).catch(() => {});

      alert("🎉 Thank you! Your feedback has been received.");
      fbForm.reset();
    });
  }
});

})();
