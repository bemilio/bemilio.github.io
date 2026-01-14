document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".email-link").forEach(el => {
    const email = `${el.dataset.user}@${el.dataset.domain}`;
    el.setAttribute("href", `mailto:${email}`);
  });
});
