import ClassManagerSettings from './class-manager-settings';
import DefaultExtensionSettings from './default-extension-settings';

export function getExtensionSettingsComponent(slug) {
	if (slug === 'class-manager') {
		return ClassManagerSettings;
	}

	return DefaultExtensionSettings;
}
