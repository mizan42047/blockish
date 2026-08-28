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
