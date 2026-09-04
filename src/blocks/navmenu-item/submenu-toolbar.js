import { BlockControls, store as blockEditorStore } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { addSubmenu, columns } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

const ROOT_PARENTS = [ 'blockish/navmenu', 'blockish/offcanvas' ];

export default function SubmenuToolbar( { clientId } ) {
	const { insertBlock } = useDispatch( blockEditorStore );

	const { hasChild, isRootItem } = useSelect(
		( select ) => {
			const { getBlocks, getBlockRootClientId, getBlockName } =
				select( blockEditorStore );
			const rootClientId = getBlockRootClientId( clientId );
			const parentName = rootClientId ? getBlockName( rootClientId ) : '';

			return {
				hasChild: getBlocks( clientId ).length > 0,
				isRootItem: ROOT_PARENTS.includes( parentName ),
			};
		},
		[ clientId ]
	);

	if ( hasChild ) {
		return null;
	}

	const handleAddSubmenu = () => {
		insertBlock(
			createBlock( 'blockish/navmenu-submenu' ),
			undefined,
			clientId,
			true
		);
	};

	return (
		<BlockControls group="block">
			<ToolbarGroup>
				<ToolbarButton
					icon={ addSubmenu }
					label={ __( 'Add submenu', 'blockish' ) }
					onClick={ handleAddSubmenu }
				/>
				{ isRootItem ? (
					<ToolbarButton
						icon={ columns }
						label={ __( 'Megamenu', 'blockish' ) }
						onClick={ () => window.alert( 'Megamenu' ) }
					/>
				) : null }
			</ToolbarGroup>
		</BlockControls>
	);
}
