const BRIDGE = 8;
const MARGIN = 8;

const ITEM_SELECTOR =
	':scope > .blockish-block-navmenu-item, :scope > .wp-block-blockish-navmenu-item';

/**
 * Same-level navmenu item siblings (editor + frontend list markup).
 *
 * @param {HTMLElement} item
 * @return {HTMLElement[]} List of sibling items.
 */
export function getNavmenuItemSiblings( item ) {
	const list = item?.parentElement;
	if ( ! list ) {
		return [];
	}
	return Array.from( list.querySelectorAll( ITEM_SELECTOR ) );
}

/**
 * Mark which item is open in this list (editor React sync via data attr).
 *
 * @param {HTMLElement} item
 * @param {string}      id   clientId
 */
export function setListOpenSubmenuId( item, id ) {
	const list = item?.parentElement;
	if ( ! list || ! id ) {
		return;
	}
	list.dataset.blockishOpenSubmenu = id;
}

/**
 * Clear list open id only if this item still owns it.
 *
 * @param {HTMLElement} item
 * @param {string}      id   clientId
 */
export function clearListOpenSubmenuId( item, id ) {
	const list = item?.parentElement;
	if ( ! list || ! id ) {
		return;
	}
	if ( list.dataset.blockishOpenSubmenu === id ) {
		delete list.dataset.blockishOpenSubmenu;
	}
}

/**
 * Close other open submenus at the same level via class / callback.
 *
 * @param {HTMLElement}               item
 * @param {(el: HTMLElement) => void} closeFn
 */
export function closeSiblingNavmenuSubmenus( item, closeFn ) {
	if ( ! closeFn ) {
		return;
	}
	getNavmenuItemSiblings( item ).forEach( ( sibling ) => {
		if ( sibling === item ) {
			return;
		}
		if (
			sibling.classList.contains( 'has-submenu' ) &&
			sibling.classList.contains( 'is-submenu-open' )
		) {
			closeFn( sibling );
		}
	} );
}

/**
 * Find nearest ancestor that forms a containing block for position:fixed.
 *
 * @param {HTMLElement|null} el
 * @return {HTMLElement|null} Containing block element or null.
 */
function getFixedContainingBlock( el ) {
	const win = el?.ownerDocument?.defaultView || window;
	let node = el?.parentElement || null;

	while ( node && node !== el.ownerDocument.documentElement ) {
		const style = win.getComputedStyle( node );
		const transform = style.transform;
		const filter = style.filter;
		const perspective = style.perspective;
		const contain = style.contain || '';
		const willChange = style.willChange || '';

		if (
			( transform && transform !== 'none' ) ||
			( filter && filter !== 'none' ) ||
			( perspective && perspective !== 'none' ) ||
			contain.split( ' ' ).includes( 'paint' ) ||
			willChange.includes( 'transform' )
		) {
			return node;
		}

		node = node.parentElement;
	}

	return null;
}

/**
 * @param {HTMLElement} el
 * @param {number}      top
 * @param {number}      left
 * @return {{ top: number, left: number }} Adjusted coordinates.
 */
function toContainingBlockCoords( el, top, left ) {
	const cb = getFixedContainingBlock( el );
	if ( ! cb ) {
		return { top, left };
	}
	const rect = cb.getBoundingClientRect();
	return {
		top: top - rect.top,
		left: left - rect.left,
	};
}

/**
 * @param {HTMLElement} item .blockish-block-navmenu-item
 */
