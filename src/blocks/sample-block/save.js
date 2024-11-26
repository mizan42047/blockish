import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function Save({ attributes }) {
	const blockProps = useBlockProps.save({
		className: 'sample-block',
	});

	return (
		<>
			<div {...blockProps}>
				<RichText.Content
					className="sample-block__content"
					tagName={attributes?.tag}
					value={attributes?.content}
				/>
			</div>
		</>
	);
}