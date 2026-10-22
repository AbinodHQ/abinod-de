(() => {
  const widget = document.querySelector("[data-testimonials-widget]");
  if (!widget) return;

  const status = widget.querySelector("[data-testimonials-status]");
  status.textContent = "Loading testimonials...";
  widget.setAttribute("aria-busy", "true");
  const script = document.createElement("script");
  script.src = "https://verinodo.com/widget.js";
  script.dataset.business = widget.dataset.business;
  script.async = true;

  function showUnavailable() {
    status.textContent = "Testimonials are temporarily unavailable. Please check back soon.";
    widget.setAttribute("aria-busy", "false");
  }

  script.addEventListener("error", showUnavailable);
  script.addEventListener("load", () => {
    const root = script.nextElementSibling?.shadowRoot;
    const box = root?.querySelector(".box");
    if (!box) {
      showUnavailable();
      return;
    }

    // The widget's shadow root needs its own styles; theme tokens inherit from the page.
    const styles = document.createElement("style");
    styles.textContent = `
      :host { display: block; color: var(--ink); font: inherit; }
      .box {
        max-width: none; margin: 0; padding: 0; border: 0; border-radius: 0;
        color: var(--ink); background: transparent; font: inherit;
      }
      .stars { margin-bottom: 22px; color: var(--testimonials-accent); font-size: 1.1rem; }
      .box blockquote {
        margin: 0 0 28px; color: var(--ink);
        font-family: inherit; font-size: var(--testimonials-quote-size);
        font-weight: 500; line-height: 1.5;
      }
      .person { color: var(--ink); font-size: 1rem; font-weight: 700; }
      .role { margin-top: 4px; color: var(--slate); font-size: 0.875rem; }
      .bottom {
        flex-wrap: wrap; margin-top: 28px; padding-top: 20px;
        border-top: 1px solid var(--line);
      }
      .bottom a { color: var(--slate) !important; font-size: 0.75rem; }
      .bottom a:hover { text-decoration: underline; }
      .counter { color: var(--slate); font-size: 0.75rem; }
      .controls { margin-inline-start: auto; }
      button {
        width: 44px; height: 44px; border: 1px solid var(--line);
        color: var(--ink); background: var(--paper); font-size: 1.125rem;
      }
      button:hover { border-color: var(--testimonials-accent); }
      button:focus-visible, a:focus-visible { outline-color: var(--testimonials-accent); }
      .empty { margin: 0; padding-block: 48px; color: var(--slate); font-size: 1rem; }
    `;
    root.append(styles);

    const observer = new MutationObserver(finishLoading);
    function finishLoading() {
      if (!box.childElementCount) return;
      status.remove();
      widget.setAttribute("aria-busy", "false");
      observer.disconnect();
    }
    observer.observe(box, { childList: true });
    finishLoading();
  });

  widget.append(script);
})();
