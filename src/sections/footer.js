export function initFooter() {
  const year = document.querySelector('#copyright-year');
  if (year) year.textContent = String(new Date().getFullYear());
}
