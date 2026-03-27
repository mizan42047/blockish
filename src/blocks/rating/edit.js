import { useBlockProps } from '@wordpress/block-editor';
import Inspector from './inspector';
import './editor.scss';

export default function Edit( {
	attributes,
	setAttributes,
	advancedControls,
} ) {
	const { BlockishIcon } = window.blockish.helpers;
	const blockProps = useBlockProps( {
		className: 'blockish-rating',
	} );

	const ratingScale = Math.max(
		1,
		Math.min( 10, parseInt( attributes?.ratingScale, 10 ) || 1 )
	);
	const rating = Math.max(
		0,
		Math.min(
			ratingScale,
			Math.round( ( parseFloat( attributes?.rating ) || 0 ) * 2 ) / 2
		)
	);

	return (
		<>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				advancedControls={ advancedControls }
			/>
			<div { ...blockProps }>
				<div className="blockish-rating-icons">
					{ Array.from( { length: ratingScale } ).map( ( _, index ) => {
						const fill = Math.max(
							0,
							Math.min( 1, rating - index )
						);

						return (
							<span
								key={ index }
								className="blockish-rating-icon"
								style={ {
									'--blockish-rating-fill': `${ fill * 100 }%`,
								} }
								aria-hidden="true"
							>
								<span className="blockish-rating-icon-base">
									<BlockishIcon
										icon={ attributes?.icon }
										width={ 24 }
										height={ 24 }
										fill="currentColor"
									/>
								</span>
								<span className="blockish-rating-icon-fill">
									<BlockishIcon
										icon={ attributes?.icon }
										width={ 24 }
										height={ 24 }
										fill="currentColor"
									/>
								</span>
							</span>
						);
					} ) }
				</div>
			</div>
		</>
	);
}
