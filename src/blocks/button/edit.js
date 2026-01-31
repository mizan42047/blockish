import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import './editor.scss';
import Inspector from './inspector';

export default function Edit({ attributes, setAttributes, advancedControls }) {
	const { text, link, ariaLabel, hoverAnimation, htmlTag, addIcon, icon, iconPosition } = attributes;
	const { getLinkProps, renderIcon } = window.blockish.helpers;
	const linkAttributes = getLinkProps(link);
	const Tag = htmlTag || 'a';
	
	const blockProps = useBlockProps({
		className: `blockish-button ${hoverAnimation !== 'none' ? `hover-${hoverAnimation}` : ''}`,
	});

	return (
		<>
			<Inspector attributes={attributes} setAttributes={setAttributes} advancedControls={advancedControls} />
			<div {...blockProps}>
				<Tag
					className="blockish-button-inner"
					{...(Tag === 'a' ? linkAttributes : {})}
					aria-label={ariaLabel || text}
				>
					{addIcon && iconPosition === 'before' && renderIcon(icon)}
					<RichText
						tagName="span"
						value={text}
						onChange={(value) => setAttributes({ text: value })}
						placeholder={__('Button text...', 'blockish')}
						withoutInteractiveFormatting={true}
						allowedFormats={[]}
					/>
					{addIcon && iconPosition === 'after' && renderIcon(icon)}
				</Tag>
			</div>
		</>
	)
}
