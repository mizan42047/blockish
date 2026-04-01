import apiFetch from '@wordpress/api-fetch';
import { createReduxStore, register } from '@wordpress/data';
import { buildStats } from '../utils';

export const STORE_NAME = 'blockish/dashboard';

const DEFAULT_MENU = 'dashboard';

const DEFAULT_STATE = {
	activeMenu: DEFAULT_MENU,
	isLoading: false,
	isSaving: false,
	data: {
		plugin: {},
		stats: {},
		blocks: {},
		extensions: {},
		devices: [],
		icons: {},
	},
	error: null,
};

const actions = {
	setActiveMenu(menu) {
		return {
			type: 'SET_ACTIVE_MENU',
			menu,
		};
	},
	startLoading() {
		return {
			type: 'START_LOADING',
		};
	},
	finishLoading(data) {
		return {
			type: 'FINISH_LOADING',
			data,
		};
	},
	setError(error) {
		return {
			type: 'SET_ERROR',
			error,
		};
	},
	updateModuleStatus(moduleType, slug, status) {
		return {
			type: 'UPDATE_MODULE_STATUS',
			moduleType,
			slug,
			status,
		};
	},
	updateModuleSettings(moduleType, slug, settings) {
		return {
			type: 'UPDATE_MODULE_SETTINGS',
			moduleType,
			slug,
			settings,
		};
	},
	startSaving() {
		return {
			type: 'START_SAVING',
		};
	},
	finishSaving(data) {
		return {
			type: 'FINISH_SAVING',
			data,
		};
	},
	*loadDashboard() {
		yield actions.startLoading();

		try {
			const blocksPath = window?.blockishDashboardData?.blocksApiPath || '/blockish/v1/blocks';
			const extensionsPath = window?.blockishDashboardData?.extensionsApiPath || '/blockish/v1/extensions';

			const blocksResponse = yield {
				type: 'API_FETCH',
				request: {
					path: blocksPath,
					method: 'GET',
				},
			};

			const extensionsResponse = yield {
				type: 'API_FETCH',
				request: {
					path: extensionsPath,
					method: 'GET',
				},
			};

			yield actions.finishLoading({
				plugin: window?.blockishDashboardData?.plugin || {},
				blocks: blocksResponse?.blocks || {},
				extensions: extensionsResponse?.extensions || {},
				stats: {
					blocks: buildStats(blocksResponse?.blocks || {}, { ignoreChildBlocks: true }),
					extensions: buildStats(extensionsResponse?.extensions || {}),
				},
			});
		} catch (error) {
			yield actions.setError(error?.message || 'Failed to load dashboard data');
		}
	},
	*saveDashboard(payload = {}) {
		yield actions.startSaving();

		try {
			const blocksPath = window?.blockishDashboardData?.blocksApiPath || '/blockish/v1/blocks';
			const extensionsPath = window?.blockishDashboardData?.extensionsApiPath || '/blockish/v1/extensions';

			const blocksResponse = yield {
				type: 'API_FETCH',
				request: {
					path: blocksPath,
					method: 'POST',
					data: {
						blocks: payload.blocks || {},
					},
				},
			};

			const extensionsResponse = yield {
				type: 'API_FETCH',
				request: {
					path: extensionsPath,
					method: 'POST',
					data: {
						extensions: payload.extensions || {},
					},
				},
			};

			yield actions.finishSaving({
				blocks: blocksResponse?.blocks || payload.blocks || {},
				extensions: extensionsResponse?.extensions || payload.extensions || {},
				stats: {
					blocks: buildStats(blocksResponse?.blocks || payload.blocks || {}, {
						ignoreChildBlocks: true,
					}),
					extensions: buildStats(extensionsResponse?.extensions || payload.extensions || {}),
				},
			});
		} catch (error) {
			yield actions.setError(error?.message || 'Failed to save dashboard data');
		}
	},
};

function reducer(state = DEFAULT_STATE, action) {
	switch (action.type) {
		case 'SET_ACTIVE_MENU':
			return {
				...state,
				activeMenu: action.menu,
			};
		case 'START_LOADING':
			return {
				...state,
				isLoading: true,
				error: null,
			};
		case 'FINISH_LOADING':
			return {
				...state,
				isLoading: false,
				data: {
					...state.data,
					...(action.data || {}),
				},
			};
		case 'SET_ERROR':
			return {
				...state,
				isLoading: false,
				isSaving: false,
				error: action.error,
			};
		case 'UPDATE_MODULE_STATUS': {
			const key = action.moduleType;
			const moduleItems = state.data?.[key] || {};
			const item = moduleItems[action.slug];

			if (!item) {
				return state;
			}

			return {
				...state,
				data: {
					...state.data,
					[key]: {
						...moduleItems,
						[action.slug]: {
							...item,
							status: action.status,
						},
					},
				},
			};
		}
		case 'UPDATE_MODULE_SETTINGS': {
			const key = action.moduleType;
			const moduleItems = state.data?.[key] || {};
			const item = moduleItems[action.slug];

			if (!item) {
				return state;
			}

			return {
				...state,
				data: {
					...state.data,
					[key]: {
						...moduleItems,
						[action.slug]: {
							...item,
							settings: {
								...(item.settings || {}),
								...(action.settings || {}),
							},
						},
					},
				},
			};
		}
		case 'START_SAVING':
			return {
				...state,
				isSaving: true,
				error: null,
			};
		case 'FINISH_SAVING':
			return {
				...state,
				isSaving: false,
				data: {
					...state.data,
					...(action.data || {}),
				},
			};
		default:
			return state;
	}
}

const selectors = {
	getActiveMenu(state) {
		return state.activeMenu;
	},
	isLoading(state) {
		return state.isLoading;
	},
	isSaving(state) {
		return state.isSaving;
	},
	getError(state) {
		return state.error;
	},
	getDashboardData(state) {
		return state.data;
	},
	getBlocks(state) {
		return state.data?.blocks || {};
	},
	getExtensions(state) {
		return state.data?.extensions || {};
	},
	getDevices(state) {
		return state.data?.devices || [];
	},
	getStats(state) {
		return state.data?.stats || {};
	},
};

const controls = {
	API_FETCH({ request }) {
		return apiFetch(request);
	},
};

const store = createReduxStore(STORE_NAME, {
	reducer,
	actions,
	selectors,
	controls,
});

register(store);

export default store;
