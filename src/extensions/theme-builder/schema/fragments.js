/**
 * Theme Builder template chrome + post grid loop.
 *
 * Exact Blog Home design from MCP post 4288 — core/query only, no Dynamicity swap.
 */

import queryLoopBlock from './templates/query-loop.json';

const FLEX_COLUMN = {
	Desktop: { label: 'Column', value: 'column' },
};

/** Card block from post 4288 query loop. */
export const LOOP_CARD =
	queryLoopBlock.innerBlocks[ 0 ].innerBlocks[ 0 ];

/**
 * @param {Array} mainInnerBlocks Blocks inside <main>.
 * @param {{ mainMargin?: boolean }} [options]
 * @return {Array} Root block_schema
 */
export function wrapChrome( mainInnerBlocks = [], options = {} ) {
	const { mainMargin = true } = options;

	const mainAttributes = {
		isVariationPicked: true,
		tagName: { label: 'Main', value: 'main' },
		flexDirection: FLEX_COLUMN,
	};

	if ( mainMargin ) {
		mainAttributes.margin = {
			Desktop: {
				top: 'var:preset|spacing|60',
				right: '0',
				bottom: '0',
				left: '0',
			},
		};
	}

	return [
		{
			name: 'blockish/template-part',
			attributes: { area: 'header' },
		},
		{
			name: 'blockish/container',
			attributes: mainAttributes,
			innerBlocks: Array.isArray( mainInnerBlocks )
				? mainInnerBlocks
				: [],
		},
		{
			name: 'blockish/template-part',
			attributes: { area: 'footer' },
		},
	];
}

/**
 * @param {Object} node
 * @return {Object}
 */
function cloneBlock( node ) {
	return JSON.parse( JSON.stringify( node ) );
}

/**
 * core/query loop — Blog Home (post 4288).
 *
 * @param {{ inherit?: boolean, perPage?: number }} options
 * @return {Object}
 */
export function createQueryLoop( {
	inherit = true,
	perPage = 10,
} = {} ) {
	const block = cloneBlock( queryLoopBlock );
	block.attributes.query.inherit = inherit;
	block.attributes.query.perPage = perPage;
	return block;
}

/** @deprecated Use createQueryLoop() */
export const QUERY_LOOP = createQueryLoop();
