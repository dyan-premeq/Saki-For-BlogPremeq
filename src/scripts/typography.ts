const interactionMarker = "typographyInteractions";
const footnoteTargetHighlightClass = "is-footnote-target-highlighted";
const footnoteReferenceHighlightClass = "is-footnote-reference-highlighted";

const resetTimers = new WeakMap<HTMLButtonElement, number>();
const highlightTimers = new WeakMap<HTMLElement, number>();

function getSamePageHashTarget(anchor: HTMLAnchorElement) {
  const url = new URL(anchor.href, window.location.href);

  if (
    url.origin !== window.location.origin ||
    url.pathname !== window.location.pathname ||
    url.search !== window.location.search ||
    url.hash.length <= 1
  ) {
    return null;
  }

  const encodedId = url.hash.slice(1);

  try {
    return {
      hash: url.hash,
      target: document.getElementById(decodeURIComponent(encodedId)),
    };
  } catch {
    return {
      hash: url.hash,
      target: document.getElementById(encodedId),
    };
  }
}

function setTemporaryClass(
  element: HTMLElement,
  className: string,
  duration: number,
) {
  const activeTimer = highlightTimers.get(element);
  if (activeTimer !== undefined) window.clearTimeout(activeTimer);

  element.classList.remove(className);
  // Restart the keyframe when a reader follows the same link repeatedly.
  void element.offsetWidth;
  element.classList.add(className);

  highlightTimers.set(
    element,
    window.setTimeout(() => {
      element.classList.remove(className);
      highlightTimers.delete(element);
    }, duration),
  );
}

async function copyCode(button: HTMLButtonElement) {
  const frame = button.closest<HTMLElement>(".prose .code-block-frame");
  const code = frame?.querySelector<HTMLElement>("pre.astro-code code");
  if (!code) return;

  const activeTimer = resetTimers.get(button);
  if (activeTimer !== undefined) window.clearTimeout(activeTimer);

  try {
    await navigator.clipboard.writeText(code.innerText);
    button.textContent = "Copied";
    button.setAttribute("aria-label", "Copied code");
  } catch {
    button.textContent = "Failed";
    button.setAttribute("aria-label", "Copy failed");
  }

  resetTimers.set(
    button,
    window.setTimeout(() => {
      button.textContent = "Copy";
      button.setAttribute("aria-label", "Copy code");
      resetTimers.delete(button);
    }, 5000),
  );
}

function navigateToFootnote(anchor: HTMLAnchorElement) {
  const destination = getSamePageHashTarget(anchor);
  if (!(destination?.target instanceof HTMLElement)) return false;

  window.history.pushState(null, "", destination.hash);
  destination.target.scrollIntoView({
    block: "center",
    inline: "nearest",
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });

  if (destination.target.matches(".markdown-footnotes li[id]")) {
    setTemporaryClass(destination.target, footnoteTargetHighlightClass, 2800);
  } else if (destination.target.matches("a[data-footnote-ref]")) {
    const reference = destination.target.closest<HTMLElement>("sup");
    setTemporaryClass(
      reference ?? destination.target,
      footnoteReferenceHighlightClass,
      2400,
    );
  }

  return true;
}

if (document.documentElement.dataset[interactionMarker] !== "true") {
  document.documentElement.dataset[interactionMarker] = "true";

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;

    const copyButton = event.target.closest<HTMLButtonElement>(
      ".prose .code-block-frame > button.copy-code",
    );
    if (copyButton) {
      event.preventDefault();
      void copyCode(copyButton);
      return;
    }

    const anchor = event.target.closest<HTMLAnchorElement>(
      ".prose a[data-footnote-ref], .prose a[data-footnote-backref]",
    );
    if (
      !anchor ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return;
    }

    if (navigateToFootnote(anchor)) event.preventDefault();
  });
}
