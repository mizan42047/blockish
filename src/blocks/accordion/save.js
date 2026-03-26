import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import clsx from 'clsx';

export default function Save( { attributes } ) {
	const blockProps = useBlockProps.save( {
		className: clsx( 'blockish-accordion' ),
		'data-faq-schema': attributes?.faqSchema ? 'true' : 'false',
		'data-max-expanded': attributes?.maxItemExpanded || 'one',
	} );

	const innerBlocksProps = useInnerBlocksProps.save( blockProps );

	return <div { ...innerBlocksProps } />;
}
