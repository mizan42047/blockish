import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function Save( { attributes } ) {
	const { BlockishIcon, getLinkProps } = window.blockish.helpers;
	const linkAttributes = getLinkProps( attributes?.link );
	const Tag = linkAttributes?.href ? 'a' : 'span';
	const blockProps = useBlockProps.save( {
		className: 'blockish-icon-list-item',
	} );

	return (
		<li { ...blockProps }>
			<Tag className="blockish-icon-list-item-link" { ...linkAttributes }>
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
				<RichText.Content
					tagName="span"
					className="blockish-icon-list-item-text"
					value={ attributes?.text }
				/>
			</Tag>
		</li>
	);
}
