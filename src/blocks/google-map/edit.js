import { useBlockProps } from '@wordpress/block-editor';
import './editor.scss';
import Inspector from './inspector';
import { getGoogleMapsEmbedUrl } from './utils';

export default function Edit( { attributes, advancedControls } ) {
	const blockProps = useBlockProps( {
		className: 'blockish-google-map-wrapper',
	} );

	return (
		<>
			<Inspector
				attributes={ attributes }
				advancedControls={ advancedControls }
			/>

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
		</>
	);
}
