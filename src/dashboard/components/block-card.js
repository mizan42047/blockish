import { __ } from '@wordpress/i18n';
import {
	Card,
	CardBody,
	Flex,
	FormToggle,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';

export default function BlockCard({ block, isSaving, onToggle }) {
	const isActive = block.status === 'active';

	return (
		<Card className={`blockish-block-card ${!isActive ? 'is-inactive' : ''}`} size="small">
			<CardBody>
				<VStack spacing={4}>
					<Flex justify="space-between" align="flex-start">
						<Heading className="blockish-block-card-title blockish-heading-tertiary" level={3}>
							{block.name}
						</Heading>
						<FormToggle
							className="blockish-block-toggle"
							checked={isActive}
							onChange={(event) => onToggle(block.slug, event.target.checked)}
						/>
					</Flex>
					<Text className="blockish-block-card-description blockish-text-muted">{block.description}</Text>
					<Flex justify="space-between" align="center">
						<Flex align="center" expanded={false} className="blockish-card-meta-left">
							<Text variant="muted">{block.categoryLabel}</Text>
							<Text className="blockish-addon-badge">{block.sourceName || __('Blockish', 'blockish')}</Text>
						</Flex>
						<Text className={`blockish-status-badge ${isActive ? 'is-active' : 'is-inactive'}`}>
							{isActive ? __('Active', 'blockish') : __('Inactive', 'blockish')}
						</Text>
					</Flex>
				</VStack>
			</CardBody>
		</Card>
	);
}
