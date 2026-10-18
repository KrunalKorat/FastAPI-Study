/**
 * FastAPI Study — Digital Textbook Reader Controller (reader.js)
 * Manages chapter loading, Table of Contents generation, scroll progress tracking,
 * active heading spying, font sizing, canvas width, and distraction-free mode.
 */

(function () {
  'use strict';

  let currentChapterId = 5; // Default to first available chapter
  const FONT_SIZES = ['0.95rem', '1.05rem', '1.18rem', '1.3rem'];
  let currentFontSizeIdx = 1;

  const CANVAS_WIDTHS = ['860px', '1060px', '100%'];
  let currentWidthIdx = 0;

  function initReader() {
    if (!window.FASTAPI_STUDY_DATA) {
      console.error('FastAPI Study data pack not loaded!');
      return;
    }

    // Parse URL parameter ?ch=X
    const urlParams = new URLSearchParams(window.location.search);
    const chParam = parseInt(urlParams.get('ch'), 10);
    if (!isNaN(chParam) && chParam >= 1 && chParam <= 19) {
      currentChapterId = chParam;
    }

    // Render TOC & Chapter
    renderSidebarTOC();
    loadChapter(currentChapterId, false);

    // Setup Toolbar Controls
    setupToolbarControls();

    // Setup Scroll Spy & Progress Tracking
    setupScrollTracking();

    // Setup Chapter Filter in Sidebar
    setupSidebarFilter();

    // Listen for PopState (Back/Forward browser buttons)
    window.addEventListener('popstate', (e) => {
      const params = new URLSearchParams(window.location.search);
      const ch = parseInt(params.get('ch'), 10) || 5;
      if (ch !== currentChapterId) {
        currentChapterId = ch;
        loadChapter(currentChapterId, false);
      }
    });

    // Check if URL has hash anchor (e.g. #ch5-section-slug)
    if (window.location.hash) {
      setTimeout(() => {
        const target = document.querySelector(window.location.hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 250);
    }
  }

  // Render Table of Contents Tree in Sidebar
  function renderSidebarTOC() {
    const tocContainer = document.getElementById('sidebar-toc-tree');
    if (!tocContainer) return;

    const parts = window.FASTAPI_STUDY_DATA.parts;
    const chapters = window.FASTAPI_STUDY_DATA.chapters;

    let html = '';

    parts.forEach(part => {
      const partChapters = chapters.filter(c => c.partId === part.id);
      const isCurrentPart = partChapters.some(c => c.id === currentChapterId);
      const collapsedClass = isCurrentPart ? '' : 'collapsed';

      html += `
        <div class="toc-part-group ${collapsedClass}" data-part-id="${part.id}">
          <div class="toc-part-header" tabindex="0" role="button" aria-expanded="${!collapsedClass}">
            <span>${part.title}</span>
            <svg class="toc-part-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <ul class="toc-chapters-list">
      `;

      partChapters.forEach(ch => {
        const isActive = ch.id === currentChapterId;
        const activeClass = isActive ? 'active' : '';
        const badgeHtml = ch.available 
          ? (ch.quiz ? `<span class="toc-ch-badge quiz" title="Assessment Available">Quiz</span>` : '')
          : `<span class="toc-ch-badge pending" title="Source text pending">Pending</span>`;

        html += `
          <li class="toc-chapter-item ${activeClass}" id="toc-item-${ch.id}">
            <a href="textbook.html?ch=${ch.id}" class="toc-chapter-link" data-ch-id="${ch.id}">
              <span class="toc-ch-num">${String(ch.id).padStart(2, '0')}</span>
              <span class="toc-ch-title">${ch.cleanTitle}</span>
              ${badgeHtml}
            </a>
        `;

        // Render in-chapter subsections for active chapter
        if (isActive && ch.sections && ch.sections.length > 0) {
          html += `<ul class="toc-subsections-list" id="toc-subsections-${ch.id}">`;
          ch.sections.forEach(sec => {
            html += `
              <li>
                <a href="#${sec.id}" class="toc-sub-link" data-target-id="${sec.id}">${sec.title}</a>
              </li>
            `;
          });
          html += `</ul>`;
        }

        html += `</li>`;
      });

      html += `
          </ul>
        </div>
      `;
    });

    tocContainer.innerHTML = html;

    // Attach Collapsible Listeners to Part Headers
    const partHeaders = tocContainer.querySelectorAll('.toc-part-header');
    partHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const group = header.closest('.toc-part-group');
        const isCollapsed = group.classList.toggle('collapsed');
        header.setAttribute('aria-expanded', !isCollapsed);
      });
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    });

    // Attach Click Handlers to Chapter Links
    const chLinks = tocContainer.querySelectorAll('.toc-chapter-link');
    chLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const chId = parseInt(link.getAttribute('data-ch-id'), 10);
        if (chId !== currentChapterId) {
          currentChapterId = chId;
          const newUrl = `textbook.html?ch=${chId}`;
          window.history.pushState({ ch: chId }, '', newUrl);
          loadChapter(currentChapterId, true);
        }
      });
    });

    // Close Mobile Drawer upon selecting on small screens
    const subLinks = tocContainer.querySelectorAll('.toc-sub-link');
    subLinks.forEach(sub => {
      sub.addEventListener('click', () => {
        closeMobileSidebar();
      });
    });
  }

  // Load and Render Active Chapter
  function loadChapter(chapterId, scrollToTop = true) {
    const chapters = window.FASTAPI_STUDY_DATA.chapters;
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    // Update Browser Document Title
    document.title = `Chapter ${chapter.id}: ${chapter.cleanTitle} — FastAPI Study`;

    // Active Highlight in TOC
    document.querySelectorAll('.toc-chapter-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.getElementById(`toc-item-${chapter.id}`);
    if (activeItem) {
      activeItem.classList.add('active');
      // Ensure its parent group is expanded
      const parentGroup = activeItem.closest('.toc-part-group');
      if (parentGroup) {
        parentGroup.classList.remove('collapsed');
      }
    }

    // Re-render TOC subsections for new active chapter
    renderSidebarTOC();

    // Render Chapter Main Canvas
    const canvas = document.getElementById('reader-article-content');
    if (!canvas) return;

    let contentHtml = '';

    // Editorial Chapter Header
    contentHtml += `
      <header class="reader-chapter-header">
        <span class="reader-part-badge">${chapter.partTitle}</span>
        <h1 class="reader-chapter-title">Chapter ${chapter.id}: ${chapter.cleanTitle}</h1>
        <div class="reader-meta-bar">
          <div class="reader-meta-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>${chapter.readTime}</span>
          </div>
          <div class="reader-meta-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
            <span>${chapter.videoRef}</span>
          </div>
          ${chapter.quiz ? `
            <div class="reader-meta-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <span>10 MCQs & Assessment Available</span>
            </div>
          ` : ''}
        </div>
      </header>
    `;

    // If Chapter is Unavailable (Chapters 1-4)
    if (!chapter.available) {
      contentHtml += `
        <div class="unavailable-chapter-banner">
          <svg class="banner-warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <div class="banner-text-content">
            <h3>Content Awaiting Upload</h3>
            <p>${chapter.missingNotice}</p>
            <p>You can proceed to read <strong>Chapter 5: Relational Databases</strong> and subsequent complete chapters available right now in the library.</p>
            <a href="textbook.html?ch=5" class="btn btn-primary btn-sm" style="margin-top: 0.5rem; display: inline-flex;">Go to Chapter 5 →</a>
          </div>
        </div>
      `;
    } else {
      // Full Available Chapter Body Content
      contentHtml += `<div class="reader-body">${chapter.htmlContent}</div>`;

      // Launch Quiz Card if quiz exists
      if (chapter.quiz) {
        contentHtml += `
          <div class="quiz-launch-banner">
            <div class="quiz-launch-text">
              <h3>Test Your Mastery on Chapter ${chapter.id}</h3>
              <p>Practice 10 multiple-choice questions, debugging problems, and coding assessments with instant automated grading and absolute zero-tracking privacy.</p>
            </div>
            <a href="quiz.html?ch=${chapter.id}" class="btn btn-primary btn-lg">Launch Chapter Quiz →</a>
          </div>
        `;
      }
    }

    // Bottom Navigation (Prev Chapter / Next Chapter)
    const prevCh = chapters.find(c => c.id === chapter.id - 1);
    const nextCh = chapters.find(c => c.id === chapter.id + 1);

    contentHtml += `
      <nav class="reader-chapter-footer-nav" aria-label="Chapter navigation">
        ${prevCh ? `
          <a href="textbook.html?ch=${prevCh.id}" class="nav-direction-card prev-card" data-ch-id="${prevCh.id}">
            <span class="nav-dir-label">← Previous Chapter</span>
            <span class="nav-dir-title">Ch ${prevCh.id}: ${prevCh.cleanTitle}</span>
          </a>
        ` : '<div></div>'}
        
        ${nextCh ? `
          <a href="textbook.html?ch=${nextCh.id}" class="nav-direction-card next-card" data-ch-id="${nextCh.id}">
            <span class="nav-dir-label" style="text-align: right;">Next Chapter →</span>
            <span class="nav-dir-title" style="text-align: right;">Ch ${nextCh.id}: ${nextCh.cleanTitle}</span>
          </a>
        ` : '<div></div>'}
      </nav>
    `;

    canvas.innerHTML = contentHtml;

    // Attach footer direction card handlers
    canvas.querySelectorAll('.nav-direction-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const nextId = parseInt(card.getAttribute('data-ch-id'), 10);
        currentChapterId = nextId;
        window.history.pushState({ ch: nextId }, '', `textbook.html?ch=${nextId}`);
        loadChapter(currentChapterId, true);
      });
    });

    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Setup Toolbar Controls
  function setupToolbarControls() {
    // Sidebar Toggle
    const sidebarToggleBtn = document.getElementById('toolbar-toggle-sidebar');
    const sidebar = document.getElementById('reader-sidebar');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');

    if (sidebarToggleBtn && sidebar) {
      sidebarToggleBtn.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
          sidebar.classList.toggle('open-mobile');
        } else {
          sidebar.classList.toggle('collapsed');
        }
      });
    }

    if (sidebarCloseBtn && sidebar) {
      sidebarCloseBtn.addEventListener('click', () => {
        sidebar.classList.remove('open-mobile');
      });
    }

    // Font Size Adjuster
    const fontSizeBtn = document.getElementById('toolbar-font-size');
    if (fontSizeBtn) {
      fontSizeBtn.addEventListener('click', () => {
        currentFontSizeIdx = (currentFontSizeIdx + 1) % FONT_SIZES.length;
        const newSize = FONT_SIZES[currentFontSizeIdx];
        document.documentElement.style.setProperty('--reader-font-size', newSize);
        if (window.FastAPIAnimations) {
          window.FastAPIAnimations.showToast(`Text size: ${['Small', 'Medium', 'Large', 'Extra Large'][currentFontSizeIdx]}`);
        }
      });
    }

    // Width Adjuster
    const widthBtn = document.getElementById('toolbar-width');
    if (widthBtn) {
      widthBtn.addEventListener('click', () => {
        currentWidthIdx = (currentWidthIdx + 1) % CANVAS_WIDTHS.length;
        const newWidth = CANVAS_WIDTHS[currentWidthIdx];
        document.documentElement.style.setProperty('--reader-max-width', newWidth);
        if (window.FastAPIAnimations) {
          window.FastAPIAnimations.showToast(`Reading width: ${['Standard', 'Wide', 'Full Page'][currentWidthIdx]}`);
        }
      });
    }

    // Distraction-Free Toggle
    const distractionBtn = document.getElementById('toolbar-distraction-free');
    if (distractionBtn) {
      distractionBtn.addEventListener('click', () => {
        const isDF = document.body.classList.toggle('distraction-free');
        if (isDF) {
          distractionBtn.classList.add('active');
          if (window.FastAPIAnimations) {
            window.FastAPIAnimations.showToast('Distraction-Free Mode Enabled. Press Escape to exit.');
          }
        } else {
          distractionBtn.classList.remove('active');
        }
      });

      // Escape key exits distraction-free
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('distraction-free')) {
          document.body.classList.remove('distraction-free');
          distractionBtn.classList.remove('active');
        }
      });
    }

    // Chapter Quiz Shortcut
    const quizShortcutBtn = document.getElementById('toolbar-quiz-shortcut');
    if (quizShortcutBtn) {
      quizShortcutBtn.addEventListener('click', () => {
        window.location.href = `quiz.html?ch=${currentChapterId}`;
      });
    }
  }

  function closeMobileSidebar() {
    const sidebar = document.getElementById('reader-sidebar');
    if (sidebar) sidebar.classList.remove('open-mobile');
  }

  // Setup Scroll Progress & Active Heading Spy
  function setupScrollTracking() {
    const progressBar = document.getElementById('reading-progress-bar');

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

      if (progressBar) {
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      }

      // Spy on section headings
      const headings = document.querySelectorAll('.textbook-heading');
      let currentSectionId = '';

      headings.forEach(h => {
        const rect = h.getBoundingClientRect();
        if (rect.top <= 140) {
          currentSectionId = h.id;
        }
      });

      if (currentSectionId) {
        const subLinks = document.querySelectorAll('.toc-sub-link');
        subLinks.forEach(link => {
          if (link.getAttribute('data-target-id') === currentSectionId) {
            link.style.color = 'var(--color-accent-orange)';
            link.style.fontWeight = '600';
          } else {
            link.style.color = '';
            link.style.fontWeight = '';
          }
        });
      }
    }, { passive: true });
  }

  // Sidebar Chapter Filter
  function setupSidebarFilter() {
    const filterInput = document.getElementById('sidebar-filter-input');
    if (!filterInput) return;

    filterInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const chItems = document.querySelectorAll('.toc-chapter-item');
      
      chItems.forEach(item => {
        const titleEl = item.querySelector('.toc-ch-title');
        const numEl = item.querySelector('.toc-ch-num');
        const text = (titleEl ? titleEl.textContent : '') + ' ' + (numEl ? numEl.textContent : '');
        if (text.toLowerCase().includes(query)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });

      // Expand all parts during search
      if (query) {
        document.querySelectorAll('.toc-part-group').forEach(g => g.classList.remove('collapsed'));
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initReader);
})();
