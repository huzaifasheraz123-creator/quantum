(() => {
  const storageKey = 'quantumTheme';
  let theme = 'light';

  try {
    theme = localStorage.getItem(storageKey) === 'dark' ? 'dark' : 'light';
  } catch (error) {
    theme = 'light';
  }

  document.documentElement.dataset.theme = theme;

  document.addEventListener('DOMContentLoaded', () => {
    const toggles = document.querySelectorAll('[data-theme-toggle]');

    const applyTheme = (nextTheme, persist = true) => {
      theme = nextTheme === 'dark' ? 'dark' : 'light';
      document.documentElement.dataset.theme = theme;

      if (persist) {
        try {
          localStorage.setItem(storageKey, theme);
        } catch (error) {
          theme = nextTheme === 'dark' ? 'dark' : 'light';
        }
      }

      toggles.forEach((toggle) => {
        toggle.setAttribute('aria-checked', String(theme === 'dark'));
        toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      });
    };

    toggles.forEach((toggle) => {
      toggle.addEventListener('click', () => applyTheme(theme === 'dark' ? 'light' : 'dark'));
    });

    applyTheme(theme, false);
  });
})();