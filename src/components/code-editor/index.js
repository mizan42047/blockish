import { BaseControl, TextareaControl } from '@wordpress/components';
import { useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const BlockishCodeEditor = ( {
    label = __( 'Code Editor', 'blockish' ),
    value = '',
    onChange,
    settings = {},
    help = '',
    rows = 8,
    ...props
} ) => {
    const containerRef = useRef( null );
    const textareaRef = useRef( null );
    const editorRef = useRef( null );
    const lastEditorValueRef = useRef( value || '' );

    useEffect( () => {
        if ( ! textareaRef.current && containerRef.current ) {
            textareaRef.current = containerRef.current.querySelector( 'textarea' );
        }

        if ( editorRef.current || ! window?.wp?.codeEditor || ! textareaRef.current ) {
            return;
        }

        const {
            extraKeys: providedExtraKeys = {},
            hintOptions: providedHintOptions = {},
            ...restSettings
        } = settings || {};

        const CodeMirrorGlobal = window?.CodeMirror;
        const resolvedHintProvider =
            CodeMirrorGlobal?.hint?.css ||
            CodeMirrorGlobal?.hint?.anyword ||
            null;
        const repositionHintDropdown = () => {
            const hintLists = document.querySelectorAll( '.CodeMirror-hints' );
            const hintEl = hintLists?.[ hintLists.length - 1 ];
            if ( !hintEl ) {
                return;
            }

            const rect = hintEl.getBoundingClientRect();
            const viewportPadding = 8;

            // If popup overflows to the right, open it to the opposite side.
            if ( rect.right > window.innerWidth - viewportPadding ) {
                const currentLeft = Number.parseFloat( hintEl.style.left || `${ rect.left }` );
                const flippedLeft = currentLeft - rect.width - 12;
                hintEl.style.left = `${ Math.max( viewportPadding, flippedLeft ) }px`;
            }
        };
        const autocompleteKeyHandler = (instance) => {
            if ( !instance?.showHint ) {
                return;
            }

            instance.showHint( {
                hint: resolvedHintProvider || undefined,
                completeSingle: false,
            } );

            requestAnimationFrame( repositionHintDropdown );
        };

        const editor = window.wp.codeEditor.initialize( textareaRef.current, {
            codemirror: {
                lineNumbers: true,
                indentUnit: 4,
                tabSize: 4,
                autoCloseBrackets: true,
                matchBrackets: true,
                extraKeys: {
                    'Ctrl-Space': autocompleteKeyHandler,
                    ...providedExtraKeys,
                },
                hintOptions: {
                    completeSingle: false,
                    ...providedHintOptions,
                },
                ...restSettings,
            },
        } );

        const codeMirror = editor?.codemirror;
        if ( ! codeMirror ) {
            return;
        }

        editorRef.current = editor;

        codeMirror.on( 'change', ( instance ) => {
            const nextValue = instance.getValue();
            lastEditorValueRef.current = nextValue;

            if ( typeof onChange === 'function' ) {
                onChange( nextValue );
            }
        } );

        return () => {
            if ( editorRef.current?.codemirror ) {
                editorRef.current.codemirror.toTextArea();
            }
            editorRef.current = null;
        };
    }, [] );

    useEffect( () => {
        if ( ! editorRef.current?.codemirror ) {
            return;
        }

        const nextValue = value || '';
        if ( nextValue === lastEditorValueRef.current ) {
            return;
        }

        const currentValue = editorRef.current.codemirror.getValue();
        if ( currentValue !== nextValue ) {
            editorRef.current.codemirror.setValue( nextValue );
        }
        lastEditorValueRef.current = nextValue;
    }, [ value ] );

    return (
        <div className="blockish-control blockish-code-editor" ref={ containerRef }>
            <BaseControl
                __nextHasNoMarginBottom
                label={ label }
                help={ help }
            >
                <TextareaControl
                    __nextHasNoMarginBottom
                    value={ value || '' }
                    onChange={ onChange }
                    rows={ rows }
                    ref={ textareaRef }
                    className="blockish-code-editor-textarea"
                    { ...props }
                />
            </BaseControl>
        </div>
    );
};

export default BlockishCodeEditor;
