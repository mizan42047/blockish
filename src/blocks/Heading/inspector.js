import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
        __experimentalDivider as Divider,
} from '@wordpress/components';

const Inspector = ({ attributes, setAttributes, advancedControls }) => {
    const {
        BlockishControl,
        BlockishResponsiveControl,
    } = window?.blockish?.controls;

    return (
        <InspectorControls>
            <BlockishControl
                type="BlockishTab"
                tabType="top-level"
                tabs={[
                    {
                        name: 'content',
                        title: 'Content'
                    },
                    {
                        name: 'style',
                        title: 'Style'
                    },
                    {
                        name: 'advanced',
                        title: 'Advanced'
                    }
                ]}
            >
                {({ name: tabName }) => (
                    <>
                        {
                            tabName === 'content' && (
                                <>
                                    <BlockishControl type="BlockishPanelBody" title={__('Heading', 'blockish')} initialOpen={true}>
                                        <BlockishControl
                                            type="BlockishSelect"
                                            label={__('HTML Tag', 'blockish')}
                                            slug="tag"
                                            options={[
                                                { value: 'h1', label: __('H1', 'blockish') },
                                                { value: 'h2', label: __('H2', 'blockish') },
                                                { value: 'h3', label: __('H3', 'blockish') },
                                                { value: 'h4', label: __('H4', 'blockish') },
                                                { value: 'h5', label: __('H5', 'blockish') },
                                                { value: 'h6', label: __('H6', 'blockish') },
                                                { value: 'p', label: __('P', 'blockish') },
                                                { value: 'span', label: __('Span', 'blockish') },
                                                { value: 'div', label: __('Div', 'blockish') },
                                            ]}
                                            __nextHasNoMarginBottom={true}
                                        />
                                    </BlockishControl>
                                </>
                            )
                        }
                        {
                            tabName === 'style' && (
                                <>
                                    <BlockishControl type="BlockishPanelBody" title={__('Heading', 'blockish')} initialOpen={true}>
                                        <BlockishResponsiveControl
                                            type="BlockishToggleGroup"
                                            label={__('Alignment', 'blockish')}
                                            slug="alignment"
                                            left="65px"
                                            options={[
                                                { value: 'left', label: __('Left', 'blockish') },
                                                { value: 'center', label: __('Center', 'blockish') },
                                                { value: 'right', label: __('Right', 'blockish') },
                                            ]}
                                        />
                                        {/* <Divider /> */}
                                        <BlockishControl
                                            type="BlockishTypography"
                                            label={__('Typography', 'blockish')}
                                            slug="typography"
                                            groupSelector="{{SELECTOR}}"
                                        />
                                        <BlockishControl
                                            type="BlockishTextStroke"
                                            label={__('Text Stroke', 'blockish')}
                                            slug="textStroke"
                                            groupSelector="{{SELECTOR}}"
                                        />

                                        <BlockishControl
                                            type="BlockishBoxShadow"
                                            label={__('Text Shadow', 'blockish')}
                                            slug="textShadow"
                                            groupSelector="{{SELECTOR}}"
                                            exclude={['spread', 'inset']}
                                        />

                                        <BlockishControl
                                            type="BlockishSelect"
                                            label={__('Blend Mode', 'blockish')}
                                            slug="blendMode"
                                            options={[
                                                { value: 'normal', label: __('Normal', 'blockish') },
                                                { value: 'multiply', label: __('Multiply', 'blockish') },
                                                { value: 'screen', label: __('Screen', 'blockish') },
                                                { value: 'overlay', label: __('Overlay', 'blockish') },
                                                { value: 'darken', label: __('Darken', 'blockish') },
                                                { value: 'lighten', label: __('Lighten', 'blockish') },
                                                { value: 'color-dodge', label: __('Color Dodge', 'blockish') },
                                                { value: 'saturation', label: __('Saturation', 'blockish') },
                                                { value: 'color', label: __('Color', 'blockish') },
                                                { value: 'difference', label: __('Difference', 'blockish') },
                                                { value: 'exclusion', label: __('Exclusion', 'blockish') },
                                                { value: 'hue', label: __('Hue', 'blockish') },
                                                { value: 'luminosity', label: __('Luminosity', 'blockish') },
                                            ]}
                                        />

                                        <BlockishControl
                                            type="BlockishTab"
                                            tabs={[
                                                {
                                                    name: 'heading-normal',
                                                    title: 'Normal'
                                                },
                                                {
                                                    name: 'heading-hover',
                                                    title: 'Hover'
                                                }
                                            ]}
                                        >
                                            {({ name }) => (
                                                <>
                                                    {
                                                        name === 'heading-normal' && (
                                                            <>
                                                                <BlockishControl
                                                                    type="BlockishColor"
                                                                    label={__('Text Color', 'blockish')}
                                                                    slug="color"
                                                                />
                                                            </>
                                                        )
                                                    }
                                                    {
                                                        name === 'heading-hover' && (
                                                            <>
                                                                <BlockishControl
                                                                    type="BlockishColor"
                                                                    label={__('Text Color', 'blockish')}
                                                                    slug="hoverColor"
                                                                />
                                                            </>
                                                        )
                                                    }
                                                </>
                                            )}
                                        </BlockishControl>
                                    </BlockishControl>
                                </>
                            )
                        }
                        {
                            tabName === 'advanced' && (
                                advancedControls
                            )
                        }
                    </>
                )}
            </BlockishControl>
        </InspectorControls>
    )
}
export default memo(Inspector);
