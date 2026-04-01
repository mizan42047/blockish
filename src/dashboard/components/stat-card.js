import {
	Card,
	CardBody,
	Flex,
	FlexItem,
	Icon,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';

export default function StatCard({ icon, iconClass, value, label }) {
	return (
		<Card className="blockish-stat-card" size="small">
			<CardBody>
				<Flex justify="flex-start" align="center" gap={3}>
					<FlexItem>
						<span className={`blockish-stat-icon ${iconClass || ''}`}>
							<Icon icon={icon} />
						</span>
					</FlexItem>
					<FlexItem>
						<VStack spacing={1}>
							<Heading className="blockish-heading-secondary" level={3}>
								{value}
							</Heading>
							<Text className="blockish-text-muted">{label}</Text>
						</VStack>
					</FlexItem>
				</Flex>
			</CardBody>
		</Card>
	);
}
