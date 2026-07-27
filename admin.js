/* ==========================================================================
   NOTES POINT — ENTERPRISE SUPER ADMIN MASTER JS ENGINE (2026 EDITION FIXED)
   Features: IndexedDB Heavy PDF Engine (100MB+), CORS Bypass, Auto-Subject,
             Visitor Source Tracking, CSV Exporters & Live Sync.
   ========================================================================== */

/* global firebase */

(function (global) {
  'use strict';

  /* ==========================================================================
     01. GLOBAL CONSTANTS & STATE MANAGEMENT
     ========================================================================== */
  const APP_VERSION = '2026.4.15-ENTERPRISE-MEGA';
  const STORAGE_KEYS = {
    notes: 'notespoint_uploaded_notes_v7',
    ticker: 'notespoint_running_ticker_v7',
    reviews: 'notespoint_student_reviews_v7',
    logs: 'notespoint_admin_audit_logs_v7',
    config: 'notespoint_site_config_v7',
    users: 'notespoint_db_users',
    visitors: 'notespoint_visitor_logs_v7'
  };

  const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyB8Q233ol5opi0Io8tEp498yDEmMesjmgE",
    authDomain: "notes-point-215c8.firebaseapp.com",
    projectId: "notes-point-215c8",
    storageBucket: "notes-point-215c8.firebasestorage.app",
    messagingSenderId: "945990871633",
    appId: "1:945990871633:web:4cfd8339055182317fa670"
  };

  const AdminState = {
    isOnline: navigator.onLine,
    firebaseActive: false,
    db: null,
    storage: null,
    activeSection: 'overviewSection',
    queuedFiles: [],
    uploadedFilesCache: [],
    reviewsCache: [],
    auditLogs: [],
    filters: { search: '', classVal: 'ALL', tagVal: 'ALL' },
    audioEnabled: true
  };

  const CURRICULUM_SUBJECTS = {
    '9': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit', 'NCERT Books 📚', 'Formula & Derivation Sheets', 'Previous Year Questions (PYQs)', 'Sample Papers'],
    '10': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'IT / Computer', 'NCERT Books 📚', 'Formula & Derivation Sheets', 'Previous Year Questions (PYQs)', 'Sample Papers'],
    '11': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science', 'Accountancy', 'Business Studies', 'Economics', 'History', 'Political Science', 'Geography', 'Psychology', 'NCERT Books 📚', 'Formula & Derivation Sheets', 'Previous Year Questions (PYQs)', 'Sample Papers'],
    '12': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science', 'Psychology', 'Accountancy', 'Business Studies', 'Economics', 'History', 'Political Science', 'Geography', 'NCERT Books 📚', 'Formula & Derivation Sheets', 'Previous Year Questions (PYQs)', 'Sample Papers'],
    'competitive': ['JEE Main & Advanced', 'NEET-UG Biology & Physics', 'CUET General Test', 'NDA Entrance Exam', 'Formula Short Tricks', 'Entrance PYQs']
  };

  /* ==========================================================================
     02. INDEXEDDB HIGH-CAPACITY STORAGE ENGINE (FOR 100MB+ HEAVY PDFs)
     ========================================================================== */
  class LargeStorageEngine {
    static async openDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open("NotesPointPDFDB", 1);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains("pdf_files")) {
            db.createObjectStore("pdf_files", { keyPath: "id" });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e);
      });
    }

    static async savePDFBlob(id, fileBlob) {
      try {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction("pdf_files", "readwrite");
          const store = tx.objectStore("pdf_files");
          store.put({ id: id, blob: fileBlob, date: new Date().toISOString() });
          tx.oncomplete = () => resolve(true);
          tx.onerror = (e) => reject(e);
        });
      } catch (err) {
        console.warn("IndexedDB Save Failed:", err);
        return false;
      }
    }

    static async getPDFBlob(id) {
      try {
        const db = await this.openDB();
        return new Promise((resolve) => {
          const tx = db.transaction("pdf_files", "readonly");
          const store = tx.objectStore("pdf_files");
          const req = store.get(id);
          req.onsuccess = () => resolve(req.result ? req.result.blob : null);
          req.onerror = () => resolve(null);
        });
      } catch (err) {
        return null;
      }
    }

    static async deletePDFBlob(id) {
      try {
        const db = await this.openDB();
        const tx = db.transaction("pdf_files", "readwrite");
        tx.objectStore("pdf_files").delete(id);
      } catch (err) {}
    }
  }

  /* ==========================================================================
     03. LOCAL STORAGE MANAGER (SAFE PARSER FIX FOR TICKER CRASH)
     ========================================================================== */
  class LocalStorageManager {
    static get(key, fallback = []) {
      try {
        const val = localStorage.getItem(key);
        if (val === null || val === undefined) return fallback;
        try {
          return JSON.parse(val);
        } catch (jsonErr) {
          // Plain text fallback (Fixes 'Unexpected token 🔥' error)
          return val;
        }
      } catch (e) {
        return fallback;
      }
    }

    static set(key, value) {
      try {
        const dataToSave = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, dataToSave);
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  /* ==========================================================================
     04. VISITOR TRAFFIC TRACKER ENGINE
     ========================================================================== */
  class VisitorTrafficTracker {
    static init() {
      const urlParams = new URLSearchParams(window.location.search);
      let sourceRef = urlParams.get('ref') || urlParams.get('source') || urlParams.get('utm_source');

      if (!sourceRef) {
        const referrer = document.referrer.toLowerCase();
        if (referrer.includes('instagram')) sourceRef = 'Instagram';
        else if (referrer.includes('whatsapp')) sourceRef = 'WhatsApp';
        else if (referrer.includes('facebook') || referrer.includes('fb')) sourceRef = 'Facebook';
        else if (referrer.includes('google')) sourceRef = 'Google Search';
        else sourceRef = 'Direct Link / Bookmark';
      }

      const now = new Date();
      const visitorRecord = {
        id: 'vis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: 'Visitor_' + Math.floor(Math.random() * 89999 + 10000),
        source: sourceRef,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString('en-US', { hour12: true }),
        timestamp: now.toISOString()
      };

      let visitors = LocalStorageManager.get(STORAGE_KEYS.visitors, []);
      if (!Array.isArray(visitors)) visitors = [];
      visitors.unshift(visitorRecord);
      LocalStorageManager.set(STORAGE_KEYS.visitors, visitors.slice(0, 500));
      this.renderVisitorsTable();
    }

    static renderVisitorsTable() {
      const tbody = document.getElementById('visitorsTableBody');
      if (!tbody) return;

      let visitors = LocalStorageManager.get(STORAGE_KEYS.visitors, []);
      if (!Array.isArray(visitors)) visitors = [];

      if (visitors.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="table-empty-state">No traffic recorded yet.</td></tr>`;
        return;
      }

      tbody.innerHTML = visitors.slice(0, 50).map(v => `
        <tr>
          <td><strong>${v.name}</strong></td>
          <td><span class="badge-tag blue">${v.source}</span></td>
          <td>${v.date}</td>
          <td>${v.time}</td>
          <td><span class="badge-tag green">ACTIVE</span></td>
        </tr>
      `).join('');
    }
  }

  /* ==========================================================================
     05. SYSTEM LOGGER ENGINE
     ========================================================================== */
  class LoggerEngine {
    static info(msg, context = 'GENERAL') {
      console.log(`%c[INFO][${context}] ${msg}`, 'color: #2563EB; font-weight: bold;');
      LoggerEngine._pushToState(msg, 'INFO');
    }
    static success(msg, context = 'GENERAL') {
      console.log(`%c[SUCCESS][${context}] ${msg}`, 'color: #10B981; font-weight: bold;');
      LoggerEngine._pushToState(msg, 'SUCCESS');
    }
    static warn(msg, context = 'GENERAL') {
      console.warn(`[WARN][${context}] ${msg}`);
      LoggerEngine._pushToState(msg, 'WARN');
    }
    static error(msg, err = null, context = 'GENERAL') {
      console.error(`[ERROR][${context}] ${msg}`, err);
      LoggerEngine._pushToState(`${msg} ${err ? '(' + err.message + ')' : ''}`, 'DANGER');
    }

    static _pushToState(text, tag) {
      let logs = LocalStorageManager.get(STORAGE_KEYS.logs, []);
      if (!Array.isArray(logs)) logs = [];
      const newEntry = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        tag: tag,
        text: text
      };
      logs.unshift(newEntry);
      LocalStorageManager.set(STORAGE_KEYS.logs, logs.slice(0, 50));
      AdminState.auditLogs = logs.slice(0, 50);
      renderAuditLogs();
    }
  }

  function renderAuditLogs() {
    const container = document.getElementById('auditLogsContainer');
    if (!container) return;

    let logs = LocalStorageManager.get(STORAGE_KEYS.logs, []);
    if (!Array.isArray(logs) || logs.length === 0) {
      container.innerHTML = `<div class="log-item"><span class="log-time">Now</span><span class="log-tag info">SYSTEM</span><span>Admin portal active.</span></div>`;
      return;
    }

    container.innerHTML = logs.map(l => `
      <div class="log-item">
        <span class="log-time">${l.time}</span>
        <span class="log-tag info">${l.tag}</span>
        <span>${l.text}</span>
      </div>
    `).join('');
  }

  /* ==========================================================================
     06. WEB AUDIO SYNTHESIZER
     ========================================================================== */
  class AudioSynthesizer {
    static init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
    }

    static playBeep(freq = 440, type = 'sine', duration = 0.1) {
      if (!AdminState.audioEnabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }

    static playSuccess() {
      this.playBeep(523.25, 'sine', 0.1);
      setTimeout(() => this.playBeep(659.25, 'sine', 0.15), 80);
    }

    static playDanger() {
      this.playBeep(220, 'sawtooth', 0.2);
    }

    static playClick() {
      this.playBeep(800, 'triangle', 0.04);
    }
  }

  /* ==========================================================================
     07. FIREBASE CONTROLLER
     ========================================================================== */
  class FirebaseController {
    static init() {
      try {
        if (typeof firebase !== 'undefined') {
          if (!firebase.apps || !firebase.apps.length) {
            firebase.initializeApp(DEFAULT_FIREBASE_CONFIG);
          }
          AdminState.db = firebase.firestore();
          AdminState.storage = firebase.storage();
          AdminState.firebaseActive = true;
          LoggerEngine.success("Firebase Core & Firestore Connected.", "FIREBASE");
          this.setupListeners();
        } else {
          LoggerEngine.warn("Running in local fallback mode.", "FIREBASE");
        }
      } catch (err) {
        LoggerEngine.error("Firebase initialization failed.", err, "FIREBASE");
      }
    }

    static setupListeners() {
      if (!AdminState.firebaseActive || !AdminState.db) return;

      AdminState.db.collection('notes').onSnapshot(snapshot => {
        const cloudNotes = [];
        snapshot.forEach(doc => cloudNotes.push(doc.data()));
        if (cloudNotes.length > 0) {
          LocalStorageManager.set(STORAGE_KEYS.notes, cloudNotes);
          AdminState.uploadedFilesCache = cloudNotes;
          DirectoryManager.render();
          AnalyticsEngine.calculateMetrics();
        }
      }, err => {
        LoggerEngine.warn("Firestore Notes Snapshot restricted. Using local backup.", "FIRESTORE");
      });

      AdminState.db.collection('reviews').onSnapshot(snapshot => {
        const cloudReviews = [];
        snapshot.forEach(doc => cloudReviews.push({ id: doc.id, ...doc.data() }));
        if (cloudReviews.length > 0) {
          LocalStorageManager.set(STORAGE_KEYS.reviews, cloudReviews);
          AdminState.reviewsCache = cloudReviews;
          ReviewModerator.render();
          AnalyticsEngine.calculateMetrics();
        }
      }, err => {
        LoggerEngine.warn("Firestore Reviews Snapshot restricted. Using local backup.", "FIRESTORE");
      });
    }
  }

  /* ==========================================================================
     08. NAVIGATION ROUTER
     ========================================================================== */
  class NavigationRouter {
    static init() {
      const navItems = document.querySelectorAll('.sidebar-menu .nav-item');
      navItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          AudioSynthesizer.playClick();
          const target = item.getAttribute('data-target');
          if (target) this.switchSection(target);
        });
      });

      const mobileBtn = document.getElementById('toggleSidebarMobile');
      if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
          AudioSynthesizer.playClick();
          const sidebar = document.querySelector('.admin-sidebar');
          if (sidebar) sidebar.classList.toggle('open');
        });
      }
    }

    static switchSection(targetId) {
      if (!targetId) return;
      AdminState.activeSection = targetId;

      const sections = document.querySelectorAll('.workspace-section');
      sections.forEach(sec => {
        sec.classList.remove('active');
        if (sec.id === targetId) sec.classList.add('active');
      });

      const navItems = document.querySelectorAll('.sidebar-menu .nav-item');
      navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-target') === targetId) {
          item.classList.add('active');
          const title = document.getElementById('pageSectionTitle');
          const labelSpan = item.querySelector('span');
          if (title && labelSpan) title.textContent = labelSpan.textContent;
        }
      });

      const sidebar = document.querySelector('.admin-sidebar');
      if (sidebar && window.innerWidth <= 992) {
        sidebar.classList.remove('open');
      }

      LoggerEngine.info(`Switched section to ${targetId}`, "NAV");
    }
  }

  global.switchSection = (id) => NavigationRouter.switchSection(id);

  /* ==========================================================================
     09. CLOCK ENGINE
     ========================================================================== */
  class ClockEngine {
    static start() {
      this.update();
      setInterval(() => this.update(), 1000);
    }

    static update() {
      const now = new Date();
      const dateEl = document.getElementById('adminLiveDate');
      const clockEl = document.getElementById('adminLiveClock');

      if (dateEl) {
        dateEl.textContent = `📅 ${now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
      if (clockEl) {
        clockEl.textContent = `⏰ ${now.toLocaleTimeString('en-US', { hour12: true })}`;
      }
    }
  }

  /* ==========================================================================
     10. UPLOADER ENGINE (INDEXEDDB + CORS-PROOF MULTI-PDF ENGINE)
     ========================================================================== */
  class UploaderEngine {
    static init() {
      this.dropZone = document.getElementById('dropZone');
      this.fileInput = document.getElementById('pdfFileInput');
      this.browseBtn = document.getElementById('browsePdfBtn');
      this.selectedList = document.getElementById('selectedFilesList');
      this.form = document.getElementById('pdfUploadForm');
      this.classSelect = document.getElementById('uploadClassSelect');
      this.subjectInput = document.getElementById('uploadSubjectInput');

      if (this.subjectInput && this.subjectInput.tagName !== 'SELECT') {
        const parent = this.subjectInput.parentNode;
        const select = document.createElement('select');
        select.id = 'uploadSubjectInput';
        select.required = true;
        select.className = this.subjectInput.className;
        select.innerHTML = `<option value="" disabled selected>Select class first...</option>`;
        parent.replaceChild(select, this.subjectInput);
        this.subjectInput = select;
      }

      if (this.classSelect) {
        this.classSelect.addEventListener('change', () => {
          this.updateSubjectDropdown(this.classSelect.value);
        });
      }

      if (this.browseBtn && this.fileInput) {
        this.browseBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
      }

      if (this.dropZone) {
        ['dragenter', 'dragover'].forEach(eName => {
          this.dropZone.addEventListener(eName, (e) => {
            e.preventDefault();
            this.dropZone.style.borderColor = 'var(--admin-primary)';
            this.dropZone.style.background = 'var(--admin-primary-light)';
          });
        });

        ['dragleave', 'drop'].forEach(eName => {
          this.dropZone.addEventListener(eName, (e) => {
            e.preventDefault();
            this.dropZone.style.borderColor = '#CBD5E1';
            this.dropZone.style.background = 'var(--admin-bg-subtle)';
          });
        });

        this.dropZone.addEventListener('drop', (e) => {
          this.handleFiles(e.dataTransfer.files);
        });
      }

      if (this.form) {
        this.form.addEventListener('submit', (e) => this.onSubmit(e));
      }
    }

    static updateSubjectDropdown(classVal) {
      const subInput = document.getElementById('uploadSubjectInput');
      if (!subInput) return;
      const subjects = CURRICULUM_SUBJECTS[classVal] || ['General Study Material'];
      subInput.innerHTML = `<option value="" disabled selected>Select Subject</option>` + 
        subjects.map(s => `<option value="${s}">${s}</option>`).join('');
    }

    static handleFiles(files) {
      if (!files) return;
      AudioSynthesizer.playClick();
      AdminState.queuedFiles = Array.from(files).filter(f => f.type === 'application/pdf');

      if (AdminState.queuedFiles.length === 0) {
        ToastEngine.show("Please select valid PDF documents!", "DANGER");
        return;
      }

      if (this.selectedList) {
        this.selectedList.innerHTML = AdminState.queuedFiles.map(f => `
          <div style="background:#FFFFFF; border:1px solid #CBD5E1; padding:10px 14px; border-radius:10px; margin-top:8px; font-size:0.85rem; display:flex; justify-content:space-between; align-items:center;">
            <span>📄 <strong>${f.name}</strong> (${(f.size / (1024 * 1024)).toFixed(2)} MB)</span>
            <span style="color:#10B981; font-weight:700;"><i class="fa-solid fa-circle-check"></i> Ready</span>
          </div>
        `).join('');
      }
      ToastEngine.show(`${AdminState.queuedFiles.length} file(s) attached and ready.`, "INFO");
    }

    static async onSubmit(e) {
      e.preventDefault();

      if (AdminState.queuedFiles.length === 0) {
        ToastEngine.show("Attach at least one PDF file before submitting!", "DANGER");
        return;
      }

      const classVal = document.getElementById('uploadClassSelect') ? document.getElementById('uploadClassSelect').value : '10';
      const streamVal = 'General';
      const subjectVal = document.getElementById('uploadSubjectInput') ? document.getElementById('uploadSubjectInput').value : 'General';
      const chapterVal = document.getElementById('uploadChapterInput') ? document.getElementById('uploadChapterInput').value.trim() : 'Chapter Note';
      const docTypeVal = document.getElementById('uploadDocTypeSelect') ? document.getElementById('uploadDocTypeSelect').value : 'Chapter Note';
      const authorVal = document.getElementById('uploadAuthorInput') ? document.getElementById('uploadAuthorInput').value.trim() : 'NotesPoint Faculty';

      const progressBox = document.getElementById('uploadProgressContainer');
      const progressBar = document.getElementById('uploadProgressBarFill');
      const progressPercent = document.getElementById('uploadProgressPercent');
      const progressStatus = document.getElementById('uploadProgressStatus');

      if (progressBox) progressBox.hidden = false;

      for (let i = 0; i < AdminState.queuedFiles.length; i++) {
        const file = AdminState.queuedFiles[i];
        const fileId = 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

        if (progressStatus) progressStatus.textContent = `Processing & Saving ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)...`;

        for (let p = 10; p <= 90; p += 20) {
          if (progressBar) progressBar.style.width = p + '%';
          if (progressPercent) progressPercent.textContent = p + '%';
          await new Promise(res => setTimeout(res, 80));
        }

        // Save binary PDF blob into IndexedDB
        await LargeStorageEngine.savePDFBlob(fileId, file);

        if (progressBar) progressBar.style.width = '100%';
        if (progressPercent) progressPercent.textContent = '100%';

        const noteDoc = {
          id: fileId,
          title: chapterVal,
          subject: subjectVal,
          class: classVal,
          stream: streamVal,
          docType: docTypeVal,
          fileName: file.name,
          fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          fileSizeRaw: file.size,
          fileUrl: 'indexeddb://' + fileId,
          author: authorVal,
          createdAt: new Date().toISOString()
        };

        if (AdminState.firebaseActive && AdminState.db) {
          try {
            await AdminState.db.collection('notes').doc(fileId).set(noteDoc);
          } catch (err) {
            console.warn("Firestore Document Sync:", err);
          }
        }

        let localNotes = LocalStorageManager.get(STORAGE_KEYS.notes, []);
        if (!Array.isArray(localNotes)) localNotes = [];
        localNotes.unshift(noteDoc);
        LocalStorageManager.set(STORAGE_KEYS.notes, localNotes);
        AdminState.uploadedFilesCache = localNotes;

        LoggerEngine.success(`Uploaded PDF Document: "${chapterVal}"`, "UPLOAD");
      }

      AudioSynthesizer.playSuccess();
      ToastEngine.show("🎉 Heavy PDF Document Uploaded & Saved Successfully!", "SUCCESS");

      if (this.form) this.form.reset();
      AdminState.queuedFiles = [];
      if (this.selectedList) this.selectedList.innerHTML = '';
      if (progressBox) progressBox.hidden = true;

      DirectoryManager.render();
      AnalyticsEngine.calculateMetrics();
    }
  }

  /* ==========================================================================
     11. DIRECTORY MANAGER (SAFE INDEXEDDB PDF BLOB PREVIEW FIX)
     ========================================================================== */
  class DirectoryManager {
    static init() {
      this.tbody = document.getElementById('directoryTableBody');
      this.searchInput = document.getElementById('directorySearchInput');
      this.classFilter = document.getElementById('directoryClassFilter');
      this.tagFilter = document.getElementById('directoryTagFilter');

      if (this.searchInput) {
        this.searchInput.addEventListener('input', () => {
          AdminState.filters.search = this.searchInput.value;
          this.render();
        });
      }

      if (this.classFilter) {
        this.classFilter.addEventListener('change', () => {
          AdminState.filters.classVal = this.classFilter.value;
          this.render();
        });
      }

      if (this.tagFilter) {
        this.tagFilter.addEventListener('change', () => {
          AdminState.filters.tagVal = this.tagFilter.value;
          this.render();
        });
      }
    }

    static render() {
      if (!this.tbody) return;

      let list = LocalStorageManager.get(STORAGE_KEYS.notes, []);
      if (!Array.isArray(list)) list = [];
      AdminState.uploadedFilesCache = list;

      const search = AdminState.filters.search.toLowerCase().trim();
      const cls = AdminState.filters.classVal;
      const tag = AdminState.filters.tagVal;

      list = list.filter(item => {
        const matchSearch = (item.subject || '').toLowerCase().includes(search) || (item.title || '').toLowerCase().includes(search);
        const matchClass = cls === 'ALL' || String(item.class) === String(cls);
        const matchTag = tag === 'ALL' || item.docType === tag;
        return matchSearch && matchClass && matchTag;
      });

      if (list.length === 0) {
        this.tbody.innerHTML = `
          <tr>
            <td colspan="6" class="table-empty-state">
              📂 No study materials found. Try clearing filters or uploading new PDFs.
            </td>
          </tr>
        `;
        return;
      }

      this.tbody.innerHTML = list.map(item => `
        <tr>
          <td><span class="badge-tag blue">Class ${item.class}</span></td>
          <td>
            <strong>${item.subject}</strong><br>
            <span style="font-size:0.75rem; color:#64748B;">${item.stream || 'General'}</span>
          </td>
          <td>
            <strong>${item.title}</strong><br>
            <span style="font-size:0.75rem; color:#64748B;">📄 ${item.fileName || 'file.pdf'} (${item.fileSize || '1.0 MB'})</span>
          </td>
          <td><span class="badge-tag green">${item.docType}</span></td>
          <td style="font-size:0.8rem; color:#64748B;">${item.createdAt ? item.createdAt.split('T')[0] : 'Today'}</td>
          <td>
            <a href="#" onclick="window.openPdfBlob(event, '${item.id}', '${item.fileUrl}')" style="color:#2563EB; font-weight:700; margin-right:12px;" title="Preview"><i class="fa-solid fa-eye"></i></a>
            <button type="button" onclick="window.deleteNoteItem('${item.id}')" style="background:none; border:none; color:#EF4444; font-weight:700; cursor:pointer;" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
          </td>
        </tr>
      `).join('');
    }
  }

  global.openPdfBlob = async (e, id, url) => {
    if (e) e.preventDefault();

    try {
      if (url && url.startsWith('indexeddb://')) {
        const actualId = url.replace('indexeddb://', '');
        const blob = await LargeStorageEngine.getPDFBlob(actualId || id);
        if (blob) {
          const blobUrl = URL.createObjectURL(blob);
          const win = window.open(blobUrl, '_blank');
          if (!win) window.location.href = blobUrl;
          return;
        }
      }

      if (url && url.startsWith('data:')) {
        const res = await fetch(url);
        const blob = await res.blob();
        window.open(URL.createObjectURL(blob), '_blank');
      } else if (url && !url.startsWith('indexeddb://')) {
        window.open(url, '_blank');
      } else {
        alert("PDF File not found in local storage.");
      }
    } catch (err) {
      alert("Error opening PDF file.");
    }
  };

  global.deleteNoteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this document permanently?")) return;
    AudioSynthesizer.playDanger();

    await LargeStorageEngine.deletePDFBlob(id);

    if (AdminState.firebaseActive && AdminState.db) {
      try {
        await AdminState.db.collection('notes').doc(id).delete();
      } catch (e) {}
    }

    let list = LocalStorageManager.get(STORAGE_KEYS.notes, []);
    if (!Array.isArray(list)) list = [];
    list = list.filter(item => item.id !== id);
    LocalStorageManager.set(STORAGE_KEYS.notes, list);

    LoggerEngine.warn(`Deleted PDF document ID: ${id}`, "DIRECTORY");
    ToastEngine.show("Document permanently removed.", "INFO");

    DirectoryManager.render();
    AnalyticsEngine.calculateMetrics();
  };

  /* ==========================================================================
     12. TICKER PUBLISHER
     ========================================================================== */
  class TickerPublisher {
    static init() {
      this.form = document.getElementById('tickerUpdateForm');
      this.input = document.getElementById('tickerTextInput');
      this.preview = document.getElementById('tickerPreviewTrack');

      if (this.input && this.preview) {
        this.input.addEventListener('input', () => {
          this.preview.textContent = this.input.value;
        });
      }

      if (this.form) {
        this.form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const text = this.input.value.trim();
          if (!text) return;

          LocalStorageManager.set(STORAGE_KEYS.ticker, text);

          if (AdminState.firebaseActive && AdminState.db) {
            try {
              await AdminState.db.collection('settings').doc('ticker').set({ 
                text: text, 
                updatedAt: new Date().toISOString() 
              });
            } catch (err) {}
          }

          AudioSynthesizer.playSuccess();
          LoggerEngine.info("Published new running ticker notice.", "TICKER");
          ToastEngine.show("📢 Ticker Notice Published Live to Index page!", "SUCCESS");
        });
      }

      const saved = LocalStorageManager.get(STORAGE_KEYS.ticker, null);
      if (saved && typeof saved === 'string' && this.input && this.preview) {
        this.input.value = saved;
        this.preview.textContent = saved;
      }
    }
  }

  /* ==========================================================================
     13. REVIEW MODERATOR
     ========================================================================== */
  class ReviewModerator {
    static render() {
      const container = document.getElementById('adminReviewsList');
      const badge = document.getElementById('pendingReviewsBadge');
      if (!container) return;

      let reviews = LocalStorageManager.get(STORAGE_KEYS.reviews, []);
      if (!Array.isArray(reviews)) reviews = [];

      AdminState.reviewsCache = reviews;

      const pending = reviews.filter(r => !r.status || r.status === 'pending');
      if (badge) badge.textContent = pending.length;

      if (pending.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; text-align:center; padding:30px; background:#F8FAFC; border:1px dashed #CBD5E1; border-radius:12px;">
            <p style="color:#64748B; font-weight:600;">✨ No pending student reviews to moderate.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = pending.map(r => `
        <div class="review-mod-card">
          <div>
            <div style="font-size:1rem; margin-bottom:6px;">${'⭐'.repeat(r.stars || r.rating || 5)}</div>
            <p style="font-style:italic; font-size:0.9rem; color:#334155; margin-bottom:12px;">"${r.comment || r.message || r.text || ''}"</p>
            <strong style="color:#0F172A; font-size:0.9rem;">${r.name || r.studentName || 'Student'}</strong> 
            <span style="font-size:0.78rem; color:#2563EB;">(${r.className || r.class || 'General'})</span>
          </div>
          <div class="mod-actions">
            <button class="btn-mod-approve" onclick="window.approveReview('${r.id}')">Approve</button>
            <button class="btn-mod-reject" onclick="window.rejectReview('${r.id}')">Reject</button>
          </div>
        </div>
      `).join('');
    }
  }

  global.approveReview = (id) => {
    let revs = LocalStorageManager.get(STORAGE_KEYS.reviews, []);
    if (!Array.isArray(revs)) return;
    const target = revs.find(r => r.id === id);
    if (target) {
      target.status = 'approved';
      LocalStorageManager.set(STORAGE_KEYS.reviews, revs);

      if (AdminState.firebaseActive && AdminState.db) {
        AdminState.db.collection('reviews').doc(id).update({ status: 'approved' }).catch(() => {});
      }

      AudioSynthesizer.playSuccess();
      LoggerEngine.success(`Approved review from: ${target.name || 'Student'}`, "REVIEW");
      ToastEngine.show("Review approved and live on website!", "SUCCESS");
      ReviewModerator.render();
      AnalyticsEngine.calculateMetrics();
    }
  };

  global.rejectReview = (id) => {
    let revs = LocalStorageManager.get(STORAGE_KEYS.reviews, []);
    if (!Array.isArray(revs)) return;
    revs = revs.filter(r => r.id !== id);
    LocalStorageManager.set(STORAGE_KEYS.reviews, revs);

    if (AdminState.firebaseActive && AdminState.db) {
      AdminState.db.collection('reviews').doc(id).delete().catch(() => {});
    }

    AudioSynthesizer.playDanger();
    LoggerEngine.warn(`Rejected review ID: ${id}`, "REVIEW");
    ToastEngine.show("Review rejected.", "INFO");
    ReviewModerator.render();
    AnalyticsEngine.calculateMetrics();
  };

  /* ==========================================================================
     14. ANALYTICS ENGINE
     ========================================================================== */
  class AnalyticsEngine {
    static calculateMetrics() {
      let notes = LocalStorageManager.get(STORAGE_KEYS.notes, []);
      let reviews = LocalStorageManager.get(STORAGE_KEYS.reviews, []);
      let users = LocalStorageManager.get(STORAGE_KEYS.users, []);

      if (!Array.isArray(notes)) notes = [];
      if (!Array.isArray(reviews)) reviews = [];
      if (!Array.isArray(users)) users = [];

      const notesEl = document.getElementById('statTotalNotes');
      const usersEl = document.getElementById('statTotalUsers');
      const storageEl = document.getElementById('storageUsage') || document.getElementById('statStorageUsed');
      const progressEl = document.getElementById('storageProgressBar');
      const reviewsEl = document.getElementById('statApprovedReviews') || document.getElementById('approvedFeedbackCount');

      if (notesEl) notesEl.textContent = notes.length;
      if (usersEl) usersEl.textContent = users.length;

      let bytes = 0;
      notes.forEach(n => {
        bytes += (n.fileSizeRaw || 1500000);
      });
      const mb = (bytes / (1024 * 1024)).toFixed(1);

      if (storageEl) storageEl.textContent = `${mb} MB / 5 GB`;
      if (progressEl) progressEl.style.width = `${Math.min((mb / 5000) * 100, 100)}%`;

      if (reviewsEl) {
        reviewsEl.textContent = reviews.length;
      }
    }
  }

  /* ==========================================================================
     15. TOAST ENGINE
     ========================================================================== */
  class ToastEngine {
    static show(message, type = 'INFO') {
      let container = document.getElementById('toastContainer');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = 'position:fixed; bottom:24px; right:24px; z-index:9999; display:flex; flex-direction:column; gap:10px;';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      const colors = {
        SUCCESS: '#10B981',
        DANGER: '#EF4444',
        INFO: '#2563EB',
        WARN: '#F59E0B'
      };

      toast.style.cssText = `background:#0F172A; color:#FFFFFF; border-left:4px solid ${colors[type] || colors.INFO}; padding:14px 20px; border-radius:10px; font-size:0.9rem; font-weight:600; box-shadow: 0 10px 25px rgba(0,0,0,0.2); transition: all 0.3s ease; transform: translateY(20px); opacity:0;`;
      toast.innerHTML = `<span>${message}</span>`;

      container.appendChild(toast);
      setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
      }, 10);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }
  }

  /* ==========================================================================
     16. EXCEL / CSV EXPORTER
     ========================================================================== */
  class UsersExcelExporter {
    static init() {
      const exportUsersBtn = document.getElementById('downloadUsersExcelBtn');
      if (exportUsersBtn) {
        exportUsersBtn.addEventListener('click', () => this.exportVisitorsToCSV());
      }

      const exportFeedbackBtn = document.getElementById('exportFeedbackExcelBtn');
      if (exportFeedbackBtn) {
        exportFeedbackBtn.addEventListener('click', () => this.exportFeedbacksToCSV());
      }
    }

    static exportVisitorsToCSV() {
      AudioSynthesizer.playSuccess();
      let visitors = LocalStorageManager.get(STORAGE_KEYS.visitors, []);
      if (!Array.isArray(visitors) || visitors.length === 0) {
        ToastEngine.show("No visitor traffic data recorded yet!", "WARN");
        return;
      }

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Visitor ID/Name,Traffic Source (Kahan se aaya),Date,Time\r\n";

      visitors.forEach(v => {
        csvContent += `"${v.name}","${v.source}","${v.date}","${v.time}"\r\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `NotesPoint_Live_Visitors_Traffic_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      ToastEngine.show("📥 Visitors Traffic Excel Sheet Downloaded Successfully!", "SUCCESS");
    }

    static exportFeedbacksToCSV() {
      AudioSynthesizer.playSuccess();
      let reviews = LocalStorageManager.get(STORAGE_KEYS.reviews, []);
      if (!Array.isArray(reviews) || reviews.length === 0) {
        ToastEngine.show("No feedback data available to export!", "WARN");
        return;
      }

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Student Name,Rating,Review Message,Status\r\n";

      reviews.forEach(rev => {
        const name = (rev.name || rev.studentName || 'Student').replace(/"/g, '""');
        const rating = rev.stars || rev.rating || '5';
        const msg = (rev.comment || rev.message || rev.text || '').replace(/"/g, '""').replace(/\n/g, ' ');
        const status = rev.status || 'approved';

        csvContent += `"${name}","${rating} Stars","${msg}","${status}"\r\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `NotesPoint_Student_Feedbacks_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      ToastEngine.show("📊 Student Feedbacks Excel Sheet Downloaded!", "SUCCESS");
    }
  }

  /* ==========================================================================
     17. BACKUP CONTROLS
     ========================================================================== */
  function setupBackupControls() {
    const backupBtn = document.getElementById('quickBackupBtn');
    if (backupBtn) {
      backupBtn.addEventListener('click', () => {
        AudioSynthesizer.playSuccess();
        const data = {
          version: APP_VERSION,
          notes: LocalStorageManager.get(STORAGE_KEYS.notes, []),
          reviews: LocalStorageManager.get(STORAGE_KEYS.reviews, []),
          ticker: LocalStorageManager.get(STORAGE_KEYS.ticker, ''),
          visitors: LocalStorageManager.get(STORAGE_KEYS.visitors, []),
          exportedAt: new Date().toISOString()
        };

        const uri = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const link = document.createElement('a');
        link.setAttribute("href", uri);
        link.setAttribute("download", `NotesPoint_Admin_Backup_${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        ToastEngine.show("System JSON Data Exported!", "SUCCESS");
      });
    }

    const clearCacheBtn = document.getElementById('btnForceClearCache');
    if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', () => {
        if (confirm("Flush local cache? (Cloud data remains secure)")) {
          localStorage.clear();
          ToastEngine.show("Cache flushed successfully!", "INFO");
          setTimeout(() => location.reload(), 500);
        }
      });
    }
  }

  /* ==========================================================================
     18. BOOTSTRAPPER
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    VisitorTrafficTracker.init();
    FirebaseController.init();
    NavigationRouter.init();
    ClockEngine.start();
    UploaderEngine.init();
    DirectoryManager.init();
    TickerPublisher.init();
    ReviewModerator.render();
    AnalyticsEngine.calculateMetrics();
    renderAuditLogs();
    setupBackupControls();
    UsersExcelExporter.init();
  });

})(window);
