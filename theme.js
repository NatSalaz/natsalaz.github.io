(function () {
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

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', function () {
      const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      applyTheme(next);
    });

    // Hamburger toggle
    const hamburger = document.getElementById('sidebar-hamburger');
    const sidebar = hamburger && hamburger.closest('.sidebar');
    if (hamburger && sidebar) {
      hamburger.addEventListener('click', function () {
        sidebar.classList.toggle('sidebar--open');
      });

      // Close sidebar when a nav link is clicked on mobile
      sidebar.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          sidebar.classList.remove('sidebar--open');
        });
      });
    }

    // Dropdown au clic sur mobile
    document.querySelectorAll('.dropdown-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const item = btn.closest('.menu-item');
        if (item) item.classList.toggle('open');
      });
    });
  });
})();
