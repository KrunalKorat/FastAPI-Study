/**
 * FastAPI Study — Animations & Motion System (animations.js)
 * Smooth loaders, 3D tilts, page transitions, and toast notifications.
 * Respects prefers-reduced-motion.
 */

(function () {
  'use strict';

  // Check user motion preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initialize Branded Loader
  function initLoader() {
    const loader = document.getElementById('site-loader');
    if (!loader) return;

    // Minimum display time for refined branding reveal without artificial delays
    const minDelay = prefersReducedMotion ? 50 : 650;
    const startTime = Date.now();

    function hideLoader() {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDelay - elapsed);

      setTimeout(() => {
        loader.classList.add('loader-hidden');
        setTimeout(() => {
          if (loader.parentNode) {
            loader.style.display = 'none';
          }
        }, 450);
      }, remaining);
    }

    if (document.readyState === 'complete') {
      hideLoader();
    } else {
      window.addEventListener('load', hideLoader);
    }
  }

  // 3D Card Hover Tilt Effect for Homepage Book Cover
  function initBookTilt() {
    if (prefersReducedMotion) return;
    const book = document.querySelector('.book-card-3d');
    if (!book) return;

    const wrapper = book.closest('.hero-book-wrapper');
    if (!wrapper) return;

    wrapper.addEventListener('mousemove', (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotateY = (x / (rect.width / 2)) * 14 - 10;
      const rotateX = -(y / (rect.height / 2)) * 10 + 6;

      book.style.transform = `rotateY(${rotateY.toFixed(2)}deg) rotateX(${rotateX.toFixed(2)}deg) translateY(-6px)`;
    });

    wrapper.addEventListener('mouseleave', () => {
      book.style.transform = 'rotateY(-18deg) rotateX(8deg) translateY(0)';
    });
  }

  // Toast Notification System
  function showToast(message, iconType = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';

    let iconSvg = '';
    if (iconType === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (iconType === 'copy') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 2800);
  }

  // Expose global animation utilities
  window.FastAPIAnimations = {
    initLoader,
    initBookTilt,
    showToast,
    prefersReducedMotion
  };

  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initBookTilt();
  });
})();
