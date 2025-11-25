import { __ } from '@wordpress/i18n';

const textTransforms = [
	{
		label: __('None', 'blockish'),
		value: 'none',
	},
	{
		label: __('Uppercase', 'blockish'),
		value: 'uppercase',
	},
	{
		label: __('Lowercase', 'blockish'),
		value: 'lowercase',
	},
	{
		label: __('Capitalize', 'blockish'),
		value: 'capitalize',
	},
	{
		label: __('Inherit', 'blockish'),
		value: 'inherit',
	},
];

export default textTransforms;
