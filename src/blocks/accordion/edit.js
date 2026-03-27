import {
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import Inspector from './inspector';
import { DEFAULT_CLOSED_ICON, DEFAULT_OPEN_ICON } from './shared';
import './editor.scss';

const ALLOWED_BLOCKS = [ 'blockish/accordion-item' ];
const TEMPLATE = [
	[ 'blockish/accordion-item' ],
	[ 'blockish/accordion-item' ],
	[ 'blockish/accordion-item' ],
];

export default function Edit( { attributes, advancedControls, clientId } ) {
	const { insertBlock } = useDispatch( blockEditorStore );

	const blockProps = useBlockProps( {
		className: clsx( 'blockish-accordion' ),
		'data-faq-schema': attributes?.faqSchema ? 'true' : 'false',
		'data-max-expanded': attributes?.maxItemExpanded || 'one',
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'blockish-accordion-items',
		},
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			renderAppender: false,
		}
	);

	const handleAddItem = () => {
		insertBlock(
			createBlock( 'blockish/accordion-item' ),
			undefined,
			clientId
		);
	};

	return (
		<>
			<Inspector
				attributes={ {
					...attributes,
					closeIcon: attributes?.closeIcon || DEFAULT_CLOSED_ICON,
					openIcon: attributes?.openIcon || DEFAULT_OPEN_ICON,
				} }
				advancedControls={ advancedControls }
			/>
			<div { ...blockProps }>
				<div { ...innerBlocksProps } />
				<div className="blockish-accordion-editor__appender">
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
