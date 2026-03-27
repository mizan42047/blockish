export const ITEM_POSITION_OPTIONS = [
	{ label: 'Start', value: 'start' },
	{ label: 'Center', value: 'center' },
	{ label: 'End', value: 'end' },
	{ label: 'Spread', value: 'space-between' },
];

export const TITLE_TAG_OPTIONS = [
	{ label: 'H2', value: 'h2' },
	{ label: 'H3', value: 'h3' },
	{ label: 'H4', value: 'h4' },
	{ label: 'H5', value: 'h5' },
	{ label: 'H6', value: 'h6' },
	{ label: 'Div', value: 'div' },
	{ label: 'Paragraph', value: 'p' },
];

export const ICON_POSITION_OPTIONS = [
	{ label: 'Start', value: 'row' },
	{ label: 'End', value: 'row-reverse' },
];

export const DEFAULT_CLOSED_ICON = {
	viewBox: [ 0, 0, 448, 512 ],
	path: 'M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z',
};

export const DEFAULT_OPEN_ICON = {
	viewBox: [ 0, 0, 448, 512 ],
	path: 'M0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32z',
};
