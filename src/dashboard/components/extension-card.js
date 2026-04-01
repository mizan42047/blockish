import { __ } from '@wordpress/i18n';
import {
	Button,
	Card,
	CardBody,
	Flex,
	FormToggle,
	Icon,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { settingsIcon } from '../../components/icons/block-icons';

export default function ExtensionCard({ extension, isSaving, onToggle, onOpenSettings }) {
	const isActive = extension.status === 'active';

	return (
		<Card className={`blockish-block-card ${!isActive ? 'is-inactive' : ''}`} size="small">
			<CardBody>
				<VStack spacing={4}>
					<Flex justify="space-between" align="flex-start">
						<Heading className="blockish-block-card-title blockish-heading-tertiary" level={3}>
							{extension.name}
						</Heading>
						<FormToggle
							className="blockish-block-toggle"
							checked={isActive}
							onChange={(event) => onToggle(extension.slug, event.target.checked)}
						/>
					</Flex>
					<Text className="blockish-block-card-description blockish-text-muted">
						{extension.description}
					</Text>
					<Flex justify="space-between" align="center">
						<Text variant="muted">{extension.packageLabel}</Text>
						<Text className={`blockish-status-badge ${isActive ? 'is-active' : 'is-inactive'}`}>
							{isActive ? __('Active', 'blockish') : __('Inactive', 'blockish')}
						</Text>
					</Flex>
					{extension.hasSpecialControls && isActive && (
						<Button
							className="blockish-action-button is-secondary blockish-button-base blockish-button-secondary"
							variant="secondary"
							onClick={() => onOpenSettings(extension.slug)}
							disabled={isSaving}
						>
							<Icon icon={settingsIcon} />
							{__('Configure', 'blockish')}
						</Button>
					)}
				</VStack>
			</CardBody>
		</Card>
	);
}
