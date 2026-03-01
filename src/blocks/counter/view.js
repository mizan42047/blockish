import {
	BlockishCounterAnimator,
	getSettingsFromDataset,
} from './utils';

const initCounter = ( element ) => {
	const settings = getSettingsFromDataset( element?.dataset || {} );
	const counterAnimator = new BlockishCounterAnimator( element, {
		...settings,
		observe: true,
		once: true,
	} );

	counterAnimator.mount();
};

const initAllCounters = () => {
	document
		.querySelectorAll( '.wp-block-blockish-counter[data-blockish-counter="true"]' )
		.forEach( ( element ) => initCounter( element ) );
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initAllCounters );
} else {
	initAllCounters();
}
