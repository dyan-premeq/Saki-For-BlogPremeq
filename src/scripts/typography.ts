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

attachCopyButtons();
document.addEventListener('astro:page-load', attachCopyButtons);
