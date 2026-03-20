(
  /* Theme Toggle function ! */
  function () {
  const SUN = `<path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><circle cx="12" cy="12" r="4"/>`;
  const MOON = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.getElementById('theme-icon');
    if (icon) icon.innerHTML = theme === 'dark' ? SUN : MOON;
  }

  const saved = localStorage.getItem('theme') || 'light';
  applyTheme(saved);

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(localStorage.getItem('theme') || 'light');

    document.getElementById('theme-toggle').addEventListener('click', function () {
      const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      applyTheme(next);
    });

    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.topnav-nav a[href]').forEach(function (link) {
      const linkFile = link.getAttribute('href').split('/').pop();
      if (linkFile === currentFile) link.classList.add('active');
    });

    const hamburger = document.getElementById('topnav-hamburger');
    const topnav = hamburger && hamburger.closest('.topnav');
    if (hamburger && topnav) {
      hamburger.addEventListener('click', function () {
        topnav.classList.toggle('topnav--open');
      });

      topnav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          topnav.classList.remove('topnav--open');
        });
      });
    }

    document.querySelectorAll('.dropdown-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const item = btn.closest('.menu-item');
        if (item) item.classList.toggle('open');
      });
    });
  });
})();
