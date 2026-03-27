import { useEffect, useMemo, useRef } from '@wordpress/element';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import Inspector from './inspector';
import {
	BlockishCounterAnimator,
	formatCounterValue,
	getCounterSettings,
} from './utils';
import './editor.scss';

export default function Edit( {
	attributes,
	setAttributes,
	advancedControls,
} ) {
	const wrapperRef = useRef( null );
	const animatorRef = useRef( null );

	const settings = useMemo(
		() => getCounterSettings( attributes ),
		[
			attributes?.startNumber,
			attributes?.endNumber,
			attributes?.animationDuration,
			attributes?.thousandSeparator,
			attributes?.separator?.value,
			attributes?.numberPrefix,
			attributes?.numberSuffix,
		]
	);
	const titlePosition = attributes?.titlePosition || 'before';
	const TitleTag = attributes?.titleTag?.value || 'h3';
	const blockProps = useBlockProps( {
		ref: wrapperRef,
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

	useEffect( () => {
		if ( ! wrapperRef.current ) {
			return undefined;
		}

		animatorRef.current?.destroy();
		animatorRef.current = new BlockishCounterAnimator( wrapperRef.current, {
			...settings,
			observe: false,
			once: false,
		} );
		animatorRef.current.mount();

		return () => {
			animatorRef.current?.destroy();
		};
	}, [ settings ] );

	const counterNumberElement = (
		<span className="blockish-counter__number">
			<span data-counter-value className="blockish-counter__number-value">
				{ formatCounterValue( settings.startNumber, settings ) }
			</span>
		</span>
	);

	const titleElement = (
		<RichText
			tagName={ TitleTag }
			className="blockish-counter__title"
			value={ attributes?.title }
			onChange={ ( value ) => setAttributes( { title: value } ) }
			placeholder="Cool Number"
		/>
	);

	return (
		<>
			<Inspector attributes={ attributes } advancedControls={ advancedControls } />
			<div { ...blockProps }>
				<div className="blockish-counter__inner">
					{ ( titlePosition === 'before' || titlePosition === 'start' ) &&
						titleElement }
					{ counterNumberElement }
					{ ( titlePosition === 'after' || titlePosition === 'end' ) &&
						titleElement }
				</div>
			</div>
		</>
	);
}
