import { __ } from '@wordpress/i18n';
import DashboardHome from './dashboard-home';
import BlocksPage from './blocks-page';
import ExtensionsPage from './extensions-page';
import PlaceholderSection from './placeholder-section';

export default function ContentArea({
	activeMenu,
	data,
	isSaving,
	onNavigate,
	onToggleBlock,
	onSetAllBlockStatus,
	onToggleExtension,
	onSetAllExtensionStatus,
	onSaveExtensionSettings,
}) {
	if (activeMenu === 'dashboard') {
		return <DashboardHome data={data} onNavigate={onNavigate} />;
	}

	if (activeMenu === 'blocks') {
		return (
			<BlocksPage
				blocks={data?.blocks}
				isSaving={isSaving}
				onToggleBlock={onToggleBlock}
				onSetAllBlockStatus={onSetAllBlockStatus}
			/>
		);
	}

	if (activeMenu === 'settings') {
		return (
			<PlaceholderSection
				title={__('Settings', 'blockish')}
				description={__('General dashboard settings will appear here.', 'blockish')}
			/>
		);
	}

	if (activeMenu === 'extensions') {
		return (
			<ExtensionsPage
				extensions={data?.extensions}
				isSaving={isSaving}
				onToggleExtension={onToggleExtension}
				onSetAllExtensionStatus={onSetAllExtensionStatus}
				onSaveExtensionSettings={onSaveExtensionSettings}
			/>
		);
	}

	if (activeMenu === 'integrations') {
		return (
			<PlaceholderSection
				title={__('Integrations', 'blockish')}
				description={__('Manage third-party service connections and sync status.', 'blockish')}
			/>
		);
	}

	if (activeMenu === 'addons') {
		return (
			<PlaceholderSection
				title={__('Addons', 'blockish')}
				description={__('Browse and activate additional modules for Blockish.', 'blockish')}
			/>
		);
	}

	return (
		<PlaceholderSection
			title={__('License', 'blockish')}
			description={__('Manage your license key and update eligibility.', 'blockish')}
		/>
	);
}
