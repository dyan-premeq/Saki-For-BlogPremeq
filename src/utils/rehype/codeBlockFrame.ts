type HastNode = HastElement | HastText;

type HastText = {
	type?: string;
	value?: string;
};

type HastElement = {
	type?: string;
	tagName?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
};

function isElement(node: HastNode): node is HastElement {
	return node.type === 'element' || 'tagName' in node;
}

function getClassList(node: HastElement) {
	const properties = node.properties ?? {};
	const classValue = properties.className ?? properties.class;

	if (Array.isArray(classValue)) return classValue.map(String);
	if (typeof classValue === 'string') return classValue.split(/\s+/).filter(Boolean);

	return [];
}

function hasClass(node: HastElement, className: string) {
	return getClassList(node).includes(className);
}

function readStyleVariable(node: HastElement, name: string) {
	const style = node.properties?.style;

	if (typeof style !== 'string') return undefined;

	return style.match(new RegExp(`${name}:\\s*([^;]+)`))?.[1];
}

function takeCodeFileLabels(preNode: HastElement) {
	const labels: HastElement[] = [];
	const children = preNode.children ?? [];

	preNode.children = children.filter((child) => {
		if (isElement(child) && hasClass(child, 'code-file-label')) {
			labels.push(child);
			return false;
		}

		return true;
	});

	return labels;
}

function createFrame(preNode: HastElement) {
	const frameClasses = ['code-block-frame'];
	const labels = takeCodeFileLabels(preNode);
	const fileNameOffset = readStyleVariable(preNode, '--file-name-offset');

	if (hasClass(preNode, 'has-code-file')) frameClasses.push('has-code-file');
	if (hasClass(preNode, 'has-code-file-v1')) frameClasses.push('has-code-file-v1');

	return {
		type: 'element',
		tagName: 'div',
		properties: {
			className: frameClasses,
			...(fileNameOffset ? { style: `--file-name-offset: ${fileNameOffset};` } : {}),
		},
		children: [...labels, preNode],
	} satisfies HastElement;
}

function wrapCodeBlocks(node: HastElement) {
	const children = node.children;
	if (!children) return;

	for (let index = 0; index < children.length; index += 1) {
		const child = children[index];

		if (!isElement(child)) continue;

		if (child.tagName === 'pre' && hasClass(child, 'astro-code')) {
			children[index] = createFrame(child);
			continue;
		}

		wrapCodeBlocks(child);
	}
}

export function rehypeCodeBlockFrame() {
	return (tree: HastElement) => {
		wrapCodeBlocks(tree);
	};
}
