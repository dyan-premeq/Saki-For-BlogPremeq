type FileNameTransformerOptions = {
	style?: 'v1' | 'v2';
	hideDot?: boolean;
};

type HastElement = {
	type?: string;
	tagName?: string;
	properties: Record<string, unknown>;
	children: unknown[];
};

type TransformerContext = {
	options?: {
		meta?: {
			__raw?: string;
		};
	};
};

function appendClass(node: HastElement, className: string) {
	const current = node.properties.class;

	if (Array.isArray(current)) {
		node.properties.class = [...current, className];
		return;
	}

	node.properties.class = [current, className].filter(Boolean).join(' ');
}

function readCodeMeta(rawMeta: string | undefined) {
	if (!rawMeta) return new Map<string, string>();

	const metaMap = new Map<string, string>();

	for (const item of rawMeta.split(' ')) {
		const [key, value] = item.split('=');
		if (!key || !value) continue;

		metaMap.set(key, value.replace(/["'`]/g, ''));
	}

	return metaMap;
}

export function transformerFileName({ style = 'v2', hideDot = false }: FileNameTransformerOptions = {}) {
	const fileNameOffset = style === 'v1' ? '0.75rem' : '-0.75rem';

	return {
		name: 'saki:file-name',
		pre(this: TransformerContext, node: HastElement) {
			const rawMeta = this.options?.meta?.__raw;
			const file = readCodeMeta(rawMeta).get('file');

			if (!file) return;

			node.properties.style = [node.properties.style, `--file-name-offset: ${fileNameOffset};`]
				.filter(Boolean)
				.join(' ');

			appendClass(node, 'has-code-file');
			if (style === 'v1') appendClass(node, 'has-code-file-v1');

			node.children.push({
				type: 'element',
				tagName: 'span',
				properties: {
					class: [
						'code-file-label',
						`code-file-label--${style}`,
						hideDot ? 'code-file-label--plain' : 'code-file-label--dot',
					],
				},
				children: [
					{
						type: 'text',
						value: file,
					},
				],
			});
		},
	};
}
