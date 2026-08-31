import { useMemo, memo } from '@wordpress/element';
import { parse } from '@wordpress/blocks';
import { BlockPreview } from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const PREVIEW_STYLES = [
	{
		css: `
			body {
				padding: 24px;
				margin: 0;
				background: #fff;
			}
			.block-list-appender,
			.block-editor-inserter,
			.block-editor-block-list__insertion-point {
				display: none !important;
			}
			.block-editor-block-list__layout {
				padding: 0;
				margin: 0;
			}
			.block-editor-block-list__block {
				max-width: none !important;
				margin-left: 0 !important;
				margin-right: 0 !important;
			}
		`,
	},
];

function PreviewLoading() {
	return (
		<div
			className="blockish-tb-preview blockish-tb-preview--loading"
			aria-busy="true"
			aria-live="polite"
		>
			<Spinner />
			<span className="blockish-tb-preview__loading-label">
				{ __( 'Loading preview…', 'blockish' ) }
			</span>
		</div>
	);
}

function ItemPreview( { content } ) {
	const blocks = useMemo( () => {
		if ( ! content ) {
			return [];
		}
		return parse( content );
	}, [ content ] );

	if ( ! blocks.length ) {
		return (
			<div className="blockish-tb-preview blockish-tb-preview--empty">
				{ __( 'Empty template', 'blockish' ) }
			</div>
		);
	}

	return (
		<div className="blockish-tb-preview">
			<BlockPreview.Async placeholder={ <PreviewLoading /> }>
				<BlockPreview
					blocks={ blocks }
					viewportWidth={ 1200 }
					additionalStyles={ PREVIEW_STYLES }
				/>
			</BlockPreview.Async>
		</div>
	);
}

export default memo( ItemPreview );
