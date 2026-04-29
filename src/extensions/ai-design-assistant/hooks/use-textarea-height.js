import { useEffect } from '@wordpress/element';
const useTextareaHeight = ( textareaRef, value = '' ) => {
	useEffect( () => {
		const textarea = textareaRef?.current;
		if ( ! textarea ) {
			return;
		}

		textarea.style.height = 'auto';
		const nextHeight = Math.min( textarea.scrollHeight, 180 );
		textarea.style.height = `${ nextHeight }px`;
	}, [ textareaRef, value ] );

	return textareaRef;
};

export default useTextareaHeight;
