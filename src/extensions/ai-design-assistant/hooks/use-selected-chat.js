import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { CHAT_POST_TYPE, CHAT_SESSION_EVENT } from '../constants';
import { getSessionChatId } from '../utils/session';
const useSelectedChat = () => {
	const [ selectedChatId, setSelectedChatId ] = useState( () => getSessionChatId() );

	useEffect( () => {
		const syncFromStorage = () => {
			setSelectedChatId( getSessionChatId() );
		};

		const handleSessionChange = (event) => {
			const nextChatId = event?.detail?.chatId ?? getSessionChatId();
			setSelectedChatId( nextChatId ? `${ nextChatId }` : null );
		};

		syncFromStorage();
		window.addEventListener( 'storage', syncFromStorage );
		window.addEventListener( CHAT_SESSION_EVENT, handleSessionChange );

		return () => {
			window.removeEventListener( 'storage', syncFromStorage );
			window.removeEventListener( CHAT_SESSION_EVENT, handleSessionChange );
		};
	}, [] );

	const selectedChat = useSelect(
		( select ) => {
			if ( ! selectedChatId ) {
				return null;
			}

			const { getEditedEntityRecord, getEntityRecord } = select( 'core' );
			const parsedId = Number( selectedChatId );
			const chatId = Number.isNaN( parsedId ) ? selectedChatId : parsedId;
			const record = getEntityRecord( 'postType', CHAT_POST_TYPE, chatId );

			return (
				getEditedEntityRecord( 'postType', CHAT_POST_TYPE, chatId ) ||
				record ||
				null
			);
		},
		[ selectedChatId ]
	);

	return selectedChat;
};

export default useSelectedChat;
