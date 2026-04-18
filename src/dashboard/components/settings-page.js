import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __experimentalHeading as Heading, __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import SavedExtensionSchemasSettings from './settings/saved-extension-schemas-settings';

export default function SettingsPage() {
	const toolsPath = window?.blockishDashboardData?.dashboardToolsApiPath || '/blockish/v1/dashboard-tools';
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState('');
	const [schemas, setSchemas] = useState({ count: 0, items: [] });

	const loadToolsData = async () => {
		setIsLoading(true);
		setError('');
		try {
			const response = await apiFetch({ path: toolsPath, method: 'GET' });
			setSchemas(response?.schemas || { count: 0, items: [] });
		} catch (err) {
			setError(err?.message || __('Failed to load settings data', 'blockish'));
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadToolsData();
	}, []);

	const cleanupSchema = async ({ all = false, slug = '' } = {}) => {
		setIsSaving(true);
		setError('');
		try {
			const response = await apiFetch({
				path: `${toolsPath}/schemas/cleanup`,
				method: 'POST',
				data: { all, slug },
			});
			setSchemas(response?.schemas || { count: 0, items: [] });
		} catch (err) {
			setError(err?.message || __('Failed to cleanup schemas', 'blockish'));
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<VStack className="blockish-settings-page" spacing={6}>
			<header className="blockish-page-header">
				<Heading className="blockish-heading-primary" level={1}>
					{__('Settings', 'blockish')}
				</Heading>
				<Text className="blockish-text-muted">
					{__('Manage saved extension schemas from a single place.', 'blockish')}
				</Text>
			</header>

			{error && <Text className="blockish-error">{error}</Text>}

			<SavedExtensionSchemasSettings
				schemas={schemas}
				isLoading={isLoading}
				isSaving={isSaving}
				onCleanupSchema={cleanupSchema}
			/>
		</VStack>
	);
}
