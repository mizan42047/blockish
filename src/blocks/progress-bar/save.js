import { useBlockProps, RichText } from '@wordpress/block-editor';

const clampPercentage = ( value ) => {
	const parsed = parseInt( value, 10 );
	if ( ! Number.isFinite( parsed ) ) {
		return 0;
	}
	return Math.max( 0, Math.min( 100, parsed ) );
};

export default function Save( { attributes } ) {
	const percentage = clampPercentage( attributes?.percentage );
	const animationDuration = Math.max(
		0,
		parseFloat( attributes?.animationDuration ) || 0
	);
	const TitleTag = attributes?.titleTag?.value || 'h4';
	const blockProps = useBlockProps.save( {
		className: 'blockish-progress-bar',
	} );

	return (
		<div { ...blockProps }>
			{ attributes?.showTitle && (
				<div className="blockish-progress-bar__header">
					<RichText.Content
						tagName={ TitleTag }
						className="blockish-progress-bar__title"
						value={ attributes?.title }
					/>
				</div>
			) }
			<div className="blockish-progress-bar__track">
				<div
					className="blockish-progress-bar__fill"
					data-target-percentage={ percentage }
					data-animation-duration={ animationDuration }
					style={ {
						width: '0%',
						transitionDuration: `${ animationDuration }s`,
					} }
				>
					<div
						className={ `blockish-progress-bar__fill-content${
							attributes?.displayPercentage ? ' has-percentage' : ''
						}` }
					>
						<RichText.Content
							tagName="span"
							className="blockish-progress-bar__inner-text"
							value={ attributes?.innerText }
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
	);
}
