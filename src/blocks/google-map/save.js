import { useBlockProps } from '@wordpress/block-editor';
import { getGoogleMapsEmbedUrl } from './utils';

export default function Save( { attributes } ) {
	const blockProps = useBlockProps.save( {
		className: 'blockish-google-map-wrapper',
	} );

	return (
		<div { ...blockProps }>
			<iframe
				className="blockish-google-map__iframe"
				title="Google Map"
				src={ getGoogleMapsEmbedUrl(
					attributes?.location,
					attributes?.zoom
				) }
				loading="lazy"
				allowFullScreen
				referrerPolicy="no-referrer-when-downgrade"
			/>
		</div>
	);
}
