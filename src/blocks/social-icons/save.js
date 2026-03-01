import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

const SHAPE_OPTIONS = [ 'square', 'rounded', 'circle' ];
const COLUMN_OPTIONS = [ 'auto', '1', '2', '3', '4', '5', '6' ];
const COLOR_MODES = [ 'official', 'custom' ];

export default function Save( { attributes } ) {
	const shape = SHAPE_OPTIONS.includes( attributes?.shape )
		? attributes.shape
		: 'circle';
	const columns = COLUMN_OPTIONS.includes( attributes?.columns )
		? attributes.columns
		: 'auto';
	const colorMode = COLOR_MODES.includes( attributes?.iconColorMode )
		? attributes.iconColorMode
		: 'official';

	const blockProps = useBlockProps.save( {
		className: `blockish-social-icons shape-${ shape } columns-${ columns } is-color-${ colorMode }`,
	} );
	const innerBlocksProps = useInnerBlocksProps.save( blockProps );

	return <ul { ...innerBlocksProps } />;
}
