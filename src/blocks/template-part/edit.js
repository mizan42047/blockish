import {
	useBlockProps,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	Button,
	Dropdown,
	MenuGroup,
	MenuItem,
} from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { external } from '@wordpress/icons';
import './editor.scss';

const POST_TYPE = 'blockish_tb';
const META_KIND = 'blockish_tb_kind';
const META_SLUG = 'blockish_tb_slug';
const META_AREA = 'blockish_tb_area';
const META_PRIORITY = 'blockish_tb_priority';
const META_CONDITIONS = 'blockish_tb_conditions';

const AREA_OPTIONS = [
	{ label: __( 'Header', 'blockish' ), value: 'header' },
	{ label: __( 'Footer', 'blockish' ), value: 'footer' },
];

const SHOW_ON_LABELS = {
	entire_site: __( 'Entire site', 'blockish' ),
	front_page: __( 'Front page only', 'blockish' ),
	singular: __( 'All single posts & pages', 'blockish' ),
	archive: __( 'All archive pages', 'blockish' ),
	search: __( 'Search results', 'blockish' ),
	404: __( '404 page', 'blockish' ),
	'post_type:post': __( 'Blog posts only', 'blockish' ),
	'post_type:page': __( 'Pages only', 'blockish' ),
};

function areaLabel( area ) {
	const known = AREA_OPTIONS.find( ( o ) => o.value === area );
	if ( known ) {
		return known.label;
	}
	if ( ! area ) {
		return __( 'Part slot', 'blockish' );
	}
	return area.charAt( 0 ).toUpperCase() + area.slice( 1 );
}

function slugLabel( slug, catalog ) {
	const row = ( catalog || [] ).find( ( item ) => item.slug === slug );
	if ( row?.label ) {
		return row.label;
	}
	if ( ! slug ) {
		return '';
	}
	return slug
		.split( '-' )
		.map( ( bit ) => bit.charAt( 0 ).toUpperCase() + bit.slice( 1 ) )
		.join( ' ' );
}

function getPartTitle( item ) {
	if ( typeof item?.title === 'string' ) {
		return item.title;
	}
	return item?.title?.raw || item?.title?.rendered || __( '(Untitled)', 'blockish' );
}

function showOnFromConditions( conditions ) {
	const first = Array.isArray( conditions ) ? conditions[ 0 ] : null;
	if ( ! first || first.type === 'exclude' ) {
		return 'entire_site';
	}
	if ( first.rule === 'post_type' ) {
		const value = first.value || 'post';
		if ( value === 'post' || value === 'page' ) {
			return `post_type:${ value }`;
		}
		return 'entire_site';
	}
	return SHOW_ON_LABELS[ first.rule ] ? first.rule : 'entire_site';
}

function partShowOnLabel( item ) {
	const key = showOnFromConditions( item?.meta?.[ META_CONDITIONS ] );
	return SHOW_ON_LABELS[ key ] || SHOW_ON_LABELS.entire_site;
}

function sortParts( parts ) {
	return [ ...( parts || [] ) ].sort( ( a, b ) => {
		const pa = Number( a?.meta?.[ META_PRIORITY ] ?? 10 );
		const pb = Number( b?.meta?.[ META_PRIORITY ] ?? 10 );
		if ( pa === pb ) {
			return ( b.id || 0 ) - ( a.id || 0 );
		}
		return pb - pa;
	} );
}

function getPartEditUrl( id ) {
	return addQueryArgs( 'post.php', {
		post: id,
		action: 'edit',
	} );
}

function openPartInNewTab( id ) {
	if ( ! id ) {
		return;
	}
	window.open( getPartEditUrl( id ), '_blank', 'noopener,noreferrer' );
}

function slotValueFromAttributes( area, slug ) {
	if ( slug && ! [ 'header', 'footer' ].includes( slug ) ) {
		return `slug:${ slug }`;
	}
	return `area:${ area || 'header' }`;
}

