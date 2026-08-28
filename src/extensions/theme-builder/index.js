/**
 * Theme Builder extension entry.
 * `screen`: library (list UI) | editor (template/part canvas).
 */
import './editor.scss';
import { mountLibrary } from './library';
import { mountEditor } from './editor';

const config = window.blockishThemeBuilder || {};

if ( config.screen === 'library' ) {
	mountLibrary();
} else if ( config.screen === 'editor' ) {
	mountEditor();
}
