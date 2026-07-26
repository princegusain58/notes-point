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

  const notesCollection = db.collection('notes');
  const FieldValue = firebase.firestore.FieldValue;

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

  function initStudentSession() {
    const studentNameHeading = document.getElementById('studentName');
    const studentHeaderName = document.getElementById('studentHeaderName');
    const userAvatarLetter = document.getElementById('userAvatarLetter');
    const supportNameInput = document.getElementById('supportNameInput');
    const supportEmailInput = document.getElementById('supportEmailInput');

    const activeName = localStorage.getItem('notespoint_user_name');
    const activeEmail = localStorage.getItem('notespoint_user_email');
    let finalName = "Topper";

    if (activeName) {
      finalName = activeName;
    } else if (activeEmail) {
      const rawName = activeEmail.split('@')[0];
      finalName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
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

  const classRail = document.getElementById('classRail');
  const classHeaderArea = document.getElementById('classHeaderArea');
  const subjectContainerArea = document.getElementById('subjectContainerArea');
  const backToClassesBtn = document.getElementById('backToClassesBtn');
  const streamLevel = document.getElementById('streamLevel');
  const streamPills = document.getElementById('streamPills');
  const subjectGrid = document.getElementById('subjectGrid');
  const selectedClassTitle = document.getElementById('selectedClassTitle');

  if (backToClassesBtn) backToClassesBtn.textContent = '← Back';

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
      if (targetClass) goToSubjectStep(targetClass);
    }
  });

  backToClassesBtn?.addEventListener('click', goToClassStep);

  function renderStreamPills(classValue, currentActiveStream) {
    if (!streamPills) return;
    streamPills.innerHTML = '';
    Object.keys(CURRICULUM[classValue].streams).forEach((streamName) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      const isActive = streamName === currentActiveStream;
      pill.className = 'admin-btn-secondary';
      pill.style.cssText = `padding: 8px 18px; border: 1px solid ${isActive ? '#2563EB' : '#CBD5E1'}; border-radius: 8px; background: ${isActive ? '#2563EB' : '#fff'}; color: ${isActive ? '#fff' : '#0F172A'}; cursor: pointer; font-weight: 700;`;
      pill.textContent = streamName;
      pill.addEventListener('click', () => {
        activeStream = streamName;
        renderStreamPills(classValue, streamName);
        renderSubjectGrid(CURRICULUM[classValue].streams[streamName]);
      });
      streamPills.appendChild(pill);
    });
  }

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
            <img src="${currentClassCover}" alt="${cleanName}" class="subject-cover-img" onerror="this.src='class10.jpg'">
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

  const notesPanel = document.getElementById('notesPanel');
  const notesPanelClose = document.getElementById('notesPanelClose');
  const notesPanelOverlay = document.getElementById('notesPanelOverlay');
  const notesPanelBreadcrumb = document.getElementById('notesPanelBreadcrumb');
  const notesPanelTitle = document.getElementById('notesPanelTitle');
  const notesPanelStatus = document.getElementById('notesPanelStatus');
  const notesPanelGrid = document.getElementById('notesPanelGrid');
  const notesPanelLoading = document.getElementById('notesPanelLoading');
  const notesPanelEmpty = document.getElementById('notesPanelEmpty');

  function openPdfInNewTab(url) {
    if (!url) { alert("PDF file URL not found."); return; }
    window.open(url, '_blank');
  }

  function buildNoteCard(id, note) {
    const card = document.createElement('article');
    card.style.cssText = 'background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px 12px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%;';
    
    card.innerHTML = `
      <div style="flex: 1; min-width: 0;">
        <h3 style="font-size: 0.88rem; font-weight: 700; color: #0F172A; margin: 0 0 2px 0; text-transform: uppercase;">${note.chapter || note.title || 'Untitled'}</h3>
        <p style="font-size: 0.72rem; color: #10B981; margin: 0; font-weight: 600;">${note.subject || ''} • 100% Free</p>
      </div>
      <div>
        <button type="button" onclick="window.open('${note.fileUrl}', '_blank')" style="background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; width: 32px; height: 32px; border-radius: 6px; cursor: pointer;">👁️</button>
      </div>
    `;
    return card;
  }

  function renderNotesList(notesArray) {
    if (!notesPanelGrid) return;
    notesPanelGrid.innerHTML = '';
    if (notesArray.length === 0) {
      if (notesPanelEmpty) notesPanelEmpty.hidden = false;
    } else {
      if (notesPanelEmpty) notesPanelEmpty.hidden = true;
      notesArray.forEach((note) => {
        notesPanelGrid.appendChild(buildNoteCard(note.id || Math.random(), note));
      });
    }
  }

  function openNotesPanel({ classValue, streamValue, subjectValue }) {
    if (notesPanelBreadcrumb) notesPanelBreadcrumb.textContent = streamValue ? `Class ${classValue} · ${streamValue}` : `Class ${classValue}`;
    if (notesPanelTitle) notesPanelTitle.textContent = subjectValue;
    if (notesPanel) notesPanel.hidden = false;
    
    const localNotes = JSON.parse(localStorage.getItem('notespoint_uploaded_notes_v7') || '[]');
    renderNotesList(localNotes);
  }

  notesPanelClose?.addEventListener('click', () => { if (notesPanel) notesPanel.hidden = true; });

  window.switchSection = function(targetId) {
    document.querySelectorAll('.workspace-section').forEach(sec => {
      sec.style.display = sec.id === targetId ? 'block' : 'none';
    });
    if (targetId === 'classesSection') goToClassStep();
  };

  document.addEventListener('DOMContentLoaded', goToClassStep);
})(window);
