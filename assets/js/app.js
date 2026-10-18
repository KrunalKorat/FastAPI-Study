/**
 * FastAPI Study — Global App Controller (app.js)
 * Clean, Zero-Auth, Light-Mode-Only Documentation Platform
 * Manages mobile drawer navigation, dynamic dates, code copying, and privacy consent.
 */

(function () {
  'use strict';

  // Ensure Light Mode is permanently locked (Light mode only)
  function enforceLightMode() {
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('fastapi_study_theme');
  }

  // Mobile Navigation Drawer
  function initMobileDrawer() {
    const openBtn = document.querySelector('.mobile-menu-btn');
    const drawer = document.getElementById('mobile-drawer');
    const closeBtn = document.querySelector('.drawer-close-btn');

    if (!drawer) return;

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        drawer.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        closeDrawer();
      });
    }

    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) {
        closeDrawer();
      }
    });

    function closeDrawer() {
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  // Dynamic Footer Current Year
  function initFooterYear() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  // Global Clipboard Copy Function
  function copyTextToClipboard(text, successMessage = 'Copied to clipboard!') {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        if (window.FastAPIAnimations) {
          window.FastAPIAnimations.showToast(successMessage, 'copy');
        }
      }).catch(err => {
        fallbackCopy(text, successMessage);
      });
    } else {
      fallbackCopy(text, successMessage);
    }
  }

  function fallbackCopy(text, successMessage) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      if (window.FastAPIAnimations) {
        window.FastAPIAnimations.showToast(successMessage, 'copy');
      }
    } catch (err) {
      if (window.FastAPIAnimations) {
        window.FastAPIAnimations.showToast('Failed to copy to clipboard', 'info');
      }
    }
    document.body.removeChild(textArea);
  }

  // Global Code Copy Delegator
  function initCodeCopyDelegator() {
    document.addEventListener('click', (e) => {
      const copyBtn = e.target.closest('.code-copy-btn');
      if (!copyBtn) return;

      const codeToCopy = copyBtn.getAttribute('data-code');
      if (!codeToCopy) return;

      copyTextToClipboard(codeToCopy, 'Code copied to clipboard!');
      copyBtn.classList.add('copied');
      const textSpan = copyBtn.querySelector('span');
      if (textSpan) textSpan.textContent = 'Copied!';

      setTimeout(() => {
        copyBtn.classList.remove('copied');
        if (textSpan) textSpan.textContent = 'Copy Code';
      }, 2000);
    });
  }

  // Active Link Highlighter in Header
  function initActiveNavLinks() {
    const currentPath = window.location.pathname.toLowerCase();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      
      const cleanHref = href.toLowerCase();
      if (currentPath.endsWith(cleanHref) || (cleanHref === 'index.html' && (currentPath.endsWith('/') || currentPath === ''))) {
        link.classList.add('active');
      }
    });
  }

  // ==========================================================================
  // COOKIE CONSENT DIALOG (COMPACT FLOATING CARD)
  // ==========================================================================
  function initCookieConsent() {
    let dialog = document.getElementById('cookie-consent-dialog');
    
    if (!dialog) {
      dialog = document.createElement('div');
      dialog.id = 'cookie-consent-dialog';
      dialog.className = 'cookie-dialog';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-labelledby', 'cookie-dialog-title');
      dialog.setAttribute('aria-describedby', 'cookie-dialog-desc');
      dialog.innerHTML = `
        <div class="cookie-dialog-header">
          <div class="cookie-dialog-title-wrap">
            <div class="cookie-dialog-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="8" cy="9" r="1.5" fill="currentColor"></circle>
                <circle cx="15" cy="8" r="1" fill="currentColor"></circle>
                <circle cx="10" cy="15" r="1" fill="currentColor"></circle>
                <circle cx="16" cy="14" r="1.5" fill="currentColor"></circle>
              </svg>
            </div>
            <h3 id="cookie-dialog-title" class="cookie-dialog-title">Privacy &amp; Cookie Preferences</h3>
          </div>
          <button id="cookie-dialog-close" class="cookie-dialog-close" aria-label="Close preferences dialog">&times;</button>
        </div>
        <p id="cookie-dialog-desc" class="cookie-dialog-desc">
          This educational website uses only the browser storage and technologies needed for its actual functionality. Choose whether to save your preferences.
        </p>
        <div class="cookie-dialog-actions">
          <button class="btn btn-primary btn-sm" id="cookie-accept-btn">Accept Preferences</button>
          <button class="btn btn-secondary btn-sm" id="cookie-essential-btn">Essential Only</button>
        </div>
      `;
      document.body.appendChild(dialog);
    }

    const savedChoice = localStorage.getItem('fastapi_cookie_consent');
    const isDismissed = sessionStorage.getItem('fastapi_cookie_dismissed');

    if (!savedChoice && !isDismissed) {
      setTimeout(() => {
        dialog.classList.add('visible');
      }, 500);
    }

    // Accept Preferences
    const acceptBtn = document.getElementById('cookie-accept-btn');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('fastapi_cookie_consent', 'accepted');
        dialog.classList.remove('visible');
        if (window.FastAPIAnimations) {
          window.FastAPIAnimations.showToast('Preferences saved.');
        }
        updateConsentBadges();
      });
    }

    // Essential Only
    const essentialBtn = document.getElementById('cookie-essential-btn');
    if (essentialBtn) {
      essentialBtn.addEventListener('click', () => {
        localStorage.setItem('fastapi_cookie_consent', 'essential');
        dialog.classList.remove('visible');
        if (window.FastAPIAnimations) {
          window.FastAPIAnimations.showToast('Essential storage only enabled.');
        }
        updateConsentBadges();
      });
    }

    // Close button dismisses for session
    const closeBtn = document.getElementById('cookie-dialog-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        sessionStorage.setItem('fastapi_cookie_dismissed', 'true');
        dialog.classList.remove('visible');
      });
    }

    // Reopen Preferences links
    const reopenBtns = document.querySelectorAll('.reopen-cookie-preferences');
    reopenBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openCookieConsentDialog();
      });
    });
  }

  function openCookieConsentDialog() {
    const dialog = document.getElementById('cookie-consent-dialog');
    if (dialog) {
      dialog.classList.add('visible');
    }
  }

  function updateConsentBadges() {
    const statusEl = document.getElementById('current-consent-status');
    if (!statusEl) return;
    const choice = localStorage.getItem('fastapi_cookie_consent');
    if (choice === 'accepted' || choice === 'all') {
      statusEl.textContent = 'Preferences Saved (Accepted)';
      statusEl.className = 'consent-status-badge accepted';
    } else if (choice === 'essential') {
      statusEl.textContent = 'Essential Storage Only';
      statusEl.className = 'consent-status-badge essential';
    } else {
      statusEl.textContent = 'Consent Not Set';
      statusEl.className = 'consent-status-badge pending';
    }
  }

  window.FastAPIApp = {
    copyTextToClipboard
  };

  window.FastAPICookies = {
    openBanner: openCookieConsentBanner,
    getChoice: () => localStorage.getItem('fastapi_cookie_consent'),
    setChoice: (choice) => {
      localStorage.setItem('fastapi_cookie_consent', choice);
      updateConsentBadges();
    },
    clearChoice: () => {
      localStorage.removeItem('fastapi_cookie_consent');
      updateConsentBadges();
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    enforceLightMode();
    initMobileDrawer();
    initFooterYear();
    initCodeCopyDelegator();
    initActiveNavLinks();
    initCookieConsent();
    updateConsentBadges();
  });
})();
