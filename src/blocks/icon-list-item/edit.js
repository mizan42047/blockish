import { useBlockProps, RichText } from '@wordpress/block-editor';
import Inspector from './inspector';
import './editor.scss';

export default function Edit( {
	attributes,
	setAttributes,
	advancedControls,
} ) {
	const { BlockishIcon, getLinkProps } = window.blockish.helpers;
	const linkAttributes = getLinkProps( attributes?.link );
	const Tag = linkAttributes?.href ? 'a' : 'span';

	const blockProps = useBlockProps( {
		className: 'blockish-icon-list-item',
	} );

	return (
		<>
			<Inspector advancedControls={ advancedControls } />
			<li { ...blockProps }>
				<Tag
					className="blockish-icon-list-item-link"
					{ ...linkAttributes }
					onClick={ ( event ) => event.preventDefault() }
				>
					<span
						className="blockish-icon-list-item-icon"
						aria-hidden="true"
					>
						<BlockishIcon
							icon={ attributes?.icon }
							width={ 20 }
							height={ 20 }
							fill="currentColor"
						/>
					</span>
					<RichText
						tagName="span"
						className="blockish-icon-list-item-text"
						value={ attributes?.text }
						allowedFormats={ [] }
						onChange={ ( value ) =>
							setAttributes( { text: value } )
						}
					/>
				</Tag>
			</li>
		</>
	);
}
