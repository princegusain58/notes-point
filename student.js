/* =========================================================
   Notes Point — Modern Student Panel Logic (100% Free & NCERT Books & Competitive)
   ========================================================= */
(() => {
  'use strict';

  const ENGINE_CONFIG = {
    storageKeys: {
      notes: 'notespoint_uploaded_notes_v7',
      ticker: 'notespoint_running_ticker_v7',
      reviews: 'notespoint_student_reviews_v7'
    }
  };

  const firebaseConfig = {
    apiKey: "AIzaSyB8Q233ol5opi0Io8tEp498yDEmMesjmgE",
    authDomain: "notes-point-215c8.firebaseapp.com",
    projectId: "notes-point-215c8",
    storageBucket: "notes-point-215c8.firebasestorage.app",
    messagingSenderId: "945990871633",
    appId: "1:945990871633:web:4cfd8339055182317fa670"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.firestore();
  
  // Clean initialization without deprecation warnings
  db.settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED });

  const notesCollection = db.collection('notes');
  const FieldValue = firebase.firestore.FieldValue;

  /* =========================================================
     LIVE TICKER MANAGER
     ========================================================= */
  function initLiveTicker() {
    const tickerTrack = document.getElementById('tickerPreviewTrack') || document.querySelector('.ticker-track') || document.getElementById('runningTickerText');
    if (!tickerTrack) return;

    const savedTicker = window.localStorage.getItem(ENGINE_CONFIG.storageKeys.ticker);
    if (savedTicker) {
      tickerTrack.textContent = savedTicker;
    }

    db.collection('settings').doc('ticker').get().then((doc) => {
      if (doc.exists && doc.data().text) {
        tickerTrack.textContent = doc.data().text;
      }
    }).catch(() => {});
  }

  /* =========================================================
     REAL STUDENT NAME & SESSION SYNC
     ========================================================= */
  function initStudentSession() {
    const studentNameHeading = document.getElementById('studentName');
    const studentHeaderName = document.getElementById('studentHeaderName');
    const userAvatarLetter = document.getElementById('userAvatarLetter');
    const supportNameInput = document.getElementById('supportNameInput');
    const supportEmailInput = document.getElementById('supportEmailInput');

    const activeName = localStorage.getItem('notespoint_user_name');
    const activeEmail = localStorage.getItem('notespoint_user_email');

    let finalName = "Student";

    if (activeName) {
      finalName = activeName;
    } else if (activeEmail) {
      const rawName = activeEmail.split('@')[0];
      finalName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    } else if (firebase.auth && firebase.auth().currentUser) {
      const user = firebase.auth().currentUser;
      if (user.displayName) {
        finalName = user.displayName;
      } else if (user.email) {
        const rawName = user.email.split('@')[0];
        finalName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      }
    }

    if (studentNameHeading) {
      studentNameHeading.textContent = finalName;
      studentNameHeading.className = "text-gradient-animated";
    }
    if (studentHeaderName) studentHeaderName.textContent = finalName;
    if (userAvatarLetter) userAvatarLetter.textContent = finalName.charAt(0).toUpperCase();
    if (supportNameInput) supportNameInput.value = finalName;
    if (supportEmailInput && activeEmail) supportEmailInput.value = activeEmail;
  }

  initStudentSession();

  /* =========================================================
     LOCAL FEEDBACK / SUPPORT FORM HANDLER (DIRECT TO ADMIN)
     ========================================================= */
  function initFeedbackInterceptor() {
    const supportForm = document.querySelector('#supportSection form') || document.querySelector('form[action*="formsubmit.co"]');
    if (!supportForm) return;

    supportForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = supportForm.querySelector('input[name="name"]') || document.getElementById('supportNameInput');
      const emailInput = supportForm.querySelector('input[name="email"]') || document.getElementById('supportEmailInput');
      const msgInput = supportForm.querySelector('textarea[name="message"]');

      const reviewObj = {
        id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: nameInput ? nameInput.value.trim() : 'Student',
        email: emailInput ? emailInput.value.trim() : '',
        comment: msgInput ? msgInput.value.trim() : '',
        stars: 5,
        rating: 5,
        className: 'Student Support',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Save to LocalStorage
      const reviews = JSON.parse(localStorage.getItem(ENGINE_CONFIG.storageKeys.reviews) || '[]');
      reviews.unshift(reviewObj);
      localStorage.setItem(ENGINE_CONFIG.storageKeys.reviews, JSON.stringify(reviews));

      // Save to Firebase Firestore if online
      if (db) {
        try {
          await db.collection('reviews').doc(reviewObj.id).set(reviewObj);
        } catch (err) {
          console.warn("Review saved locally. Firestore sync pending.");
        }
      }

      alert("🚀 Thank you! Your feedback/request has been sent successfully to Admin.");
      supportForm.reset();
      initStudentSession();
    });
  }

  document.addEventListener('DOMContentLoaded', initFeedbackInterceptor);

  // FREE CURRICULUM WITH NCERT BOOKS & COMPETITIVE EXAMS
  const RESOURCE_EXTRAS = [
    'NCERT Books 📚',
    'Formula & Derivation Sheets', 
    'Previous Year Questions (PYQs)', 
    'Sample Papers'
  ];

  const CURRICULUM = {
    9: { subjects: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit', ...RESOURCE_EXTRAS] },
    10: { subjects: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'IT / Computer', ...RESOURCE_EXTRAS] },
    11: {
      streams: {
        Science: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science', ...RESOURCE_EXTRAS],
        Commerce: ['Accountancy', 'Business Studies', 'Economics', 'English', 'Mathematics', ...RESOURCE_EXTRAS],
        Humanities: ['History', 'Political Science', 'Geography', 'Economics', 'English', 'Psychology', ...RESOURCE_EXTRAS],
      },
    },
    12: {
      streams: {
        PCM: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science', ...RESOURCE_EXTRAS],
        PCB: ['Physics', 'Chemistry', 'Biology', 'English', 'Psychology', ...RESOURCE_EXTRAS],
        Commerce: ['Accountancy', 'Business Studies', 'Economics', 'English', 'Mathematics', ...RESOURCE_EXTRAS],
        'Arts & Humanities': ['History', 'Political Science', 'Geography', 'Economics', 'English', ...RESOURCE_EXTRAS],
      },
    },
    'competitive': { 
      subjects: ['JEE Main & Advanced', 'NEET-UG Biology & Physics', 'CUET General Test', 'NDA Entrance Exam', 'Formula Short Tricks', 'Entrance PYQs'] 
    }
  };

  const BOOKMARKS_KEY = 'notesPointBookmarks';
  const RECENT_KEY = 'notesPointRecentlyViewed';
  const RECENT_LIMIT = 12;

  /* =========================================================
     DARK MODE TOGGLE
     ========================================================= */
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const sunIcon = themeToggleBtn?.querySelector('.theme-icon-sun');
  const moonIcon = themeToggleBtn?.querySelector('.theme-icon-moon');

  function initTheme() {
    const savedTheme = localStorage.getItem('notesPointTheme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      if (sunIcon) sunIcon.hidden = true;
      if (moonIcon) moonIcon.hidden = false;
    }
  }
  initTheme();

  themeToggleBtn?.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('notesPointTheme', isDark ? 'dark' : 'light');
    if (sunIcon) sunIcon.hidden = isDark;
    if (moonIcon) moonIcon.hidden = !isDark;
  });

  const footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  function getBookmarks() { return readJSON(BOOKMARKS_KEY, {}); }

  function toggleBookmark(id, note) {
    const bookmarks = getBookmarks();
    if (bookmarks[id]) {
      delete bookmarks[id];
    } else {
      bookmarks[id] = serializeNote(id, note);
    }
    writeJSON(BOOKMARKS_KEY, bookmarks);
    return !!bookmarks[id];
  }

  function isBookmarked(id) {
    const bookmarks = getBookmarks();
    return !!bookmarks[id];
  }

  function serializeNote(id, note) {
    return {
      id: id || note.id || String(Math.random()),
      title: note.title || '',
      chapter: note.chapter || '',
      subject: note.subject || '',
      class: note.class || '',
      fileUrl: note.fileUrl || '',
    };
  }

  function getRecentlyViewed() { return readJSON(RECENT_KEY, []); }

  function addRecentlyViewed(id, note) {
    const noteObj = serializeNote(id, note);
    const list = getRecentlyViewed().filter((n) => n.fileUrl !== noteObj.fileUrl && n.id !== noteObj.id);
    list.unshift(noteObj);
    writeJSON(RECENT_KEY, list.slice(0, RECENT_LIMIT));
  }

  const savedNotesBtn = document.getElementById('sidebarSavedBtn');
  const recentNotesBtn = document.getElementById('sidebarRecentBtn');

  savedNotesBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    window.switchSection('savedSection');
    const items = Object.values(getBookmarks());
    openLocalListPanel({
      items,
      breadcrumb: 'Saved Notes',
      title: `Your Saved Notes (${items.length})`,
      emptyMessage: "You haven't saved any notes yet. Click the ⭐ button on any note to save it here!",
    });
  });

  recentNotesBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    window.switchSection('recentSection');
    const items = getRecentlyViewed();
    openLocalListPanel({
      items,
      breadcrumb: 'Recently Viewed',
      title: `Recently Viewed Notes (${items.length})`,
      emptyMessage: 'Notes you view will show up here.',
    });
  });

  /* =========================================================
     NAVIGATION & RENDERING (CLASS & SUBJECT BROWSING)
     ========================================================= */
  const classRail = document.getElementById('classRail');
  const classHeaderArea = document.getElementById('classHeaderArea');
  const subjectContainerArea = document.getElementById('subjectContainerArea');
  const backToClassesBtn = document.getElementById('backToClassesBtn');
  const streamLevel = document.getElementById('streamLevel');
  const streamPills = document.getElementById('streamPills');
  const subjectGrid = document.getElementById('subjectGrid');
  const selectedClassTitle = document.getElementById('selectedClassTitle');

  if (backToClassesBtn) {
    backToClassesBtn.textContent = '← Back';
  }

  let activeClass = '';
  let activeStream = '';

  function goToClassStep() {
    if (classRail) {
      classRail.removeAttribute('hidden');
      classRail.style.cssText = 'display: grid !important;';
    }
    if (classHeaderArea) {
      classHeaderArea.removeAttribute('hidden');
      classHeaderArea.style.cssText = 'display: block !important;';
    }
    if (subjectContainerArea) {
      subjectContainerArea.setAttribute('hidden', 'true');
      subjectContainerArea.style.cssText = 'display: none !important;';
    }
    activeClass = '';
    activeStream = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goToSubjectStep(classValue) {
    activeClass = String(classValue);
    activeStream = '';

    if (classRail) {
      classRail.setAttribute('hidden', 'true');
      classRail.style.cssText = 'display: none !important;';
    }
    if (classHeaderArea) {
      classHeaderArea.setAttribute('hidden', 'true');
      classHeaderArea.style.cssText = 'display: none !important;';
    }

    if (subjectContainerArea) {
      subjectContainerArea.removeAttribute('hidden');
      subjectContainerArea.style.cssText = 'display: block !important; margin-top: 0 !important;';
    }

    const titleText = activeClass === 'competitive' ? 'Competitive Entrance Exams' : `Class ${activeClass} — Subjects & Resources`;
    if (selectedClassTitle) {
      selectedClassTitle.innerHTML = `
        ${titleText}
        <span class="board-label" style="display:block; font-size:0.85rem; color:#64748B; margin-top:4px;">
          100% Free Study Materials & NCERT Books
        </span>
      `;
    }

    if (CURRICULUM[activeClass]?.streams) {
      if (streamLevel) streamLevel.hidden = false;
      const streamKeys = Object.keys(CURRICULUM[activeClass].streams);
      const defaultStream = streamKeys[0]; 
      activeStream = defaultStream;
      renderStreamPills(activeClass, defaultStream);
      renderSubjectGrid(CURRICULUM[activeClass].streams[defaultStream]);
    } else {
      if (streamLevel) streamLevel.hidden = true;
      if (streamPills) streamPills.innerHTML = '';
      if (CURRICULUM[activeClass]) {
        renderSubjectGrid(CURRICULUM[activeClass].subjects);
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  classRail?.addEventListener('click', (e) => {
    const card = e.target.closest('.class-card');
    if (card) {
      const targetClass = card.getAttribute('data-class') || card.dataset.class;
      if (targetClass) {
        goToSubjectStep(targetClass);
      }
    }
  });

  backToClassesBtn?.addEventListener('click', goToClassStep);

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-class]');
    if (btn && !btn.closest('#classRail')) {
      const cls = btn.getAttribute('data-class');
      if (cls) {
        window.switchSection('classesSection');
        goToSubjectStep(cls);
      }
    }
  });

  function renderStreamPills(classValue, currentActiveStream) {
    if (!streamPills) return;
    streamPills.innerHTML = '';
    Object.keys(CURRICULUM[classValue].streams).forEach((streamName) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      const isActive = streamName === currentActiveStream;
      pill.className = 'admin-btn-secondary';
      pill.style.cssText = `padding: 8px 18px; border: 1px solid ${isActive ? '#2563EB' : '#CBD5E1'}; border-radius: 8px; background: ${isActive ? '#2563EB' : '#fff'}; color: ${isActive ? '#fff' : '#0F172A'}; cursor: pointer; font-weight: 700; transition: all 0.2s;`;
      pill.textContent = streamName;
      pill.addEventListener('click', () => {
        activeStream = streamName;
        renderStreamPills(classValue, streamName);
        renderSubjectGrid(CURRICULUM[classValue].streams[streamName]);
      });
      streamPills.appendChild(pill);
    });
  }

  /* =========================================================
     SUBJECT CARD RENDERER (100% FREE MATERIALS)
     ========================================================= */
  function renderSubjectGrid(subjects) {
    if (!subjectGrid) return;
    subjectGrid.innerHTML = '';

    const currentClassCover = activeClass === 'competitive' ? 'compitative.jpg' : `class${activeClass || 9}.jpg`;

    subjects.forEach((subjectLabel) => {
      const cleanName = subjectLabel.replace(' (Optional)', '');
      const isExtra = RESOURCE_EXTRAS.includes(cleanName) || cleanName.includes('NCERT Books');

      const card = document.createElement('button');
      card.type = 'button';
      card.className = isExtra ? 'subject-card resource-extra-card' : 'subject-card';
      
      card.innerHTML = `
        <div class="subject-card-banner">
          <span class="free-ribbon-badge" style="background: #10B981; color: #fff;">100% FREE</span>
          <div class="subject-img-wrap">
            <img src="images/${currentClassCover}" alt="${cleanName}" class="subject-cover-img" onerror="this.src='images/class10.jpg'">
          </div>
        </div>
        <div class="subject-card-info">
          <h4 class="subject-card-title">${cleanName}</h4>
          <span class="subject-card-cta">View Materials →</span>
        </div>
      `;

      card.addEventListener('click', () => openNotesPanel({
        classValue: activeClass,
        streamValue: activeStream,
        subjectValue: cleanName,
      }));

      subjectGrid.appendChild(card);
    });
  }

  /* =========================================================
     FLEXIBLE NOTES MODAL & SYNC
     ========================================================= */
  const notesPanel = document.getElementById('notesPanel');
  const notesPanelClose = document.getElementById('notesPanelClose');
  const notesPanelOverlay = document.getElementById('notesPanelOverlay');
  const notesPanelBreadcrumb = document.getElementById('notesPanelBreadcrumb');
  const notesPanelTitle = document.getElementById('notesPanelTitle');
  const notesPanelStatus = document.getElementById('notesPanelStatus');
  const notesPanelGrid = document.getElementById('notesPanelGrid');
  const notesPanelLoading = document.getElementById('notesPanelLoading');
  const notesPanelEmpty = document.getElementById('notesPanelEmpty');
  const notesPanelEmptyMessage = document.getElementById('notesPanelEmptyMessage');

  const pdfViewerModal = document.getElementById('pdfViewerModal');
  const pdfModalOverlay = document.getElementById('pdfModalOverlay');
  const pdfModalContainer = document.getElementById('pdfModalContainer');
  const pdfModalCloseBtn = document.getElementById('pdfModalCloseBtn');
  const pdfMaximizeBtn = document.getElementById('pdfMaximizeBtn');
  const pdfMinimizeBtn = document.getElementById('pdfMinimizeBtn');
  const pdfIframe = document.getElementById('pdfIframe');
  const pdfModalDocumentTitle = document.getElementById('pdfModalDocumentTitle');
  const pdfModalDownloadBtn = document.getElementById('pdfModalDownloadBtn');

  function openPdfModal(url, titleStr) {
    if (pdfViewerModal && pdfIframe) {
      pdfIframe.src = url;
      if (pdfModalDocumentTitle) pdfModalDocumentTitle.textContent = titleStr || 'Chapter Notes PDF';
      if (pdfModalDownloadBtn) pdfModalDownloadBtn.href = url;
      pdfViewerModal.hidden = false;
    }
  }

  function closePdfModal() {
    if (pdfViewerModal) pdfViewerModal.hidden = true;
    if (pdfIframe) pdfIframe.src = '';
    if (pdfModalContainer) pdfModalContainer.classList.remove('is-maximized');
  }

  pdfModalCloseBtn?.addEventListener('click', closePdfModal);
  pdfModalOverlay?.addEventListener('click', closePdfModal);
  pdfMinimizeBtn?.addEventListener('click', closePdfModal);
  pdfMaximizeBtn?.addEventListener('click', () => {
    pdfModalContainer?.classList.toggle('is-maximized');
  });

  function incrementCount(id, field) {
    if (!id) return;
    notesCollection.doc(id).update({ [field]: FieldValue.increment(1) }).catch(() => {});
  }

  function buildNoteCard(id, note) {
    const card = document.createElement('article');
    card.className = 'note-card-row';
    card.style.cssText = `
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      width: 100%;
      box-sizing: border-box;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      transition: all 0.2s ease;
    `;

    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = 'flex: 1; min-width: 0;';

    const title = document.createElement('h3');
    title.style.cssText = 'font-size: 0.88rem; font-weight: 700; color: #0F172A; margin: 0 0 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-transform: uppercase;';
    title.textContent = note.chapter || note.title || 'Untitled Material';

    const subText = document.createElement('p');
    subText.style.cssText = 'font-size: 0.72rem; color: #10B981; margin: 0; font-weight: 600;';
    subText.textContent = `${note.subject || ''} ${note.class ? '(Class ' + note.class + ')' : ''} • 100% Free`;

    infoDiv.append(title, subText);

    const actionsDiv = document.createElement('div');
    actionsDiv.style.cssText = 'display: flex; align-items: center; gap: 6px; flex-shrink: 0;';

    const saved = isBookmarked(id);
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.title = saved ? 'Remove from Saved' : 'Save Note';
    saveBtn.style.cssText = `
      background: ${saved ? '#FEF3C7' : '#F8FAFC'};
      color: ${saved ? '#D97706' : '#94A3B8'};
      border: 1px solid ${saved ? '#FDE68A' : '#E2E8F0'};
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
    `;
    saveBtn.innerHTML = saved ? '★' : '☆';
    
    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isNowSaved = toggleBookmark(id, note);
      saveBtn.innerHTML = isNowSaved ? '★' : '☆';
      saveBtn.style.background = isNowSaved ? '#FEF3C7' : '#F8FAFC';
      saveBtn.style.color = isNowSaved ? '#D97706' : '#94A3B8';
      saveBtn.style.borderColor = isNowSaved ? '#FDE68A' : '#E2E8F0';
    });

    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.title = 'Read Online';
    viewBtn.style.cssText = `
      background: #EFF6FF;
      color: #2563EB;
      border: 1px solid #BFDBFE;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
      cursor: pointer;
    `;
    viewBtn.innerHTML = '👁️';
    viewBtn.addEventListener('click', () => {
      incrementCount(id, 'viewCount');
      addRecentlyViewed(id, note);
      openPdfModal(note.fileUrl, note.chapter || note.title);
    });

    const downloadLink = document.createElement('a');
    downloadLink.href = note.fileUrl || '#';
    downloadLink.target = '_blank';
    downloadLink.title = 'Download PDF';
    downloadLink.download = `${note.chapter || 'note'}.pdf`;
    downloadLink.style.cssText = `
      background: #F0FDF4;
      color: #16A34A;
      border: 1px solid #BBF7D0;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
      text-decoration: none;
      cursor: pointer;
    `;
    downloadLink.innerHTML = '📥';
    downloadLink.addEventListener('click', () => {
      incrementCount(id, 'downloadCount');
      addRecentlyViewed(id, note);
    });

    actionsDiv.append(saveBtn, viewBtn, downloadLink);
    card.append(infoDiv, actionsDiv);

    return card;
  }

  function renderNotesList(notesArray, titleName = '') {
    if (!notesPanelGrid) return;
    notesPanelGrid.innerHTML = '';
    notesPanelGrid.style.cssText = 'display: flex; flex-direction: column; width: 100%;';
    
    if (notesArray.length === 0) {
      if (notesPanelEmpty) {
        notesPanelEmpty.hidden = false;
        notesPanelEmpty.innerHTML = `
          <div class="empty-state-card" style="text-align: center; padding: 25px 15px;">
            <img src="images/empty-state.png" alt="No Notes Found" style="width: 100%; max-width: 180px; height: auto; margin: 0 auto 10px auto; display: block;">
            <h3 style="font-size: 1rem; font-weight: 700; color: #0F172A; margin-bottom: 4px;">No materials available yet</h3>
            <p style="color: #64748B; font-size: 0.82rem; margin: 0;">This shelf is empty right now. Check back soon!</p>
          </div>
        `;
      }
      if (notesPanelStatus) notesPanelStatus.textContent = '';
    } else {
      if (notesPanelEmpty) notesPanelEmpty.hidden = true;
      if (notesPanelStatus) notesPanelStatus.textContent = `${notesArray.length} file(s) available`;
      
      notesArray.forEach((note) => {
        notesPanelGrid.appendChild(buildNoteCard(note.id || Math.random(), note));
      });
    }
  }

  function openNotesPanel({ classValue, streamValue, subjectValue }) {
    if (notesPanelBreadcrumb) notesPanelBreadcrumb.textContent = streamValue ? `Class ${classValue} · ${streamValue}` : `Class ${classValue}`;
    if (notesPanelTitle) notesPanelTitle.textContent = subjectValue;

    if (notesPanel) notesPanel.hidden = false;
    if (notesPanelLoading) notesPanelLoading.hidden = false;
    if (notesPanelEmpty) notesPanelEmpty.hidden = true;
    if (notesPanelGrid) notesPanelGrid.innerHTML = '';

    const localNotes = readJSON(ENGINE_CONFIG.storageKeys.notes, []);
    
    const targetClass = String(classValue).trim().toLowerCase();
    const targetSubject = String(subjectValue).trim().toLowerCase();
    const targetStream = streamValue ? String(streamValue).trim().toLowerCase() : '';

    const isNCERTBookCard = targetSubject.includes('ncert book');
    const isPYQCard = targetSubject.includes('previous year') || targetSubject.includes('pyq');
    const isSampleCard = targetSubject.includes('sample paper');
    const isFormulaCard = targetSubject.includes('formula');

    const filterNoteHelper = (n) => {
      const nClass = String(n.class || '').replace('Class', '').trim().toLowerCase();
      const nSub = String(n.subject || '').trim().toLowerCase();
      const nStream = String(n.stream || '').trim().toLowerCase();
      const nTag = String(n.docType || n.typeTag || n.tag || '').trim().toLowerCase();

      const matchClass = nClass === targetClass || targetClass === 'competitive';
      const matchStream = !targetStream || nStream === targetStream || nStream === 'general' || nStream === 'all';

      if (!matchClass || !matchStream) return false;

      if (isNCERTBookCard) {
        return nTag.includes('ncert book') || nSub.includes('ncert book') || nTag.includes('ncert');
      }
      if (isFormulaCard) {
        return nTag.includes('formula') || nTag.includes('derivation') || nSub.includes('formula');
      }
      if (isPYQCard) {
        return nTag.includes('pyq') || nTag.includes('previous') || nSub.includes('pyq');
      }
      if (isSampleCard) {
        return nTag.includes('sample') || nTag.includes('paper') || nSub.includes('sample');
      }

      return nSub === targetSubject || nSub.includes(targetSubject) || targetSubject.includes(nSub);
    };

    const filteredLocal = localNotes.filter(filterNoteHelper);
    if (notesPanelLoading) notesPanelLoading.hidden = true;
    renderNotesList(filteredLocal, subjectValue);

    if (notesCollection) {
      notesCollection.get().then((snapshot) => {
        const firestoreNotes = [];
        snapshot.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() };
          if (filterNoteHelper(data)) {
            firestoreNotes.push(data);
          }
        });

        const combinedMap = new Map();
        [...filteredLocal, ...firestoreNotes].forEach(item => {
          combinedMap.set(item.fileUrl || item.id || item.chapter, item);
        });
        renderNotesList(Array.from(combinedMap.values()), subjectValue);
      }).catch(() => {});
    }
  }

  function openLocalListPanel({ items, breadcrumb, title, emptyMessage }) {
    if (notesPanelBreadcrumb) notesPanelBreadcrumb.textContent = breadcrumb;
    if (notesPanelTitle) notesPanelTitle.textContent = title;
    if (notesPanel) notesPanel.hidden = false;
    if (notesPanelLoading) notesPanelLoading.hidden = true;
    renderNotesList(items, title);
    if (items.length === 0 && notesPanelEmptyMessage) {
      notesPanelEmptyMessage.textContent = emptyMessage;
    }
  }

  function closeNotesPanel() {
    if (notesPanel) notesPanel.hidden = true;
  }

  notesPanelClose?.addEventListener('click', closeNotesPanel);
  notesPanelOverlay?.addEventListener('click', closeNotesPanel);

  initLiveTicker();

  /* =========================================================
     SIDEBAR SECTION SWITCHING
     ========================================================= */
  const navItems = document.querySelectorAll('.sidebar-menu .nav-item');
  const sections = document.querySelectorAll('.workspace-section');
  const pageSectionTitle = document.getElementById('pageSectionTitle');

  window.switchSection = function(targetId) {
    sections.forEach(sec => {
      if (sec.id === targetId) {
        sec.classList.add('active');
        sec.style.display = 'block';
      } else {
        sec.classList.remove('active');
        sec.style.display = 'none';
      }
    });

    navItems.forEach(item => {
      if (item.getAttribute('data-target') === targetId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    const activeLink = document.querySelector(`.sidebar-menu .nav-item[data-target="${targetId}"]`);
    if (activeLink && pageSectionTitle) {
      pageSectionTitle.textContent = activeLink.querySelector('span')?.textContent || 'Dashboard';
    }
  };

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-target');
      if (target) switchSection(target);
    });
  });

  function updateClock() {
    const clockEl = document.getElementById('adminLiveClock');
    const dateEl = document.getElementById('adminLiveDate');
    const now = new Date();
    
    if (clockEl) clockEl.textContent = '⏰ ' + now.toLocaleTimeString();
    if (dateEl) {
      const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      dateEl.textContent = '📅 ' + now.toLocaleDateString('en-US', options);
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  sections.forEach(sec => {
    if (sec.classList.contains('active')) {
      sec.style.display = 'block';
    } else {
      sec.style.display = 'none';
    }
  });

  /* =========================================================
     MOBILE SIDEBAR TOGGLE FIX
     ========================================================= */
  const mobileBtn = document.getElementById('toggleSidebarMobile') || document.querySelector('.sidebar-toggle-btn');
  const sidebar = document.querySelector('.admin-sidebar') || document.querySelector('.sidebar-drawer');

  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 992 && sidebar) {
        sidebar.classList.remove('open');
      }
    });
  });
})(window);