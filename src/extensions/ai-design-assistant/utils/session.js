import { CHAT_SESSION_EVENT, CHAT_SESSION_KEY } from '../constants';

const dispatchSessionChange = (chatId = null) => {
	if (typeof window === 'undefined') {
		return;
	}

	window.dispatchEvent(
		new CustomEvent(CHAT_SESSION_EVENT, {
			detail: { chatId },
		})
	);
};

export const getSessionChatId = () => {
	if (typeof window === 'undefined') {
		return null;
	}

	return window.sessionStorage.getItem(CHAT_SESSION_KEY);
};

export const setSessionChatId = (chatId) => {
	if (typeof window === 'undefined') {
		return;
	}

	const nextChatId = `${chatId}`;
	window.sessionStorage.setItem(CHAT_SESSION_KEY, nextChatId);
	dispatchSessionChange(nextChatId);
};

export const clearSessionChatId = () => {
	if (typeof window === 'undefined') {
		return;
	}

	window.sessionStorage.removeItem(CHAT_SESSION_KEY);
	dispatchSessionChange(null);
};
