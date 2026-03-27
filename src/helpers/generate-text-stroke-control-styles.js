const normalizeColorValue = ( value ) => {
	if ( ! value || typeof value !== 'string' ) {
		return '';
	}

	if ( value.includes( '|' ) ) {
		const [ cssVar, fallback ] = value.split( '|' );
		if ( cssVar && fallback ) {
			return `var(${ cssVar }, ${ fallback })`;
		}
	}

	return value;
};

const generateTextStrokeControlStyles = ( value, deviceSlug = 'Desktop' ) => {
	if ( ! value ) {
		return '';
	}

	try {
		const usableValue = typeof value === 'string' ? JSON.parse( value ) : value;
		if ( ! usableValue || typeof usableValue !== 'object' ) {
			return '';
		}

		const width = usableValue?.width?.[ deviceSlug ];
		const color = normalizeColorValue( usableValue?.color );
		let styles = '';

		if ( width ) {
			styles += `-webkit-text-stroke-width: ${ width };`;
		}

		if ( color ) {
			styles += `-webkit-text-stroke-color: ${ color };`;
		}

		return styles;
	} catch ( e ) {
		return '';
	}
};

export default generateTextStrokeControlStyles;
