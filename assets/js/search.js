/**
 * FastAPI Study — Client-Side Search Engine (search.js)
 * High-speed search across all 19 textbook chapters, section headings, and content bodies.
 * Supports keyboard shortcuts (Ctrl+K, /), snippet contextualization, and direct section jumping.
 */

(function () {
  'use strict';

  let searchModal = null;
  let searchInput = null;
  let resultsContainer = null;
  let currentResults = [];
  let selectedIndex = -1;

  function initSearch() {
    searchModal = document.getElementById('search-modal');
    searchInput = document.getElementById('search-input');
    resultsContainer = document.getElementById('search-results');

    if (!searchModal || !searchInput || !resultsContainer) return;

    // Trigger buttons
    const triggerBtns = document.querySelectorAll('.search-trigger-btn');
    triggerBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openSearch();
      });
    });

    // Close buttons
    const closeBtns = document.querySelectorAll('.search-close-btn');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        closeSearch();
      });
    });

    // Backdrop click
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) {
        closeSearch();
      }
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // Open with Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (searchModal.classList.contains('open')) {
          closeSearch();
        } else {
          openSearch();
        }
      }
      // Open with '/' if not currently focusing an input/textarea
      else if (e.key === '/' && !isInputActive()) {
        e.preventDefault();
        openSearch();
      }
      // Close on Escape
      else if (e.key === 'Escape' && searchModal.classList.contains('open')) {
        e.preventDefault();
        closeSearch();
      }
      // Arrow navigation inside open search modal
      else if (searchModal.classList.contains('open')) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          navigateResults(1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          navigateResults(-1);
        } else if (e.key === 'Enter') {
          if (selectedIndex >= 0 && selectedIndex < currentResults.length) {
            e.preventDefault();
            const selectedItem = currentResults[selectedIndex];
            window.location.href = selectedItem.url;
            closeSearch();
          }
        }
      }
    });

    // Live Search Typing
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      executeSearch(query);
    });
  }

  function isInputActive() {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || el.isContentEditable;
  }

  function openSearch() {
    if (!searchModal || !searchInput) return;
    searchModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      searchInput.focus();
      searchInput.select();
    }, 50);

    // Initial results or recent/popular topics if empty
    if (!searchInput.value.trim()) {
      showDefaultSuggestions();
    }
  }

  function closeSearch() {
    if (!searchModal) return;
    searchModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function executeSearch(query) {
    if (!query) {
      showDefaultSuggestions();
      return;
    }

    if (!window.FASTAPI_STUDY_DATA || !window.FASTAPI_STUDY_DATA.chapters) {
      resultsContainer.innerHTML = `<div class="search-empty-state"><p>Textbook database is loading...</p></div>`;
      return;
    }

    const chapters = window.FASTAPI_STUDY_DATA.chapters;
    const cleanQuery = query.toLowerCase();
    const queryTokens = cleanQuery.split(/\s+/).filter(t => t.length > 0);
    const results = [];

    chapters.forEach(ch => {
      let score = 0;
      let matchedHeading = '';
      let matchedSectionId = '';
      let matchedSnippet = '';

      const titleLower = ch.title.toLowerCase();
      
      // Match Chapter Title
      if (titleLower.includes(cleanQuery)) {
        score += 50;
      }

      // Match Section Headings
      if (ch.sections && ch.sections.length > 0) {
        for (const sec of ch.sections) {
          const secTitleLower = sec.title.toLowerCase();
          if (secTitleLower.includes(cleanQuery)) {
            score += 35;
            matchedHeading = sec.title;
            matchedSectionId = sec.id;
            break;
          }
        }
      }

      // Match in raw markdown / body text
      if (ch.rawMarkdown) {
        const bodyLower = ch.rawMarkdown.toLowerCase();
        const matchIdx = bodyLower.indexOf(cleanQuery);
        if (matchIdx !== -1) {
          score += 15;
          // Extract snippet surrounding context (approx 120 chars)
          const start = Math.max(0, matchIdx - 45);
          const end = Math.min(ch.rawMarkdown.length, matchIdx + cleanQuery.length + 75);
          let rawSnippet = ch.rawMarkdown.substring(start, end).replace(/\n/g, ' ');
          
          if (start > 0) rawSnippet = '...' + rawSnippet;
          if (end < ch.rawMarkdown.length) rawSnippet = rawSnippet + '...';
          
          matchedSnippet = rawSnippet;
        } else {
          // Check multi-token match
          let tokenMatches = 0;
          for (const token of queryTokens) {
            if (bodyLower.includes(token)) tokenMatches++;
          }
          if (tokenMatches === queryTokens.length) {
            score += 10;
            const firstTokenIdx = bodyLower.indexOf(queryTokens[0]);
            const start = Math.max(0, firstTokenIdx - 40);
            const end = Math.min(ch.rawMarkdown.length, firstTokenIdx + 110);
            matchedSnippet = '...' + ch.rawMarkdown.substring(start, end).replace(/\n/g, ' ') + '...';
          }
        }
      }

      if (score > 0) {
        let destUrl = `textbook.html?ch=${ch.id}`;
        if (matchedSectionId) {
          destUrl += `#${matchedSectionId}`;
        }
        results.push({
          chapter: ch,
          score: score,
          heading: matchedHeading || ch.cleanTitle,
          sectionId: matchedSectionId,
          snippet: matchedSnippet || (ch.available ? `Full content available in Chapter ${ch.id}.` : ch.missingNotice),
          url: destUrl
        });
      }
    });

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);
    currentResults = results;
    selectedIndex = results.length > 0 ? 0 : -1;
    renderResults(query, results);
  }

  function highlightMatches(text, query) {
    if (!query) return escapeHtml(text);
    const escapedText = escapeHtml(text);
    const escapedQuery = escapeHtml(query);
    const regex = new RegExp(`(${escapeRegExp(escapedQuery)})`, 'gi');
    return escapedText.replace(regex, '<mark>$1</mark>');
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function renderResults(query, results) {
    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="search-empty-state">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <p>No textbook matches found for <strong>"${escapeHtml(query)}"</strong></p>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Try searching for terms like <em>SQLAlchemy</em>, <em>CORS</em>, <em>APIRouter</em>, <em>OAuth2</em>, or <em>Docker</em>.</span>
        </div>
      `;
      return;
    }

    let html = `<ul class="search-results-list" role="listbox">`;
    results.forEach((res, idx) => {
      const isSelected = idx === selectedIndex ? 'highlighted' : '';
      const highlightedHeading = highlightMatches(res.heading, query);
      const highlightedSnippet = highlightMatches(res.snippet, query);

      html += `
        <li role="option" aria-selected="${idx === selectedIndex}">
          <a href="${res.url}" class="search-result-item ${isSelected}" data-index="${idx}">
            <div class="search-result-meta">
              <span class="search-chapter-badge">CH ${res.chapter.id}</span>
              <span class="search-section-title">${escapeHtml(res.chapter.cleanTitle)}</span>
            </div>
            <div class="search-result-heading">${highlightedHeading}</div>
            <div class="search-result-snippet">${highlightedSnippet}</div>
          </a>
        </li>
      `;
    });
    html += `</ul>`;
    resultsContainer.innerHTML = html;

    // Attach click handlers to close modal
    const items = resultsContainer.querySelectorAll('.search-result-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        closeSearch();
      });
    });
  }

  function showDefaultSuggestions() {
    currentResults = [];
    selectedIndex = -1;
    resultsContainer.innerHTML = `
      <div style="padding: 1.25rem 1.5rem;">
        <span style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: block; margin-bottom: 0.75rem;">Key Architecture Topics</span>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm search-suggestion-pill" data-q="SQLAlchemy">SQLAlchemy Models</button>
          <button class="btn btn-secondary btn-sm search-suggestion-pill" data-q="APIRouter">APIRouter Modularization</button>
          <button class="btn btn-secondary btn-sm search-suggestion-pill" data-q="JWT">OAuth2 JWT Security</button>
          <button class="btn btn-secondary btn-sm search-suggestion-pill" data-q="CORS">CORS Middleware</button>
          <button class="btn btn-secondary btn-sm search-suggestion-pill" data-q="BackgroundTasks">BackgroundTasks Email</button>
          <button class="btn btn-secondary btn-sm search-suggestion-pill" data-q="Alembic">Alembic Migrations</button>
          <button class="btn btn-secondary btn-sm search-suggestion-pill" data-q="Boto3">AWS S3 Boto3</button>
          <button class="btn btn-secondary btn-sm search-suggestion-pill" data-q="Pytest">Enterprise Pytest</button>
          <button class="btn btn-secondary btn-sm search-suggestion-pill" data-q="Docker">Docker Containers</button>
        </div>
      </div>
    `;

    const pills = resultsContainer.querySelectorAll('.search-suggestion-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        const q = pill.getAttribute('data-q');
        searchInput.value = q;
        executeSearch(q);
      });
    });
  }

  function navigateResults(direction) {
    if (currentResults.length === 0) return;
    selectedIndex += direction;
    if (selectedIndex < 0) selectedIndex = currentResults.length - 1;
    if (selectedIndex >= currentResults.length) selectedIndex = 0;

    const items = resultsContainer.querySelectorAll('.search-result-item');
    items.forEach((item, idx) => {
      if (idx === selectedIndex) {
        item.classList.add('highlighted');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('highlighted');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initSearch);
})();
