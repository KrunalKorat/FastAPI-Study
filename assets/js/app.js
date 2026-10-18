/**
 * FastAPI Study — Global App Controller (app.js)
 * Manages theme switching, mobile drawer navigation, dynamic dates, and global utilities.
 */

(function () {
  'use strict';

  // Apply Theme Preference (Warm Ivory vs Dark)
  function initTheme() {
    const savedTheme = localStorage.getItem('fastapi_study_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Default to ivory reading surface, allow toggle to dark
    const activeTheme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'light');
    setTheme(activeTheme);

    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
    themeToggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        localStorage.setItem('fastapi_study_theme', nextTheme);
        
        if (window.FastAPIAnimations) {
          window.FastAPIAnimations.showToast(`Switched to ${nextTheme === 'dark' ? 'Dark Mode' : 'Warm Ivory Mode'}`);
        }
      });
    });
  }

  function setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    updateThemeToggleIcons(theme);
  }

  function updateThemeToggleIcons(theme) {
    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
    themeToggleBtns.forEach(btn => {
      if (theme === 'dark') {
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
        btn.setAttribute('aria-label', 'Switch to Warm Ivory theme');
        btn.setAttribute('title', 'Switch to Warm Ivory theme');
      } else {
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        btn.setAttribute('aria-label', 'Switch to Dark theme');
        btn.setAttribute('title', 'Switch to Dark theme');
      }
    });
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
  // COOKIE CONSENT EXPERIENCE ("A little cookie question 🍪")
  // ==========================================================================
  function initCookieConsent() {
    let banner = document.getElementById('cookie-consent-banner');
    
    // Inject banner if not already present in static HTML
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'cookie-consent-banner';
      banner.className = 'cookie-consent-banner';
      banner.setAttribute('role', 'region');
      banner.setAttribute('aria-label', 'Cookie Consent');
      banner.innerHTML = `
        <div class="cookie-header-row">
          <div class="cookie-illustration" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="8" cy="9" r="1.5" fill="currentColor"></circle>
              <circle cx="15" cy="8" r="1" fill="currentColor"></circle>
              <circle cx="10" cy="15" r="1" fill="currentColor"></circle>
              <circle cx="16" cy="14" r="1.5" fill="currentColor"></circle>
            </svg>
          </div>
          <h3 class="cookie-headline">A little cookie question 🍪</h3>
        </div>
        <p class="cookie-body-text">
          We like good books, not unnecessary tracking. Can we remember your cookie choice? Your quiz answers and scores are never saved.
        </p>
        <div class="cookie-actions-group">
          <div class="cookie-btn-row">
            <button class="cookie-btn-accept" id="cookie-accept-btn">Accept optional cookies</button>
            <button class="cookie-btn-essential" id="cookie-essential-btn">Essential only</button>
          </div>
          <a href="cookies.html" class="cookie-btn-prefs" id="cookie-prefs-link">Cookie preferences</a>
        </div>
      `;
      document.body.appendChild(banner);
    }

    const savedChoice = localStorage.getItem('fastapi_cookie_consent');
    
    // Show banner after brief delay if no choice made
    if (!savedChoice) {
      setTimeout(() => {
        banner.classList.add('visible');
      }, 700);
    }

    // Accept Button
    const acceptBtn = document.getElementById('cookie-accept-btn');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('fastapi_cookie_consent', 'all');
        banner.classList.remove('visible');
        if (window.FastAPIAnimations) {
          window.FastAPIAnimations.showToast('Cookie preferences saved. We still never track your quiz answers.');
        }
        updateConsentBadges();
      });
    }

    // Essential Only Button
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

    // Reopen Cookie Preferences Buttons
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
    initTheme();
    initMobileDrawer();
    initFooterYear();
    initCodeCopyDelegator();
    initActiveNavLinks();
    initCookieConsent();
    updateConsentBadges();
  });
})();
