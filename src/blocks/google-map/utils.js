const getGoogleMapsEmbedUrl = ( location, zoom ) => {
	const safeLocation = location?.trim() || 'New York, NY';
	const parsedZoom = Number.parseInt( zoom, 10 );
	const safeZoom = Number.isNaN( parsedZoom )
		? 14
		: Math.min( 21, Math.max( 0, parsedZoom ) );

	return `https://www.google.com/maps?q=${ encodeURIComponent(
		safeLocation
	) }&z=${ safeZoom }&output=embed`;
};

export { getGoogleMapsEmbedUrl };
