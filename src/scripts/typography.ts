function ensureCodeBlockFrame(codeBlock: HTMLPreElement) {
	const existingFrame = codeBlock.parentElement;
	const fileLabel = Array.from(codeBlock.children).find((child) =>
		child.classList.contains('code-file-label'),
	);

	if (existingFrame?.classList.contains('code-block-frame')) {
		if (fileLabel) existingFrame.insertBefore(fileLabel, codeBlock);

		return existingFrame;
	}

	const frame = document.createElement('div');
	frame.className = 'code-block-frame';

	if (codeBlock.classList.contains('has-code-file')) frame.classList.add('has-code-file');
	if (codeBlock.classList.contains('has-code-file-v1')) frame.classList.add('has-code-file-v1');

	const fileNameOffset = codeBlock.style.getPropertyValue('--file-name-offset');
	if (fileNameOffset) frame.style.setProperty('--file-name-offset', fileNameOffset);

	codeBlock.before(frame);
	if (fileLabel) frame.appendChild(fileLabel);
	frame.appendChild(codeBlock);

	return frame;
}

function attachCopyButtons() {
	const codeBlocks = Array.from(document.querySelectorAll<HTMLPreElement>('.prose pre'));

	for (const codeBlock of codeBlocks) {
		const frame = ensureCodeBlockFrame(codeBlock);
		if (frame.querySelector(':scope > .copy-code')) continue;

		const copyButton = document.createElement('button');
		copyButton.className = 'copy-code';
		copyButton.type = 'button';
		copyButton.textContent = 'Copy';

		codeBlock.tabIndex = 0;
		frame.appendChild(copyButton);

		copyButton.addEventListener('click', async () => {
			const code = codeBlock.querySelector('code');
			const text = code?.innerText ?? '';

			try {
				await navigator.clipboard.writeText(text);
				copyButton.textContent = 'Copied';
			} catch {
				copyButton.textContent = 'Failed';
			}

			window.setTimeout(() => {
				copyButton.textContent = 'Copy';
			}, 700);
		});
	}
}

const footnoteTargetHighlightClass = 'is-footnote-target-highlighted';
const footnoteReferenceHighlightClass = 'is-footnote-reference-highlighted';

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

	return getHashTarget(url.hash);
}

function getHashTarget(hash: string) {
	if (!hash.startsWith('#') || hash.length <= 1) return null;

	try {
		return document.getElementById(decodeURIComponent(hash.slice(1)));
	} catch {
		return document.getElementById(hash.slice(1));
	}
}

function isFootnoteNavigationTarget(target: HTMLElement) {
	return (
		target.matches('.prose a[data-footnote-ref]') ||
		(target.matches('.prose .markdown-footnotes li[id]') && target.closest('.prose') !== null)
	);
}

function getFootnoteReferenceHighlightTarget(target: HTMLElement) {
	const sup = target.closest('sup');
	if (sup instanceof HTMLElement && sup !== target) return sup;

	let parent = target.parentElement;
	while (parent?.matches('a')) parent = parent.parentElement;

	return parent;
}

function getFootnoteHighlight(target: HTMLElement) {
	if (target.matches('.prose a[data-footnote-ref]')) {
		const element = getFootnoteReferenceHighlightTarget(target);
		return element ? { element, className: footnoteReferenceHighlightClass } : null;
	}

	if (target.matches('.prose .markdown-footnotes li[id]') && target.closest('.prose') !== null) {
		return { element: target, className: footnoteTargetHighlightClass };
	}

	return null;
}

function navigateToFootnoteTarget(target: HTMLElement, hash: string) {
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	target.scrollIntoView({
		block: 'center',
		inline: 'nearest',
		behavior: prefersReducedMotion ? 'auto' : 'smooth',
	});

	window.history.pushState(null, '', hash);

	const highlight = getFootnoteHighlight(target);
	highlight?.element.classList.add(highlight.className);
	window.setTimeout(() => {
		highlight?.element.classList.remove(highlight.className);
	}, 1400);
}

function attachFootnoteNavigation() {
	const footnoteAnchors = Array.from(
		document.querySelectorAll<HTMLAnchorElement>(
			'.prose a[data-footnote-ref], .prose a[data-footnote-backref]',
		),
	);

	for (const anchor of footnoteAnchors) {
		if (anchor.dataset.footnoteNavigationAttached === 'true') continue;
		anchor.dataset.footnoteNavigationAttached = 'true';

		anchor.addEventListener('click', (event) => {
			const target = getSamePageHashTarget(anchor);
			if (!target) return;

			event.preventDefault();
			navigateToFootnoteTarget(target, new URL(anchor.href, window.location.href).hash);
		});
	}

	const initialTarget = getHashTarget(window.location.hash);
	if (initialTarget && isFootnoteNavigationTarget(initialTarget)) {
		window.setTimeout(() => {
			navigateToFootnoteTarget(initialTarget, window.location.hash);
		}, 0);
	}
}

attachCopyButtons();
attachFootnoteNavigation();
document.addEventListener('astro:page-load', attachCopyButtons);
document.addEventListener('astro:page-load', attachFootnoteNavigation);
