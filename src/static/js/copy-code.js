document.addEventListener("DOMContentLoaded", () => {
  useCopyCode({
    buttonClass: "markdown-copy-code-button",
    displayDuration: 2000,
  });
});

function useCopyCode(options = {}) {
  const {
    buttonClass = "markdown-copy-code-button",
    displayDuration = 2000,
  } = options;

  const copyIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
  const checkIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  const buttons = document.querySelectorAll(`.${buttonClass}`);

  for (const button of buttons) {
    if (button.dataset.copyBound) continue;
    button.dataset.copyBound = "1";

    button.innerHTML = copyIcon;
    let timer;

    button.addEventListener("click", async () => {
      const container = button.closest(".markdown-copy-code-container");
      const code = container?.querySelector("pre code")?.textContent;

      if (!code) return;

      try {
        await navigator.clipboard.writeText(code.replace(/\n$/, ""));
        button.innerHTML = checkIcon;

        clearTimeout(timer);
        timer = setTimeout(() => {
          button.innerHTML = copyIcon;
        }, displayDuration);
      } catch (err) {
        console.error("Copy failed:", err);
      }
    });
  }
}
