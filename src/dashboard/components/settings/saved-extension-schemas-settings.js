import { __, sprintf } from '@wordpress/i18n';
import { useMemo, useState } from '@wordpress/element';
import {
	Button,
	Card,
	CardBody,
	Flex,
	Modal,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { settingsIcon } from '../../../components/icons/block-icons';

export default function SavedExtensionSchemasSettings({
	schemas,
	isLoading,
	isSaving,
	onCleanupSchema,
}) {
	const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
	const [schemaSearch, setSchemaSearch] = useState('');

	const filteredSchemas = useMemo(() => {
		const q = schemaSearch.trim().toLowerCase();
		if (!q) return schemas?.items || [];
		return (schemas?.items || []).filter((item) =>
			`${item?.slug || ''} ${item?.name || ''}`.toLowerCase().includes(q)
		);
	}, [schemaSearch, schemas]);

	return (
		<>
			<Card className="blockish-block-card" size="small">
				<CardBody>
					<VStack spacing={4}>
						<Flex justify="space-between" align="flex-start">
							<div>
								<Heading className="blockish-block-card-title blockish-heading-tertiary" level={3}>
									{__('Saved Extension Schemas', 'blockish')}
								</Heading>
								<Text className="blockish-block-card-description blockish-text-muted">
									{sprintf(__('Total saved schemas: %d', 'blockish'), schemas?.count || 0)}
								</Text>
							</div>
							<Button
								className="blockish-configure-icon-button"
								variant="tertiary"
								icon={settingsIcon}
								label={__('Manage schemas', 'blockish')}
								showTooltip
								disabled={isLoading}
								onClick={() => setIsSchemaModalOpen(true)}
							/>
						</Flex>
					</VStack>
				</CardBody>
			</Card>

			{isSchemaModalOpen && (
				<Modal
					title={__('Saved Extension Schemas', 'blockish')}
					className="blockish-configure-modal blockish-schemas-modal"
					onRequestClose={() => setIsSchemaModalOpen(false)}
				>
					<VStack className="blockish-modal-controls blockish-schemas-modal-content" spacing={4}>
						<Text className="blockish-schemas-modal-description">
							{__('Review saved schema sources and clean up what you no longer need', 'blockish')}
						</Text>
						<Flex className="blockish-schemas-modal-toolbar" justify="space-between" align="center">
							<div className="blockish-schemas-modal-search">
								<span className="blockish-schemas-modal-search-icon" aria-hidden="true">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<circle cx="11" cy="11" r="7" />
										<path d="M20 20l-3.5-3.5" />
									</svg>
								</span>
								<input
									className="blockish-schemas-modal-search-input"
									type="search"
									placeholder={__('Search schemas...', 'blockish')}
									value={schemaSearch}
									onChange={(event) => setSchemaSearch(event.target.value)}
								/>
							</div>
							{(schemas?.count || 0) > 0 && (
								<Button
									className="blockish-schemas-modal-cleanup-all"
									variant="secondary"
									disabled={isSaving || isLoading}
									onClick={() => onCleanupSchema({ all: true })}
								>
									{__('Cleanup All', 'blockish')}
								</Button>
							)}
						</Flex>
						<div className="blockish-settings-list blockish-schemas-modal-list">
							{filteredSchemas.map((item) => (
								<Flex
									key={item.slug}
									className="blockish-settings-row blockish-schemas-modal-row"
									justify="space-between"
									align="center"
								>
									<div className="blockish-settings-row-content blockish-schemas-modal-row-content">
										<Heading className="blockish-heading-tertiary blockish-settings-row-title" level={3}>
											{item?.name || item?.slug}
										</Heading>
									</div>
									<Flex className="blockish-schemas-modal-row-actions" align="center">
										<Text className="blockish-schemas-modal-attr-pill">
											{sprintf(
												Number(item?.attributeCount || 0) === 1
													? __('%d attribute', 'blockish')
													: __('%d attributes', 'blockish'),
												Number(item?.attributeCount || 0)
											)}
										</Text>
										<Button
											className="blockish-schemas-modal-row-clean"
											variant="secondary"
											disabled={isSaving || isLoading}
											onClick={() => onCleanupSchema({ slug: item.slug })}
										>
											{__('Clean Up', 'blockish')}
										</Button>
									</Flex>
								</Flex>
							))}
							{!isLoading && filteredSchemas.length === 0 && (
								<Text className="blockish-schemas-modal-empty">
									{schemaSearch.trim()
										? __('No schemas found matching your search', 'blockish')
										: __('No saved schemas', 'blockish')}
								</Text>
							)}
						</div>
					</VStack>
				</Modal>
			)}
		</>
	);
}
