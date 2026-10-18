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

  // Cookie Consent Experience
  function initCookieConsent() {
    let banner = document.getElementById('cookie-consent-banner');
    
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'cookie-consent-banner';
      banner.className = 'cookie-consent-banner';
      banner.setAttribute('role', 'region');
      banner.setAttribute('aria-label', 'Cookie Consent');
      banner.innerHTML = `
        <div class="cookie-header-row">
          <div class="cookie-illustration" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="8" cy="9" r="1.5" fill="currentColor"></circle>
              <circle cx="15" cy="8" r="1" fill="currentColor"></circle>
              <circle cx="10" cy="15" r="1" fill="currentColor"></circle>
              <circle cx="16" cy="14" r="1.5" fill="currentColor"></circle>
            </svg>
          </div>
          <h3 class="cookie-headline">Privacy &amp; Cookie Notice 🍪</h3>
        </div>
        <p class="cookie-body-text">
          FastAPI Study never tracks your quizzes or stores scores. Can we remember your privacy preferences in your browser?
        </p>
        <div class="cookie-actions-group">
          <div class="cookie-btn-row">
            <button class="btn btn-primary btn-sm" id="cookie-accept-btn">Accept Preferences</button>
            <button class="btn btn-secondary btn-sm" id="cookie-essential-btn">Essential Only</button>
          </div>
          <a href="cookies.html" class="nav-link" style="font-size: 0.8125rem;">Cookie Policy</a>
        </div>
      `;
      document.body.appendChild(banner);
    }

    const savedChoice = localStorage.getItem('fastapi_cookie_consent');
    if (!savedChoice) {
      setTimeout(() => {
        banner.classList.add('visible');
      }, 700);
    }

    const acceptBtn = document.getElementById('cookie-accept-btn');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('fastapi_cookie_consent', 'all');
        banner.classList.remove('visible');
        if (window.FastAPIAnimations) {
          window.FastAPIAnimations.showToast('Preferences saved. Quiz answers remain completely private and unsaved.');
        }
        updateConsentBadges();
      });
    }

    const essentialBtn = document.getElementById('cookie-essential-btn');
    if (essentialBtn) {
      essentialBtn.addEventListener('click', () => {
        localStorage.setItem('fastapi_cookie_consent', 'essential');
        banner.classList.remove('visible');
        if (window.FastAPIAnimations) {
          window.FastAPIAnimations.showToast('Essential cookies only enabled.');
        }
        updateConsentBadges();
      });
    }

    const reopenBtns = document.querySelectorAll('.reopen-cookie-preferences');
    reopenBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openCookieConsentBanner();
      });
    });
  }

  function openCookieConsentBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.classList.add('visible');
    }
  }

  function updateConsentBadges() {
    const statusEl = document.getElementById('current-consent-status');
    if (!statusEl) return;
    const choice = localStorage.getItem('fastapi_cookie_consent');
    if (choice === 'all') {
      statusEl.textContent = 'Optional Cookies Accepted';
      statusEl.className = 'consent-status-badge accepted';
    } else if (choice === 'essential') {
      statusEl.textContent = 'Essential Cookies Only';
      statusEl.className = 'consent-status-badge essential';
    } else {
      statusEl.textContent = 'Consent Not Yet Set';
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
