export function getItemEditUrl( id ) {
	const base = window.blockishThemeBuilder?.editUrlBase || 'post.php';
	const url = new URL( base, window.location.origin );
	url.searchParams.set( 'post', String( id ) );
	url.searchParams.set( 'action', 'edit' );
	return url.toString();
}

export function navigateToUrl( url ) {
	if ( url ) {
		window.location.href = url;
	}
}

export function getDashboardUrl() {
	return window.blockishThemeBuilder?.dashboardUrl || 'admin.php?page=blockish-dashboard';
}

const TB_LIBRARY_FILTER_KEY = 'blockish_tb_library_filter';
const TB_LIBRARY_FILTERS = [ 'template', 'part' ];

/**
 * Last selected Theme Builder library tab (Templates / Parts).
 *
 * @return {'template'|'part'}
 */
export function getStoredLibraryFilter() {
	try {
		const stored = window.localStorage.getItem( TB_LIBRARY_FILTER_KEY );
		if ( TB_LIBRARY_FILTERS.includes( stored ) ) {
			return stored;
		}
	} catch ( error ) {
		// localStorage unavailable — fall back to default tab.
	}

	return 'template';
}

/**
 * @param {'template'|'part'} filter
 * @return {void}
 */
export function storeLibraryFilter( filter ) {
	if ( ! TB_LIBRARY_FILTERS.includes( filter ) ) {
		return;
	}

	try {
		window.localStorage.setItem( TB_LIBRARY_FILTER_KEY, filter );
	} catch ( error ) {
		// Ignore quota / privacy mode errors.
	}
}