export default function Edit( { attributes, setAttributes } ) {
	const area = attributes.area || 'header';
	const slug = attributes.slug || '';
	const partCatalog = window.blockishThemeBuilder?.partSlugs || [];

	const namedPartOptions = useMemo(
		() =>
			partCatalog
				.filter( ( row ) => row.group === 'woocommerce' )
				.map( ( row ) => ( {
					label: row.label || row.slug,
					value: `slug:${ row.slug }`,
				} ) ),
		[ partCatalog ]
	);

	const slotOptions = useMemo(
		() => [
			...AREA_OPTIONS.map( ( row ) => ( {
				label: row.label,
				value: `area:${ row.value }`,
			} ) ),
			...( namedPartOptions.length
				? [
						{
							label: __( '— WooCommerce parts —', 'blockish' ),
							value: '__divider__',
							disabled: true,
						},
						...namedPartOptions,
				  ]
				: [] ),
		],
		[ namedPartOptions ]
	);

	const slotValue = slotValueFromAttributes( area, slug );
	const isNamedSlot = slotValue.startsWith( 'slug:' );

	const matchedParts = useSelect(
		( select ) => {
			const { getEntityRecords } = select( coreStore );
			const items =
				getEntityRecords( 'postType', POST_TYPE, {
					per_page: 100,
					status: 'publish',
					context: 'edit',
				} ) || [];

			if ( isNamedSlot ) {
				const namedSlug = slotValue.slice( 5 );
				return sortParts(
					items.filter(
						( item ) =>
							( item?.meta?.[ META_KIND ] || '' ) === 'part' &&
							( item?.meta?.[ META_SLUG ] || '' ) === namedSlug
					)
				);
			}

			const matches = items.filter( ( item ) => {
				if ( ( item?.meta?.[ META_KIND ] || '' ) !== 'part' ) {
					return false;
				}
				const itemArea = (
					item?.meta?.[ META_AREA ] ||
					item?.meta?.[ META_SLUG ] ||
					''
				).toLowerCase();
				return itemArea === ( area || '' ).toLowerCase();
			} );
			return sortParts( matches );
		},
		[ area, isNamedSlot, slotValue ]
	);

	const blockProps = useBlockProps( {
		className: `blockish-template-part is-placeholder is-area-${ isNamedSlot ? 'named' : area || 'none' }`,
	} );

	const slotLabel = isNamedSlot
		? slugLabel( slotValue.slice( 5 ), partCatalog )
		: areaLabel( area );

	const editControl =
		matchedParts.length === 0 ? null : matchedParts.length === 1 ? (
			<Button
				variant="link"
				icon={ external }
				iconPosition="right"
				onClick={ () => openPartInNewTab( matchedParts[ 0 ].id ) }
				className="blockish-template-part__link"
			>
				{ __( 'Edit part', 'blockish' ) }
			</Button>
		) : (
			<Dropdown
				popoverProps={ { placement: 'bottom-end' } }
				renderToggle={ ( { isOpen, onToggle } ) => (
					<Button
						variant="link"
						onClick={ onToggle }
						aria-expanded={ isOpen }
						className="blockish-template-part__link"
					>
						{ sprintf(
							/* translators: %d: number of matching parts */
							__( 'Edit parts (%d)', 'blockish' ),
							matchedParts.length
						) }
					</Button>
				) }
				renderContent={ ( { onClose } ) => (
					<div className="blockish-template-part__parts-menu">
						<MenuGroup label={ __( 'Open in new tab', 'blockish' ) }>
							{ matchedParts.map( ( part ) => (
								<MenuItem
									key={ part.id }
									icon={ external }
									onClick={ () => {
										openPartInNewTab( part.id );
										onClose();
									} }
								>
									<span className="blockish-template-part__menu-item">
										<strong>{ getPartTitle( part ) }</strong>
										{ ! isNamedSlot ? (
											<span>
												{ sprintf(
													/* translators: %s: Show on location */
													__( 'Shows on: %s', 'blockish' ),
													partShowOnLabel( part )
												) }
											</span>
										) : null }
									</span>
								</MenuItem>
							) ) }
						</MenuGroup>
					</div>
				) }
			/>
		);

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Part slot', 'blockish' ) }
					initialOpen={ true }
				>
					<SelectControl
						label={ __( 'Insert', 'blockish' ) }
						value={ slotOptions.some( ( o ) => o.value === slotValue )
							? slotValue
							: `area:${ area || 'header' }` }
						options={ slotOptions }
						help={
							isNamedSlot
								? __(
										'WooCommerce parts load by slug (no Show on rules). Create the matching part in Theme Builder first.',
										'blockish'
								  )
								: __(
										'Header/footer parts use Area + Show on conditions. Remove this block to skip the area.',
										'blockish'
								  )
						}
						onChange={ ( value ) => {
							if ( ! value || value === '__divider__' ) {
								return;
							}
							if ( value.startsWith( 'slug:' ) ) {
								setAttributes( {
									slug: value.slice( 5 ),
									area: '',
								} );
								return;
							}
							setAttributes( {
								area: value.slice( 5 ) || 'header',
								slug: '',
							} );
						} }
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<div className="blockish-template-part__bar">
					<span className="blockish-template-part__badge">
						{ isNamedSlot ? __( 'WC Part', 'blockish' ) : __( 'Slot', 'blockish' ) }
					</span>
					<strong className="blockish-template-part__label">
						{ slotLabel }
					</strong>
					{ editControl }
				</div>
			</div>
		</>
	);
}
