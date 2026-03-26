import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
} from '@wordpress/block-editor';
import { useEffect, useRef, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import Inspector from './inspector';
import { DEFAULT_CLOSED_ICON, DEFAULT_OPEN_ICON } from '../accordion/shared';
import './editor.scss';

const TEMPLATE = [
	[
		'blockish/container',
		{
			isVariationPicked: true,
			containerWidth: 'alignfull',
		},
	],
];

export default function Edit( {
	attributes,
	setAttributes,
	advancedControls,
	clientId,
} ) {
	const { BlockishIcon } = window.blockish.helpers;
	const [ isPreviewOpen, setIsPreviewOpen ] = useState(
		!! attributes?.defaultOpen
	);
	const wasSelectedRef = useRef( false );
	const { rootClientId, maxItemExpanded, isSelectedInEditor } = useSelect(
		( select ) => {
			const editorStore = select( 'core/block-editor' );
			const parentClientId = editorStore.getBlockRootClientId( clientId );
			const parentAttributes = parentClientId
				? editorStore.getBlockAttributes( parentClientId )
				: null;

			return {
				rootClientId: parentClientId,
				maxItemExpanded: parentAttributes?.maxItemExpanded || 'one',
				isSelectedInEditor:
					editorStore.isBlockSelected( clientId ) ||
					editorStore.hasSelectedInnerBlock( clientId, true ),
			};
		},
		[ clientId ]
	);

	useEffect( () => {
		if ( ! attributes?.itemId ) {
			setAttributes( {
				itemId: `blockish-accordion-item-${ clientId.slice( -6 ) }`,
			} );
		}
	}, [ attributes?.itemId, clientId, setAttributes ] );

	useEffect( () => {
		setIsPreviewOpen( !! attributes?.defaultOpen );
	}, [ attributes?.defaultOpen ] );

	useEffect( () => {
		if (
			isSelectedInEditor &&
			! wasSelectedRef.current &&
			! isPreviewOpen
		) {
			setIsPreviewOpen( true );
		}

		wasSelectedRef.current = isSelectedInEditor;
	}, [ isPreviewOpen, isSelectedInEditor ] );

	useEffect( () => {
		const handleSiblingOpen = ( event ) => {
			if (
				event.detail?.rootClientId === rootClientId &&
				event.detail?.clientId !== clientId &&
				maxItemExpanded === 'one' &&
				! attributes?.defaultOpen
			) {
				setIsPreviewOpen( false );
			}
		};

		window.addEventListener(
			'blockish:accordion-editor-open',
			handleSiblingOpen
		);

		return () => {
			window.removeEventListener(
				'blockish:accordion-editor-open',
				handleSiblingOpen
			);
		};
	}, [ attributes?.defaultOpen, clientId, maxItemExpanded, rootClientId ] );

	const closedIcon = attributes?.expandIcon || DEFAULT_CLOSED_ICON;
	const openIcon = attributes?.collapseIcon || DEFAULT_OPEN_ICON;
	const blockProps = useBlockProps( {
		className: 'blockish-accordion-item',
	} );
	const contentProps = useInnerBlocksProps(
		{
			className: 'blockish-accordion-item-content-inner',
		},
		{
			template: TEMPLATE,
		}
	);

	const TitleTag = attributes?.titleTag?.value || 'h3';

	const handleTogglePreview = ( event ) => {
		event.preventDefault();

		const willOpen = ! isPreviewOpen;

		if ( willOpen && rootClientId ) {
			window.dispatchEvent(
				new CustomEvent( 'blockish:accordion-editor-open', {
					detail: {
						rootClientId,
						clientId,
					},
				} )
			);
		}

		setIsPreviewOpen( willOpen );
	};

	return (
		<>
			<Inspector advancedControls={ advancedControls } />
			<details { ...blockProps } open={ isPreviewOpen }>
				<summary
					className="blockish-accordion-item-trigger"
					onClick={ handleTogglePreview }
				>
					<span className="blockish-accordion-item-icons">
						<span
							className="blockish-accordion-item-icon"
							data-icon-state="closed"
							aria-hidden="true"
							style={ {
								display: isPreviewOpen ? 'none' : 'inline-flex',
							} }
						>
							<BlockishIcon
								icon={ closedIcon }
								width={ 18 }
								height={ 18 }
								fill="currentColor"
							/>
						</span>
						<span
							className="blockish-accordion-item-icon"
							data-icon-state="open"
							aria-hidden="true"
							style={ {
								display: isPreviewOpen ? 'inline-flex' : 'none',
							} }
						>
							<BlockishIcon
								icon={ openIcon }
								width={ 18 }
								height={ 18 }
								fill="currentColor"
							/>
						</span>
					</span>
					<TitleTag className="blockish-accordion-item-heading">
						<RichText
							tagName="span"
							className="blockish-accordion-item-title-text"
							value={ attributes?.title }
							style={ {
								color: isPreviewOpen ? '#111827' : undefined,
							} }
							allowedFormats={ [] }
							placeholder="Accordion title"
							onChange={ ( value ) =>
								setAttributes( { title: value } )
							}
						/>
					</TitleTag>
				</summary>
				<div
					className="blockish-accordion-item-panel"
					style={ {
						maxHeight: isPreviewOpen ? 'none' : '0px',
					} }
				>
					<div { ...contentProps } />
				</div>
			</details>
		</>
	);
}
