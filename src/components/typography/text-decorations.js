import { __ } from '@wordpress/i18n';

const textDecorations = [
	{
		label: __('None', 'blockish'),
		value: 'none',
	},
	{
		label: __('Underline', 'blockish'),
		value: 'underline',
	},
	{
		label: __('Overline', 'blockish'),
		value: 'overline',
	},
	{
		label: __('Line Through', 'blockish'),
		value: 'line-through',
	},
	{
		label: __('Inherit', 'blockish'),
		value: 'inherit',
	},
];

export default textDecorations;