export function positionNavmenuSubmenu( item ) {
	if ( ! item || ! item.isConnected ) {
		return;
	}

	const children = item.querySelector(
		':scope > .blockish-navmenu-item-children'
	);
	if ( ! children ) {
		return;
	}

	const win = item.ownerDocument.defaultView || window;
	const isFlyout = Boolean( item.closest( '.blockish-navmenu-submenu' ) );
	const itemRect = item.getBoundingClientRect();
	const vw = win.innerWidth;
	const vh = win.innerHeight;
	const depth = item.querySelectorAll(
		':scope .blockish-navmenu-item-children'
	).length;

	children.classList.add( 'is-submenu-positioned' );
	children.style.display = 'block';
	children.style.right = 'auto';
	children.style.bottom = 'auto';
	children.style.width = 'max-content';
	children.style.boxSizing = 'border-box';
	children.style.zIndex = String( 100000 + depth );
	children.style.paddingTop = '0';
	children.style.paddingRight = '0';
	children.style.paddingBottom = '0';
	children.style.paddingLeft = '0';

	if ( isFlyout ) {
		children.style.position = 'absolute';
		children.style.top = '0px';
		children.style.left = '100%';

		const parentSubmenu = item.closest( '.blockish-navmenu-submenu' );
		const parentRect = parentSubmenu
			? parentSubmenu.getBoundingClientRect()
			: itemRect;

		const panel =
			children.querySelector( ':scope > .blockish-navmenu-submenu' ) ||
			children;
		const panelRect = panel.getBoundingClientRect();
		const panelW = Math.max( panelRect.width || 0, 1 );
		const panelH = Math.max( panelRect.height || 0, 1 );

		// Check parent flyout placement if this item is nested inside another flyout.
		const parentFlyoutItem = parentSubmenu
			? parentSubmenu.closest( '.blockish-block-navmenu-item' )
			: null;
		const parentPlacementX = parentFlyoutItem?.querySelector(
			':scope > .blockish-navmenu-item-children'
		)?.dataset?.submenuPlacementX;

		const spaceRight = vw - parentRect.right - MARGIN;
		const spaceLeft = parentRect.left - MARGIN;
		let placementX = 'end';

		if ( parentPlacementX === 'end' ) {
			// If parent flyout opened to the right, continue cascade to the right
			// to avoid reversing back directly on top of parent/grandparent menus.
			placementX = 'end';
		} else if ( parentPlacementX === 'start' ) {
			// If parent flyout opened to the left, continue cascade to the left.
			placementX = 'start';
		} else if ( spaceRight < panelW && spaceLeft > spaceRight ) {
			// First-level flyout: prefer right, flip to left if insufficient room on right.
			placementX = 'start';
		} else {
			placementX = 'end';
		}

		if ( placementX === 'start' ) {
			const offsetRight = itemRect.right - parentRect.left;
			children.style.left = 'auto';
			children.style.right = `${ Math.round( offsetRight ) }px`;
			children.style.paddingLeft = '0';
			children.style.paddingRight = '0';
		} else {
			const offsetLeft = parentRect.right - itemRect.left;
			children.style.left = `${ Math.round( offsetLeft ) }px`;
			children.style.right = 'auto';
			children.style.paddingLeft = '0';
			children.style.paddingRight = '0';
		}

		let topOffset = 0;
		if ( itemRect.top + panelH > vh - MARGIN ) {
			topOffset = Math.min( 0, vh - MARGIN - panelH - itemRect.top );
		}
		if ( itemRect.top + topOffset < MARGIN ) {
			topOffset = MARGIN - itemRect.top;
		}
		children.style.top = `${ Math.round( topOffset ) }px`;

		children.dataset.submenuPlacementX = placementX;
		children.dataset.submenuPlacementY = 'below';
		item.classList.toggle(
			'is-submenu-flyout-start',
			placementX === 'start'
		);
		item.classList.toggle( 'is-submenu-flyout-end', placementX === 'end' );
		item.classList.remove(
			'is-submenu-drop-above',
			'is-submenu-drop-below'
		);
		return;
	}

	children.style.position = 'fixed';
	children.style.top = '0px';
	children.style.left = '0px';

	const panel =
		children.querySelector( ':scope > .blockish-navmenu-submenu' ) ||
		children;
	const panelRect = panel.getBoundingClientRect();
	const panelW = Math.max( panelRect.width || 0, 1 );
	const panelH = Math.max( panelRect.height || 0, 1 );

	let top = 0;
	let left = 0;
	let placementY = 'below';

	const need = panelH + BRIDGE;
	const spaceBelow = vh - itemRect.bottom - MARGIN;
	const spaceAbove = itemRect.top - MARGIN;

	if ( spaceBelow < need && spaceAbove > spaceBelow ) {
		placementY = 'above';
		top = itemRect.top - need;
		children.style.paddingBottom = `${ BRIDGE }px`;
	} else {
		placementY = 'below';
		top = itemRect.bottom;
		children.style.paddingTop = `${ BRIDGE }px`;
	}

	left = itemRect.left;
	if ( left + panelW > vw - MARGIN ) {
		left = Math.max( MARGIN, vw - MARGIN - panelW );
	}
	if ( left < MARGIN ) {
		left = MARGIN;
	}

	const wrapW = panelW + BRIDGE;
	if ( left + wrapW > vw - MARGIN ) {
		left = Math.max( MARGIN, vw - MARGIN - wrapW );
	}

	const coords = toContainingBlockCoords( children, top, left );
	children.style.top = `${ Math.round( coords.top ) }px`;
	children.style.left = `${ Math.round( coords.left ) }px`;

	children.dataset.submenuPlacementX = 'end';
	children.dataset.submenuPlacementY = placementY;
	item.classList.remove( 'is-submenu-flyout-start', 'is-submenu-flyout-end' );
	item.classList.toggle( 'is-submenu-drop-above', placementY === 'above' );
	item.classList.toggle( 'is-submenu-drop-below', placementY === 'below' );
}

/**
 * @param {HTMLElement} item
 */
export function clearNavmenuSubmenuPosition( item ) {
	if ( ! item ) {
		return;
	}

	const children = item.querySelector(
		':scope > .blockish-navmenu-item-children'
	);
	if ( children ) {
		children.classList.remove( 'is-submenu-positioned' );
		[
			'display',
			'position',
			'top',
			'left',
			'right',
			'bottom',
			'zIndex',
			'width',
			'minWidth',
			'boxSizing',
			'padding',
			'paddingTop',
			'paddingRight',
			'paddingBottom',
			'paddingLeft',
		].forEach( ( key ) => {
			children.style[ key ] = '';
		} );
		delete children.dataset.submenuPlacementX;
		delete children.dataset.submenuPlacementY;
	}

	item.classList.remove(
		'is-submenu-flyout-start',
		'is-submenu-flyout-end',
		'is-submenu-drop-above',
		'is-submenu-drop-below'
	);
}

/**
 * @param {HTMLElement} item
 */
export function scheduleNavmenuSubmenuPosition( item ) {
	if ( ! item ) {
		return;
	}
	positionNavmenuSubmenu( item );
	const win = item?.ownerDocument?.defaultView || window;
	win.requestAnimationFrame( () => {
		positionNavmenuSubmenu( item );
	} );
}
