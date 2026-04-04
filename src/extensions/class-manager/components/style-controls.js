import { TabPanel, Panel, PanelBody, __experimentalVStack as VStack, TextControl, SelectControl, RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import {
    fontWeightOptions,
    overflowOptions,
    whiteSpaceOptions,
    displayOptions,
    positionOptions,
    floatOptions,
    clearOptions,
    verticalAlignOptions,
} from '../utils';

const EMPTY_STYLE = {
    typography: {},
    colors: {},
    layout: {},
    display: '',
    positioning: {},
    overflow: {},
};

const toSelectOptions = (options = []) => {
    return options.map((item) => ({
        label: item?.label || item?.value || '',
        value: item?.value || '',
    }));
};

const updateNested = (value, path, nextValue) => {
    const keys = path.split('.');
    const next = { ...(value || EMPTY_STYLE) };

    let cursor = next;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        cursor[key] = { ...(cursor[key] || {}) };
        cursor = cursor[key];
    }
    cursor[keys[keys.length - 1]] = nextValue;

    return next;
};

const StyleControls = ({ value = {}, onChange }) => {
    const safeValue = useMemo(() => ({ ...EMPTY_STYLE, ...(value || {}) }), [value]);

    const displayTypeOptions = useMemo(() => toSelectOptions(displayOptions), []);
    const fontWeightSelectOptions = useMemo(() => toSelectOptions(fontWeightOptions), []);
    const overflowSelectOptions = useMemo(() => toSelectOptions(overflowOptions), []);
    const whiteSpaceSelectOptions = useMemo(() => toSelectOptions(whiteSpaceOptions), []);
    const positionSelectOptions = useMemo(() => toSelectOptions(positionOptions), []);
    const floatSelectOptions = useMemo(() => toSelectOptions(floatOptions), []);
    const clearSelectOptions = useMemo(() => toSelectOptions(clearOptions), []);
    const verticalAlignSelectOptions = useMemo(() => toSelectOptions(verticalAlignOptions), []);

    return (
        <TabPanel
            className="blockish-class-manager-tab-panel"
            tabs={[
                { name: 'style', title: __('Style', 'blockish') },
                { name: 'advanced', title: __('Advanced', 'blockish') },
            ]}
        >
            {(tab) => {
                if (tab.name === 'style') {
                    return (
                        <Panel>
                            <PanelBody title={__('Typography', 'blockish')} initialOpen={false}>
                                <VStack>
                                    <TextControl
                                        label={__('Font Family', 'blockish')}
                                        value={safeValue?.typography?.fontFamily || ''}
                                        onChange={(newValue) => onChange(updateNested(safeValue, 'typography.fontFamily', newValue))}
                                    />
                                    <SelectControl
                                        label={__('Font Weight', 'blockish')}
                                        value={safeValue?.typography?.fontWeight || ''}
                                        options={fontWeightSelectOptions}
                                        onChange={(newValue) => onChange(updateNested(safeValue, 'typography.fontWeight', newValue))}
                                    />
                                    <RangeControl
                                        label={__('Font Size', 'blockish')}
                                        value={Number(safeValue?.typography?.fontSize || 16)}
                                        min={0}
                                        max={200}
                                        onChange={(newValue) => onChange(updateNested(safeValue, 'typography.fontSize', newValue))}
                                    />
                                </VStack>
                            </PanelBody>

                            <PanelBody title={__('Color', 'blockish')} initialOpen={false}>
                                <VStack>
                                    <TextControl
                                        label={__('Text Color', 'blockish')}
                                        value={safeValue?.colors?.textColor || ''}
                                        onChange={(newValue) => onChange(updateNested(safeValue, 'colors.textColor', newValue))}
                                        help={__('Use a CSS color value, e.g. #111111 or rgba(0,0,0,0.8)', 'blockish')}
                                    />
                                    <TextControl
                                        label={__('Background Color', 'blockish')}
                                        value={safeValue?.colors?.backgroundColor || ''}
                                        onChange={(newValue) => onChange(updateNested(safeValue, 'colors.backgroundColor', newValue))}
                                    />
                                </VStack>
                            </PanelBody>

                            <PanelBody title={__('Overflow', 'blockish')} initialOpen={false}>
                                <VStack>
                                    <SelectControl
                                        label={__('Overflow X', 'blockish')}
                                        value={safeValue?.overflow?.overflowX || ''}
                                        options={overflowSelectOptions}
                                        onChange={(newValue) => onChange(updateNested(safeValue, 'overflow.overflowX', newValue))}
                                    />
                                    <SelectControl
                                        label={__('Overflow Y', 'blockish')}
                                        value={safeValue?.overflow?.overflowY || ''}
                                        options={overflowSelectOptions}
                                        onChange={(newValue) => onChange(updateNested(safeValue, 'overflow.overflowY', newValue))}
                                    />
                                    <SelectControl
                                        label={__('White Space', 'blockish')}
                                        value={safeValue?.overflow?.whiteSpace || ''}
                                        options={whiteSpaceSelectOptions}
                                        onChange={(newValue) => onChange(updateNested(safeValue, 'overflow.whiteSpace', newValue))}
                                    />
                                </VStack>
                            </PanelBody>
                        </Panel>
                    );
                }

                return (
                    <Panel>
                        <PanelBody title={__('Layout', 'blockish')} initialOpen={false}>
                            <VStack>
                                <RangeControl
                                    label={__('Padding', 'blockish')}
                                    value={Number(safeValue?.layout?.padding || 0)}
                                    min={0}
                                    max={200}
                                    onChange={(newValue) => onChange(updateNested(safeValue, 'layout.padding', newValue))}
                                />
                                <RangeControl
                                    label={__('Margin', 'blockish')}
                                    value={Number(safeValue?.layout?.margin || 0)}
                                    min={0}
                                    max={200}
                                    onChange={(newValue) => onChange(updateNested(safeValue, 'layout.margin', newValue))}
                                />
                            </VStack>
                        </PanelBody>

                        <PanelBody title={__('Display', 'blockish')} initialOpen={false}>
                            <VStack>
                                <SelectControl
                                    label={__('Layout Type', 'blockish')}
                                    value={safeValue?.display || ''}
                                    options={displayTypeOptions}
                                    onChange={(newValue) => onChange(updateNested(safeValue, 'display', newValue))}
                                />
                                <SelectControl
                                    label={__('Float', 'blockish')}
                                    value={safeValue?.layout?.float || ''}
                                    options={floatSelectOptions}
                                    onChange={(newValue) => onChange(updateNested(safeValue, 'layout.float', newValue))}
                                />
                                <SelectControl
                                    label={__('Clear', 'blockish')}
                                    value={safeValue?.layout?.clear || ''}
                                    options={clearSelectOptions}
                                    onChange={(newValue) => onChange(updateNested(safeValue, 'layout.clear', newValue))}
                                />
                                <SelectControl
                                    label={__('Vertical Align', 'blockish')}
                                    value={safeValue?.layout?.verticalAlign || ''}
                                    options={verticalAlignSelectOptions}
                                    onChange={(newValue) => onChange(updateNested(safeValue, 'layout.verticalAlign', newValue))}
                                />
                            </VStack>
                        </PanelBody>

                        <PanelBody title={__('Position', 'blockish')} initialOpen={false}>
                            <VStack>
                                <SelectControl
                                    label={__('Position', 'blockish')}
                                    value={safeValue?.positioning?.type || ''}
                                    options={positionSelectOptions}
                                    onChange={(newValue) => onChange(updateNested(safeValue, 'positioning.type', newValue))}
                                />
                                <RangeControl
                                    label={__('Top', 'blockish')}
                                    value={Number(safeValue?.positioning?.top || 0)}
                                    min={-500}
                                    max={500}
                                    onChange={(newValue) => onChange(updateNested(safeValue, 'positioning.top', newValue))}
                                />
                                <RangeControl
                                    label={__('Right', 'blockish')}
                                    value={Number(safeValue?.positioning?.right || 0)}
                                    min={-500}
                                    max={500}
                                    onChange={(newValue) => onChange(updateNested(safeValue, 'positioning.right', newValue))}
                                />
                                <RangeControl
                                    label={__('Bottom', 'blockish')}
                                    value={Number(safeValue?.positioning?.bottom || 0)}
                                    min={-500}
                                    max={500}
                                    onChange={(newValue) => onChange(updateNested(safeValue, 'positioning.bottom', newValue))}
                                />
                                <RangeControl
                                    label={__('Left', 'blockish')}
                                    value={Number(safeValue?.positioning?.left || 0)}
                                    min={-500}
                                    max={500}
                                    onChange={(newValue) => onChange(updateNested(safeValue, 'positioning.left', newValue))}
                                />
                            </VStack>
                        </PanelBody>
                    </Panel>
                );
            }}
        </TabPanel>
    );
};

export default StyleControls;
