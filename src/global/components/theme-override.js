import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';

export default function ThemeOverrideControl( { attributes, setAttributes, name } ) {
	const { BlockishControl } = window?.blockish?.controls || {};
	const { THEME_OVERRIDE_MAX = 4 } = window.blockish.helpers || {};
	const themeOverrideExcludes = applyFilters(
		'blockish.advancedControl.themeOverride.exclude',
		new Set( [] )
	);

	if ( themeOverrideExcludes.has( name ) ) {
		return null;
	}

	const level = attributes?.themeOverrideLevel ?? 'inherit';

	const options = useMemo( () => {
		const items = [
			{ label: __( 'Inherit site default', 'blockish' ), value: 'inherit' },
			{ label: __( 'Off (0)', 'blockish' ), value: '0' },
		];
		for ( let i = 1; i <= THEME_OVERRIDE_MAX; i += 1 ) {
			items.push( {
				label: `${ __( 'Level', 'blockish' ) } ${ i }`,
				value: String( i ),
			} );
		}
		return items;
	}, [ THEME_OVERRIDE_MAX ] );

	return (
		<BlockishControl
			type="BlockishPanelBody"
			title={ __( 'Theme override strength', 'blockish' ) }
			initialOpen={ false }
			indicatorSlugs={ [ 'themeOverrideLevel' ] }
		>
			<BlockishControl
				type="SelectControl"
				label={ __( 'CSS priority vs theme', 'blockish' ) }
				help={ __(
					'Increase if your theme overrides this block’s styles. Level 1+ adds body + bb-nested-* classes on the wrapper.',
					'blockish'
				) }
				value={ level }
				options={ options }
				onChange={ ( value ) => setAttributes( { themeOverrideLevel: value } ) }
			/>
		</BlockishControl>
	);
}
