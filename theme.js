const THEME_STORAGE_KEY = "study-space-theme-v1";
const themeButtons = document.querySelectorAll("[data-theme-toggle]");

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";

  themeButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
    button.querySelector("[aria-hidden='true']").textContent = isDark ? "☀" : "☾";
    button.querySelector("[data-theme-label]").textContent = isDark ? "Light mode" : "Dark mode";
  });
}

let savedTheme = "light";
try {
  savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "light";
} catch {
  // The theme toggle still works for this page if browser storage is unavailable.
}
applyTheme(savedTheme);

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Keep the selected theme for this page even when it cannot be saved.
    }
  });
});
