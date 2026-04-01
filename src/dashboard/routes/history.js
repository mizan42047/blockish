import { createBrowserHistory } from 'history';
import { buildHistoryUrl } from '../utils';

// Create a browser history object
const history = createBrowserHistory();

// Custom push and replace functions to manage WordPress admin URL structure
const originalHistoryPush = history.push;
const originalHistoryReplace = history.replace;

function push(params, state) {
    const newUrl = buildHistoryUrl(params);
    return originalHistoryPush.call(history, newUrl, state);
}

function replace(params, state) {
    const newUrl = buildHistoryUrl(params);
    return originalHistoryReplace.call(history, newUrl, state);
}

history.push = push;
history.replace = replace;

export default history;
