const SEPARATOR_CHAR_MAP = {
	default: ',',
	dot: '.',
	space: ' ',
	underscore: '_',
	apostrophe: "'",
};

const clampNumber = ( value, fallback = 0 ) => {
	const parsed = parseFloat( value );
	return Number.isFinite( parsed ) ? parsed : fallback;
};

const getDecimalCount = ( value ) => {
	const stringValue = String( value ?? '' );
	if ( ! stringValue.includes( '.' ) ) {
		return 0;
	}

	return stringValue.split( '.' )[ 1 ]?.length || 0;
};

export const getCounterSettings = ( attributes = {} ) => {
	const startNumber = clampNumber( attributes?.startNumber, 0 );
	const endNumber = clampNumber( attributes?.endNumber, 100 );
	const animationDuration = Math.max(
		0,
		clampNumber( attributes?.animationDuration, 2 )
	);
	const thousandSeparator = !! attributes?.thousandSeparator;
	const separatorType = attributes?.separator?.value || 'default';
	const prefix = attributes?.numberPrefix || '';
	const suffix = attributes?.numberSuffix || '';
	const decimals = Math.max(
		getDecimalCount( attributes?.startNumber ),
		getDecimalCount( attributes?.endNumber )
	);

	return {
		startNumber,
		endNumber,
		animationDuration,
		thousandSeparator,
		separatorType,
		prefix,
		suffix,
		decimals,
	};
};

export const formatCounterValue = ( value, settings = {} ) => {
	const safeValue = clampNumber( value, 0 );
	const decimals = Math.max( 0, settings?.decimals || 0 );
	const separator =
		SEPARATOR_CHAR_MAP[ settings?.separatorType ] ||
		SEPARATOR_CHAR_MAP.default;
	const prefix = settings?.prefix || '';
	const suffix = settings?.suffix || '';

	const isNegative = safeValue < 0;
	const absoluteValue = Math.abs( safeValue );
	const fixedValue = absoluteValue.toFixed( decimals );
	const [ wholePart, decimalPart ] = fixedValue.split( '.' );

	const groupedWholePart = settings?.thousandSeparator
		? wholePart.replace( /\B(?=(\d{3})+(?!\d))/g, separator )
		: wholePart;

	const decimalText = decimalPart ? `.${ decimalPart }` : '';
	const sign = isNegative ? '-' : '';

	return `${ prefix }${ sign }${ groupedWholePart }${ decimalText }${ suffix }`;
};

const easeOutCubic = ( value ) => 1 - Math.pow( 1 - value, 3 );

export class BlockishCounterAnimator {
	constructor( wrapper, options = {} ) {
		this.wrapper = wrapper;
		this.valueElement = wrapper?.querySelector(
			'[data-counter-value]'
		);
		this.options = {
			observe: true,
			once: true,
			...options,
		};
		this.rafId = null;
		this.observer = null;
		this.hasAnimated = false;
	}

	destroy() {
		if ( this.rafId ) {
			window.cancelAnimationFrame( this.rafId );
			this.rafId = null;
		}

		if ( this.observer ) {
			this.observer.disconnect();
			this.observer = null;
		}
	}

	render( value ) {
		if ( ! this.valueElement ) {
			return;
		}

		this.valueElement.textContent = formatCounterValue( value, this.options );
	}

	start() {
		if ( ! this.wrapper || ! this.valueElement ) {
			return;
		}

		if ( this.hasAnimated && this.options.once ) {
			return;
		}

		this.hasAnimated = true;

		const startValue = clampNumber( this.options?.startNumber, 0 );
		const endValue = clampNumber( this.options?.endNumber, 0 );
		const durationMs = Math.max(
			0,
			clampNumber( this.options?.animationDuration, 2 ) * 1000
		);
		const prefersReducedMotion = window.matchMedia?.(
			'(prefers-reduced-motion: reduce)'
		)?.matches;

		if ( prefersReducedMotion || durationMs <= 0 || startValue === endValue ) {
			this.render( endValue );
			return;
		}

		this.render( startValue );
		const startTime = performance.now();

		const tick = ( now ) => {
			const elapsed = now - startTime;
			const progress = Math.min( 1, elapsed / durationMs );
			const easedProgress = easeOutCubic( progress );
			const currentValue =
				startValue + ( endValue - startValue ) * easedProgress;

			this.render( currentValue );

			if ( progress < 1 ) {
				this.rafId = window.requestAnimationFrame( tick );
				return;
			}

			this.render( endValue );
			this.rafId = null;
		};

		this.rafId = window.requestAnimationFrame( tick );
	}

	mount() {
		this.render( this.options?.startNumber );

		if ( ! this.options.observe || ! ( 'IntersectionObserver' in window ) ) {
			this.start();
			return;
		}

		this.observer = new IntersectionObserver(
			( entries ) => {
				entries.forEach( ( entry ) => {
					if ( ! entry.isIntersecting ) {
						return;
					}

					this.start();
					if ( this.options.once ) {
						this.observer?.disconnect();
						this.observer = null;
					}
				} );
			},
			{ threshold: 0.2 }
		);

		this.observer.observe( this.wrapper );
	}
}

export const getSettingsFromDataset = ( dataset = {} ) => ( {
	startNumber: clampNumber( dataset?.startNumber, 0 ),
	endNumber: clampNumber( dataset?.endNumber, 100 ),
	animationDuration: clampNumber( dataset?.animationDuration, 2 ),
	thousandSeparator: dataset?.thousandSeparator === 'true',
	separatorType: dataset?.separatorType || 'default',
	prefix: dataset?.prefix || '',
	suffix: dataset?.suffix || '',
	decimals: parseInt( dataset?.decimals, 10 ) || 0,
} );
