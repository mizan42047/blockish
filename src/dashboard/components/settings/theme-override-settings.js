import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import {
	Button,
	Card,
	CardBody,
	Flex,
	Modal,
	SelectControl,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { settingsIcon } from '../../utils';
import { THEME_OVERRIDE_MAX } from '../../../helpers/theme-override';

const LEVEL_OPTIONS = [
	{ label: __( 'Off (0) — lightest CSS', 'blockish' ), value: '0' },
	...Array.from( { length: THEME_OVERRIDE_MAX }, ( _, index ) => {
		const level = index + 1;
		const label =
			level === THEME_OVERRIDE_MAX
				? __( 'Level 4 — strongest', 'blockish' )
				: `${ __( 'Level', 'blockish' ) } ${ level }`;
		return { label, value: String( level ) };
	} ),
];

export default function ThemeOverrideSettings( {
	themeOverrideSettings,
	isLoading,
	isSaving,
	onUpdateThemeOverrideSettings,
} ) {
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ level, setLevel ] = useState( '0' );

	useEffect( () => {
		if ( themeOverrideSettings?.global_theme_override_level !== undefined ) {
			setLevel( String( themeOverrideSettings.global_theme_override_level ) );
		}
	}, [ themeOverrideSettings ] );

	const handleSave = () => {
		onUpdateThemeOverrideSettings?.( {
			global_theme_override_level: parseInt( level, 10 ) || 0,
		} );
		setIsModalOpen( false );
	};

	const currentLabel =
		LEVEL_OPTIONS.find( ( option ) => option.value === String( themeOverrideSettings?.global_theme_override_level ?? 0 ) )?.label
		|| LEVEL_OPTIONS[ 0 ].label;

	return (
		<>
			<Card className="blockish-block-card" size="small">
				<CardBody>
					<Flex justify="space-between" align="flex-start">
						<div>
							<Heading className="blockish-block-card-title blockish-heading-tertiary" level={ 3 }>
								{ __( 'Theme override strength', 'blockish' ) }
							</Heading>
							<Text className="blockish-block-card-description blockish-text-muted">
								{ __( 'Site default when blocks use “Inherit”. Helps Blockish CSS win over aggressive theme selectors.', 'blockish' ) }
							</Text>
							<Text className="blockish-text-muted" style={ { marginTop: '8px', fontSize: '12px' } }>
								{ __( 'Current:', 'blockish' ) } { currentLabel }
							</Text>
						</div>
						<Button
							className="blockish-configure-icon-button"
							variant="tertiary"
							icon={ settingsIcon }
							label={ __( 'Configure theme override', 'blockish' ) }
							onClick={ () => setIsModalOpen( true ) }
							showTooltip
						/>
					</Flex>
				</CardBody>
			</Card>

			{ isModalOpen && (
				<Modal
					title={ __( 'Theme override strength', 'blockish' ) }
					onRequestClose={ () => setIsModalOpen( false ) }
					className="blockish-modal"
				>
					<VStack spacing={ 4 }>
						<SelectControl
							label={ __( 'Site default level', 'blockish' ) }
							help={ __(
								'Level 0: .bb-xxx.blockish-block-wrapper only. Level 1+ adds body + bb-nested-* classes. Override per block in Advanced → Theme override strength.',
								'blockish'
							) }
							value={ level }
							options={ LEVEL_OPTIONS }
							onChange={ setLevel }
							disabled={ isLoading || isSaving }
						/>
						<Flex justify="flex-end" gap={ 2 }>
							<Button variant="secondary" onClick={ () => setIsModalOpen( false ) }>
								{ __( 'Cancel', 'blockish' ) }
							</Button>
							<Button variant="primary" onClick={ handleSave } isBusy={ isSaving }>
								{ __( 'Save', 'blockish' ) }
							</Button>
						</Flex>
					</VStack>
				</Modal>
			) }
		</>
	);
}
