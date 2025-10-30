import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import './editor.scss';
import Inspector from './inspector';

export default function Edit({ attributes, advancedControls }) {
	const { BlockishIcon } = window.blockish.helpers;
	const blockProps = useBlockProps();
	return (
		<>
			<Inspector attributes={attributes} advancedControls={advancedControls} />
			<div {...blockProps}>
				<BlockishIcon icon={attributes.icon} width={24} height={24} />
			</div>
		</>
	)
}
