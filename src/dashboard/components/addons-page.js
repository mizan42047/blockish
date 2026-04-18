import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import { Card, CardBody, Flex, __experimentalHeading as Heading, __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';

function normalizeAddonName(item = {}) {
	return item?.addon_name || item?.source_name || '';
}

export default function AddonsPage({ blocks = {}, extensions = {} }) {
	const addons = useMemo(() => {
		const byName = new Map();

		Object.values(blocks || {}).forEach((item) => {
			if (!item || item.parent) return;
			const addonName = normalizeAddonName(item);
			if (!addonName || addonName === 'Blockish') return;
			if (!byName.has(addonName)) {
				byName.set(addonName, { name: addonName, blocks: 0, extensions: 0 });
			}
			byName.get(addonName).blocks += 1;
		});

		Object.values(extensions || {}).forEach((item) => {
			if (!item) return;
			const addonName = normalizeAddonName(item);
			if (!addonName || addonName === 'Blockish') return;
			if (!byName.has(addonName)) {
				byName.set(addonName, { name: addonName, blocks: 0, extensions: 0 });
			}
			byName.get(addonName).extensions += 1;
		});

		return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
	}, [blocks, extensions]);

	return (
		<VStack className="blockish-blocks-page" spacing={5}>
			<VStack spacing={1}>
				<Heading className="blockish-heading-primary" level={1}>
					{__('Addons', 'blockish')}
				</Heading>
				<Text className="blockish-text-muted">
					{sprintf(__('Detected %d addon(s) integrated with Blockish.', 'blockish'), addons.length)}
				</Text>
			</VStack>

			{addons.length === 0 && (
				<section className="blockish-panel">
					<Text className="blockish-text-muted">
						{__('No external addons detected yet. Activate an addon plugin to see it here.', 'blockish')}
					</Text>
				</section>
			)}

			<div className="blockish-block-grid">
				{addons.map((addon) => (
					<Card key={addon.name} className="blockish-block-card" size="small">
						<CardBody>
							<VStack spacing={3}>
								<Heading className="blockish-block-card-title blockish-heading-tertiary" level={3}>
									{addon.name}
								</Heading>
								<Flex justify="space-between" align="center">
									<Text className="blockish-text-muted">
										{sprintf(__('%d block(s)', 'blockish'), addon.blocks)}
									</Text>
									<Text className="blockish-text-muted">
										{sprintf(__('%d extension(s)', 'blockish'), addon.extensions)}
									</Text>
								</Flex>
							</VStack>
						</CardBody>
					</Card>
				))}
			</div>
		</VStack>
	);
}
