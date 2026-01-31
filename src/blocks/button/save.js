import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function Save({ attributes }) {
	const { text, link, ariaLabel, hoverAnimation, htmlTag, addIcon, icon, iconPosition } = attributes;
	const { getLinkProps, renderIcon } = window.blockish.helpers;
	const linkAttributes = getLinkProps(link);
	const Tag = htmlTag || 'a';
	
	const blockProps = useBlockProps.save({
		className: `blockish-button ${hoverAnimation !== 'none' ? `hover-${hoverAnimation}` : ''}`,
	});

	return (
		<div {...blockProps}>
			<Tag
				className="blockish-button-inner"
				{...(Tag === 'a' ? linkAttributes : {})}
				aria-label={ariaLabel || text}
			>
				{addIcon && iconPosition === 'before' && renderIcon(icon)}
				<RichText.Content
					tagName="span"
					value={text}
				/>
				{addIcon && iconPosition === 'after' && renderIcon(icon)}
			</Tag>
		</div>
	);
}
