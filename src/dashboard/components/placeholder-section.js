import { __experimentalHeading as Heading, __experimentalText as Text } from '@wordpress/components';

export default function PlaceholderSection({ title, description }) {
	return (
		<section className="blockish-panel">
			<Heading className="blockish-heading-secondary" level={2}>
				{title}
			</Heading>
			<Text className="blockish-text-muted">{description}</Text>
		</section>
	);
}
