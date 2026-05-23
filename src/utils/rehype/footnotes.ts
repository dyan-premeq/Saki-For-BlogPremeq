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

function hasDataFootnotes(node: HastElement) {
	const properties = node.properties ?? {};

	return 'dataFootnotes' in properties || 'data-footnotes' in properties;
}

function isFootnotesSection(node: HastElement) {
	return node.tagName === 'section' && hasClass(node, 'footnotes') && hasDataFootnotes(node);
}

function createFootnotesAside(sectionNode: HastElement) {
	return {
		type: 'element',
		tagName: 'aside',
		properties: {
			className: ['markdown-footnotes', 'not-prose'],
			'aria-labelledby': 'footnote-label',
		},
		children: [sectionNode],
	} satisfies HastElement;
}

function wrapFootnotes(node: HastElement) {
	if (hasClass(node, 'markdown-footnotes')) return;

	const children = node.children;
	if (!children) return;

	for (let index = 0; index < children.length; index += 1) {
		const child = children[index];

		if (!isElement(child)) continue;

		if (isFootnotesSection(child)) {
			children[index] = createFootnotesAside(child);
			continue;
		}

		wrapFootnotes(child);
	}
}

export function rehypeMarkdownFootnotes() {
	return (tree: HastElement) => {
		wrapFootnotes(tree);
	};
}
