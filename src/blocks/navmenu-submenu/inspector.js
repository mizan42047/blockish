import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ( { advancedControls } ) => {
	const { BlockishControl, BlockishResponsiveControl } =
		window?.blockish?.controls || {};

	if ( ! BlockishControl ) {
		return null;
	}

	return (
		<InspectorControls>
			<BlockishControl
				type="BlockishTab"
				tabType="top-level"
				tabs={ [
					{ name: 'style', title: __( 'Style', 'blockish' ) },
					{ name: 'advanced', title: __( 'Advanced', 'blockish' ) },
				] }
			>
				{ ( { name: tabName } ) => (
					<>
						{ tabName === 'style' && (
							<BlockishControl
								type="BlockishPanelBody"
								title={ __( 'Submenu', 'blockish' ) }
								initialOpen={ true }
								indicatorSlugs={ [ 'alignment', 'itemGap' ] }
							>
								<BlockishResponsiveControl
									type="BlockishSelect"
									label={ __( 'Alignment', 'blockish' ) }
									slug="alignment"
									options={ [
										{ value: 'flex-start', label: __( 'Start', 'blockish' ) },
										{ value: 'center', label: __( 'Center', 'blockish' ) },
										{ value: 'flex-end', label: __( 'End', 'blockish' ) },
										{ value: 'space-between', label: __( 'Space Between', 'blockish' ) },
									] }
									__nextHasNoMarginBottom={ true }
									help={ __( 'Justifies the label within each submenu item.', 'blockish' ) }
								/>
								<BlockishResponsiveControl
									type="BlockishRangeUnit"
									label={ __( 'Item Gap', 'blockish' ) }
									slug="itemGap"
									left="60px"
								/>
							</BlockishControl>
						) }
						{ tabName === 'advanced' && advancedControls }
					</>
				) }
			</BlockishControl>
		</InspectorControls>
	);
};

export default memo( Inspector );
