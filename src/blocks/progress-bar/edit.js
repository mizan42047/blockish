import { useEffect, useRef, useState } from '@wordpress/element';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import Inspector from './inspector';
import './editor.scss';

const clampPercentage = ( value ) => {
	const parsed = parseInt( value, 10 );
	if ( ! Number.isFinite( parsed ) ) {
		return 0;
	}
	return Math.max( 0, Math.min( 100, parsed ) );
};

export default function Edit( { attributes, setAttributes, advancedControls } ) {
	const percentage = clampPercentage( attributes?.percentage );
	const animationDuration = Math.max(
		0,
		parseFloat( attributes?.animationDuration ) || 0
	);
	const blockRef = useRef( null );
	const [ isInView, setIsInView ] = useState( false );
	const [ animatedPercentage, setAnimatedPercentage ] = useState( 0 );
	const TitleTag = attributes?.titleTag?.value || 'h4';
	const blockProps = useBlockProps( {
		className: 'blockish-progress-bar',
		ref: blockRef,
	} );

	useEffect( () => {
		if ( typeof window.IntersectionObserver === 'undefined' ) {
			setIsInView( true );
			return;
		}

		const observer = new window.IntersectionObserver(
			( entries ) => {
				entries.forEach( ( entry ) => {
					setIsInView( entry.isIntersecting );
				} );
			},
			{
				threshold: 0.35,
			}
		);

		if ( blockRef.current ) {
			observer.observe( blockRef.current );
		}

		return () => observer.disconnect();
	}, [] );

	useEffect( () => {
		if ( ! isInView ) {
			setAnimatedPercentage( 0 );
			return;
		}

		setAnimatedPercentage( 0 );
		let frameTwo = null;
		const frameOne = window.requestAnimationFrame( () => {
			frameTwo = window.requestAnimationFrame( () => {
				setAnimatedPercentage( percentage );
			} );
		} );

		return () => {
			window.cancelAnimationFrame( frameOne );
			if ( frameTwo ) {
				window.cancelAnimationFrame( frameTwo );
			}
		};
	}, [ isInView, percentage, animationDuration ] );

	return (
		<>
			<Inspector attributes={ attributes } advancedControls={ advancedControls } />
			<div { ...blockProps }>
				{ attributes?.showTitle && (
					<div className="blockish-progress-bar__header">
						<RichText
							tagName={ TitleTag }
							className="blockish-progress-bar__title"
							value={ attributes?.title }
							onChange={ ( value ) => setAttributes( { title: value } ) }
							placeholder={ 'Progress' }
						/>
					</div>
				) }
				<div className="blockish-progress-bar__track">
					<div
						className="blockish-progress-bar__fill"
						data-animation-duration={ animationDuration }
						style={ {
							width: `${ animatedPercentage }%`,
							transitionDuration: `${ animationDuration }s`,
						} }
					>
						<div
							className={ `blockish-progress-bar__fill-content${
								attributes?.displayPercentage ? ' has-percentage' : ''
							}` }
						>
							<RichText
								tagName="span"
								className="blockish-progress-bar__inner-text"
								value={ attributes?.innerText }
								onChange={ ( value ) => setAttributes( { innerText: value } ) }
								placeholder={ 'Web Deigner' }
							/>
							{ attributes?.displayPercentage && (
								<span className="blockish-progress-bar__percentage">
									{ `${ percentage }%` }
								</span>
							) }
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
