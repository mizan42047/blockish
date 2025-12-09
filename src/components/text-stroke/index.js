import {
    __experimentalHStack as HStack,
    __experimentalHeading as Heading,
    __experimentalUnitControl as UnitControl,
    ColorPalette
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const BlockishTextStroke = ({ value, onChange, label = __('Text Stroke', 'blockish'), ...props }) => {
    // Safely parse the value - handle empty strings and undefined
    let usableTextStroke;
    try {
        usableTextStroke = (value && value !== '') ? (typeof value === 'string' ? JSON.parse(value) : value) : { width: '0px', color: '#000000' };
    } catch (e) {
        usableTextStroke = { width: '0px', color: '#000000' };
    }
    
    return (
        <div className="blockish-text-stroke blockish-control blockish-group-control">
            <div className="components-tools-panel">
                <HStack>
                    <Heading level={5}>{label}</Heading>
                </HStack>
                <div className="blockish-text-stroke-controls">
                    <UnitControl
                        label={__('Width', 'blockish')}
                        value={usableTextStroke?.width || '0px'}
                        onChange={(nextValue) => {
                            const newStroke = { ...usableTextStroke, width: nextValue };
                            onChange(JSON.stringify(newStroke));
                        }}
                        min={0}
                        max={10}
                    />
                    <ColorPalette
                        value={usableTextStroke?.color || '#000000'}
                        enableAlpha={true}
                        onChange={(newValue) => {
                            const newStroke = { ...usableTextStroke, color: newValue };
                            onChange(JSON.stringify(newStroke));
                        }}
                        clearable={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default BlockishTextStroke;
