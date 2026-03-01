import { useBlockProps, RichText } from '@wordpress/block-editor';
import { formatCounterValue, getCounterSettings } from './utils';

export default function Save( { attributes } ) {
	const settings = getCounterSettings( attributes );
	const titlePosition = attributes?.titlePosition || 'before';
	const TitleTag = attributes?.titleTag?.value || 'h3';
	const blockProps = useBlockProps.save( {
		className: `blockish-counter is-title-${ titlePosition }`,
		'data-blockish-counter': 'true',
		'data-start-number': settings.startNumber,
		'data-end-number': settings.endNumber,
		'data-animation-duration': settings.animationDuration,
		'data-thousand-separator': settings.thousandSeparator,
		'data-separator-type': settings.separatorType,
		'data-prefix': settings.prefix,
		'data-suffix': settings.suffix,
		'data-decimals': settings.decimals,
	} );

	const counterNumberElement = (
		<span className="blockish-counter__number">
			<span data-counter-value className="blockish-counter__number-value">
				{ formatCounterValue( settings.startNumber, settings ) }
			</span>
		</span>
	);

	const titleElement = (
		<RichText.Content
			tagName={ TitleTag }
			className="blockish-counter__title"
			value={ attributes?.title }
		/>
	);

	return (
		<div { ...blockProps }>
			<div className="blockish-counter__inner">
				{ ( titlePosition === 'before' || titlePosition === 'start' ) &&
					titleElement }
				{ counterNumberElement }
				{ ( titlePosition === 'after' || titlePosition === 'end' ) &&
					titleElement }
			</div>
		</div>
	);
}
