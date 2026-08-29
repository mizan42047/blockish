export const THEME_OVERRIDE_MAX = 4;
export const NESTED_CLASS_PREFIX = 'bb-nested-';

export function sanitizeLevel( level ) {
	const parsed = typeof level === 'number' ? level : parseInt( level, 10 );
	if ( Number.isNaN( parsed ) ) {
		return 0;
	}
	return Math.max( 0, Math.min( THEME_OVERRIDE_MAX, parsed ) );
}

export function getGlobalThemeOverrideLevel() {
	return sanitizeLevel( window?.blockishGlobalData?.globalThemeOverrideLevel ?? 0 );
}

export function resolveThemeOverrideLevel( attributes = {} ) {
	const raw = attributes?.themeOverrideLevel ?? 'inherit';
	if ( raw === 'inherit' || raw === '' || raw == null ) {
		return getGlobalThemeOverrideLevel();
	}
	const level = parseInt( raw, 10 );
	if ( Number.isNaN( level ) ) {
		return getGlobalThemeOverrideLevel();
	}
	return sanitizeLevel( level );
}

export function nestedClassNames( level ) {
	const safe = sanitizeLevel( level );
	const names = [];
	for ( let i = 1; i <= safe; i += 1 ) {
		names.push( `${ NESTED_CLASS_PREFIX }${ i }` );
	}
	return names;
}

export function wrapperSelector( hash, level ) {
	const blockClass = `bb-${ hash }`;
	const base = `.${ blockClass }.blockish-block-wrapper`;
	const safe = sanitizeLevel( level );

	if ( safe <= 0 ) {
		return base;
	}

	const nested = nestedClassNames( safe ).map( ( name ) => `.${ name }` ).join( '' );
	return `body ${ base }${ nested }`;
}

export function wrapperClassList( hash, level ) {
	return [ `bb-${ hash }`, 'blockish-block-wrapper', ...nestedClassNames( level ) ];
}

/**
 * Replace {{WRAPPER}} / .{{WRAPPER}} in selector templates (matches PHP ThemeOverride::replace_wrapper_token_with_root).
 */
export function replaceWrapperToken( selector, wrapperRoot ) {
	return String( selector )
		.replace( /\.\{\{WRAPPER\}\}/g, wrapperRoot )
		.replace( /\{\{WRAPPER\}\}/g, wrapperRoot );
}
