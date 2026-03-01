const clampPercentage = ( value ) => {
	const parsed = parseInt( value, 10 );
	if ( ! Number.isFinite( parsed ) ) {
		return 0;
	}
	return Math.max( 0, Math.min( 100, parsed ) );
};

const animateProgressBar = ( fillElement ) => {
	const targetPercentage = clampPercentage(
		fillElement?.dataset?.targetPercentage
	);
	fillElement.style.width = '0%';

	window.requestAnimationFrame( () => {
		window.requestAnimationFrame( () => {
			fillElement.style.width = `${ targetPercentage }%`;
		} );
	} );
};

let progressObserver = null;

const initProgressBars = () => {
	const fillElements = document.querySelectorAll(
		'.wp-block-blockish-progress-bar .blockish-progress-bar__fill'
	);

	if ( progressObserver ) {
		progressObserver.disconnect();
		progressObserver = null;
	}

	if ( ! fillElements.length ) {
		return;
	}

	if ( typeof window.IntersectionObserver === 'undefined' ) {
		fillElements.forEach( ( fillElement ) => animateProgressBar( fillElement ) );
		return;
	}

	progressObserver = new window.IntersectionObserver(
		( entries, observer ) => {
			entries.forEach( ( entry ) => {
				if ( ! entry.isIntersecting ) {
					return;
				}
				animateProgressBar( entry.target );
				observer.unobserve( entry.target );
			} );
		},
		{
			threshold: 0.35,
		}
	);

	fillElements.forEach( ( fillElement ) => {
		fillElement.style.width = '0%';
		progressObserver.observe( fillElement );
	} );
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initProgressBars );
} else {
	initProgressBars();
}

window.addEventListener( 'pageshow', ( event ) => {
	if ( event.persisted ) {
		initProgressBars();
	}
} );
