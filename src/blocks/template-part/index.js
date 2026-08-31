import { registerBlockType } from '@wordpress/blocks';
import { layout } from '@wordpress/icons';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';
import './style.scss';

registerBlockType( metadata.name, {
	icon: window?.blockish?.components?.blockIcons?.templatePart || layout,
	edit: Edit,
	save: Save,
} );
