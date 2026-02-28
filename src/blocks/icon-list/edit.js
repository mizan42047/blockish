import {
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Inspector from './inspector';
import './editor.scss';

const ALLOWED_BLOCKS = [ 'blockish/icon-list-item' ];
const TEMPLATE = [ [ 'blockish/icon-list-item' ] ];

export default function Edit( { attributes, advancedControls, clientId } ) {
	const { insertBlock } = useDispatch( blockEditorStore );
	const blockProps = useBlockProps( {
		className: 'blockish-icon-list',
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
		renderAppender: false,
		orientation: attributes?.layout === 'row' ? 'horizontal' : 'vertical',
	} );

	const handleAddItem = () => {
		insertBlock(
			createBlock( 'blockish/icon-list-item' ),
			undefined,
			clientId
		);
	};

	return (
		<>
			<Inspector advancedControls={ advancedControls } />
			<div className="blockish-icon-list-editor">
				<ul { ...innerBlocksProps } />
				<div className="blockish-icon-list-editor__appender">
					<Button
						variant="secondary"
						icon="plus-alt2"
						onClick={ handleAddItem }
					>
						{ __( 'Add Item', 'blockish' ) }
					</Button>
				</div>
			</div>
		</>
	);
}
