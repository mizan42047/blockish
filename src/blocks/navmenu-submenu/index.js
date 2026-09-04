import { registerBlockType } from '@wordpress/blocks';
import { addSubmenu } from '@wordpress/icons';
import './style.scss';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';

registerBlockType( metadata.name, {
	icon: addSubmenu,
	edit: Edit,
	save: Save,
} );
