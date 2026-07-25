/* ==========================================================================
   NOTES POINT — ENTERPRISE SUPER ADMIN JavaScript ENGINE (2026 EDITION)
   Architecture: Modular SaaS Master Core System (CORS & Mobile PDF Patched)
   ========================================================================== */

/* global firebase */

(function (global) {
  'use strict';

  /* ==========================================================================
     01. GLOBAL APPLICATION STATE & CONSTANTS
     ========================================================================== */
  const APP_VERSION = '2026.4.12-ENTERPRISE';
  const STORAGE_KEYS = {
    notes: 'notespoint_uploaded_notes_v7',
    ticker: 'notespoint_running_ticker_v7',
    reviews: 'notespoint_student_reviews_v7',
    logs: 'notespoint_admin_audit_logs_v7',
    config: 'notespoint_site_config_v7',
    users: 'notespoint_db_users'
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

  /* ==========================================================================
     02. LOCAL STORAGE MANAGER
     ========================================================================== */
  class LocalStorageManager {
    static get(key, fallback = []) {
      try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : fallback;
      } catch (e) {
        return fallback;
      }
    }

    static set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  /* ==========================================================================
     03. SYSTEM LOGGER ENGINE
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
      const logs = LocalStorageManager.get(STORAGE_KEYS.logs, []);
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

    const logs = LocalStorageManager.get(STORAGE_KEYS.logs, []);
    if (logs.length === 0) {
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
     04. WEB AUDIO SYNTHESIZER
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
      } catch (e) {
        /* Ignore Audio Restrictions */
      }
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
     05. FIREBASE CONTROLLER
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
     06. NAVIGATION ROUTER
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
     07. CLOCK ENGINE
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
     08. UPLOADER ENGINE (WITH SMART CLASS/STREAM DEPENDENCY)
     ========================================================================== */
  class UploaderEngine {
    static init() {
      this.dropZone = document.getElementById('dropZone');
      this.fileInput = document.getElementById('pdfFileInput');
      this.browseBtn = document.getElementById('browsePdfBtn');
      this.selectedList = document.getElementById('selectedFilesList');
      this.form = document.getElementById('pdfUploadForm');
      this.classSelect = document.getElementById('uploadClassSelect');
      this.streamSelect = document.getElementById('uploadStreamSelect');

      if (this.classSelect && this.streamSelect) {
        this.classSelect.addEventListener('change', () => {
          const val = this.classSelect.value;
          if (val === '11' || val === '12') {
            this.streamSelect.disabled = false;
            this.streamSelect.style.opacity = '1';
          } else {
            this.streamSelect.value = 'General';
            this.streamSelect.disabled = true;
            this.streamSelect.style.opacity = '0.6';
          }
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
      const streamVal = document.getElementById('uploadStreamSelect') ? document.getElementById('uploadStreamSelect').value : 'General';
      const subjectVal = document.getElementById('uploadSubjectInput') ? document.getElementById('uploadSubjectInput').value.trim() : 'General';
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

        if (progressStatus) progressStatus.textContent = `Processing ${file.name}...`;
        if (progressBar) progressBar.style.width = '60%';
        if (progressPercent) progressPercent.textContent = '60%';

        const downloadURL = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.readAsDataURL(file);
        });

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
          fileUrl: downloadURL,
          author: authorVal,
          createdAt: new Date().toISOString()
        };

        if (AdminState.firebaseActive && AdminState.db) {
          try {
            await AdminState.db.collection('notes').doc(fileId).set(noteDoc);
          } catch (err) {
            console.warn("Firestore sync stored locally:", err);
          }
        }

        const localNotes = LocalStorageManager.get(STORAGE_KEYS.notes, []);
        localNotes.unshift(noteDoc);
        LocalStorageManager.set(STORAGE_KEYS.notes, localNotes);
        AdminState.uploadedFilesCache = localNotes;

        LoggerEngine.success(`Uploaded PDF: "${chapterVal}"`, "UPLOAD");
      }

      AudioSynthesizer.playSuccess();
      ToastEngine.show("🎉 Document(s) uploaded successfully to Live Platform!", "SUCCESS");

      if (this.form) this.form.reset();
      AdminState.queuedFiles = [];
      if (this.selectedList) this.selectedList.innerHTML = '';
      if (progressBox) progressBox.hidden = true;

      DirectoryManager.render();
      AnalyticsEngine.calculateMetrics();
    }
  }

  /* ==========================================================================
     09. DIRECTORY MANAGER (MOBILE BLOB VIEWER HANDLER)
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
            <a href="#" onclick="window.openPdfBlob(event, '${item.fileUrl}')" style="color:#2563EB; font-weight:700; margin-right:12px;" title="Preview"><i class="fa-solid fa-eye"></i></a>
            <button type="button" onclick="window.deleteNoteItem('${item.id}')" style="background:none; border:none; color:#EF4444; font-weight:700; cursor:pointer;" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
          </td>
        </tr>
      `).join('');
    }
  }

  // Mobile Safe Blob Opener Handler
  global.openPdfBlob = async (e, url) => {
    if (e) e.preventDefault();
    if (!url) return;

    try {
      // Agar base64 data URL hai toh usko blob mein convert karo taaki mobile par khul sake
      if (url.startsWith('data:')) {
        const res = await fetch(url);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } else {
        window.open(url, '_blank');
      }
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  global.deleteNoteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this document permanently?")) return;
    AudioSynthesizer.playDanger();

    if (AdminState.firebaseActive && AdminState.db) {
      try {
        await AdminState.db.collection('notes').doc(id).delete();
      } catch (e) {
        /* Local delete continues */
      }
    }

    let list = LocalStorageManager.get(STORAGE_KEYS.notes, []);
    list = list.filter(item => item.id !== id);
    LocalStorageManager.set(STORAGE_KEYS.notes, list);

    LoggerEngine.warn(`Deleted PDF document ID: ${id}`, "DIRECTORY");
    ToastEngine.show("Document permanently removed.", "INFO");

    DirectoryManager.render();
    AnalyticsEngine.calculateMetrics();
  };

  /* ==========================================================================
     10. TICKER PUBLISHER
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
      if (saved && this.input && this.preview) {
        this.input.value = saved;
        this.preview.textContent = saved;
      }
    }
  }

  /* ==========================================================================
     11. REVIEW MODERATOR
     ========================================================================== */
  class ReviewModerator {
    static render() {
      const container = document.getElementById('adminReviewsList');
      const badge = document.getElementById('pendingReviewsBadge');
      if (!container) return;

      const reviews = LocalStorageManager.get(STORAGE_KEYS.reviews, []);
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
     12. ANALYTICS ENGINE
     ========================================================================== */
  class AnalyticsEngine {
    static calculateMetrics() {
      const notes = LocalStorageManager.get(STORAGE_KEYS.notes, []);
      const reviews = LocalStorageManager.get(STORAGE_KEYS.reviews, []);
      const users = LocalStorageManager.get(STORAGE_KEYS.users, []);

      const notesEl = document.getElementById('statTotalNotes');
      const usersEl = document.getElementById('statTotalUsers');
      const storageEl = document.getElementById('statStorageUsed');
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
     13. TOAST ENGINE
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
     14. USERS & FEEDBACK EXCEL / CSV DOWNLOAD ENGINE
     ========================================================================== */
  class UsersExcelExporter {
    static init() {
      const exportUsersBtn = document.getElementById('downloadUsersExcelBtn');
      if (exportUsersBtn) {
        exportUsersBtn.addEventListener('click', () => this.exportUsersToCSV());
      }

      const exportFeedbackBtn = document.getElementById('exportFeedbackExcelBtn');
      if (exportFeedbackBtn) {
        exportFeedbackBtn.addEventListener('click', () => this.exportFeedbacksToCSV());
      }
    }

    static exportUsersToCSV() {
      AudioSynthesizer.playSuccess();
      const users = LocalStorageManager.get(STORAGE_KEYS.users, []);

      if (users.length === 0) {
        ToastEngine.show("No registered users found in storage yet!", "WARN");
        return;
      }

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Full Name,Email Address,Password,Role\r\n";

      users.forEach(user => {
        const row = `"${user.name || ''}","${user.email || ''}","${user.password || ''}","${user.role || 'student'}"`;
        csvContent += row + "\r\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `NotesPoint_Registered_Users_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      LoggerEngine.success("Downloaded registered users list as Excel/CSV spreadsheet.", "EXPORT");
      ToastEngine.show("📥 Users Excel Sheet Downloaded Successfully!", "SUCCESS");
    }

    static exportFeedbacksToCSV() {
      AudioSynthesizer.playSuccess();
      const reviews = LocalStorageManager.get(STORAGE_KEYS.reviews, []);

      if (reviews.length === 0) {
        ToastEngine.show("Abhi tak koi student feedback receive nahi hua hai!", "WARN");
        return;
      }

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Student Name,Class/Subject,Rating,Review Message,Date,Status\r\n";

      reviews.forEach(rev => {
        const name = (rev.name || rev.studentName || 'Student').replace(/"/g, '""');
        const targetCls = (rev.className || rev.class || rev.subject || 'General').replace(/"/g, '""');
        const rating = rev.stars || rev.rating || '5';
        const msg = (rev.comment || rev.message || rev.text || '').replace(/"/g, '""').replace(/\n/g, ' ');
        const dateStr = rev.date || rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Today';
        const status = rev.status || 'approved';

        csvContent += `"${name}","${targetCls}","${rating} Stars","${msg}","${dateStr}","${status}"\r\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `NotesPoint_Student_Feedbacks_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      LoggerEngine.success("Downloaded student feedbacks list as Excel/CSV spreadsheet.", "EXPORT");
      ToastEngine.show("📊 Student Feedbacks Excel Sheet Downloaded!", "SUCCESS");
    }
  }

  global.downloadUsersExcel = () => UsersExcelExporter.exportUsersToCSV();
  global.exportFeedbacksExcel = () => UsersExcelExporter.exportFeedbacksToCSV();

  /* ==========================================================================
     15. BACKUP CONTROLS
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
          users: LocalStorageManager.get(STORAGE_KEYS.users, []),
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
     16. BOOTSTRAPPER
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
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
