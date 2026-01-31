import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

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
                                    <BlockishControl type="BlockishPanelBody" title={__('Button', 'blockish')} initialOpen={true}>
                                        <BlockishControl
                                            type="BlockishLink"
                                            label={__('Link', 'blockish')}
                                            slug="link"
                                        />
                                        <BlockishControl
                                            type="BlockishText"
                                            label={__('Aria Label', 'blockish')}
                                            slug="ariaLabel"
                                            help={__('Improves accessibility. Leave empty to use button text.', 'blockish')}
                                        />
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
                                    </BlockishControl>
                                    <BlockishControl type="BlockishPanelBody" title={__('Settings', 'blockish')} initialOpen={true}>
                                        <BlockishControl
                                            type="BlockishToggleGroup"
                                            label={__('HTML Element', 'blockish')}
                                            slug="htmlTag"
                                            options={[
                                                { value: 'a', label: __('Link (a)', 'blockish') },
                                                { value: 'button', label: __('Button', 'blockish') },
                                            ]}
                                        />
                                        <BlockishControl
                                            label={__('Add Icon', 'blockish')}
                                            type="ToggleControl"
                                            slug="addIcon"
                                        />
                                        {/* {attributes?.addIcon && ( */}
                                            <>
                                                <BlockishControl
                                                    type="BlockishIconPicker"
                                                    label={__('Icon', 'blockish')}
                                                    slug="icon"
                                                />
                                                <BlockishControl
                                                    type="BlockishSelect"
                                                    label={__('Icon Position', 'blockish')}
                                                    slug="iconPosition"
                                                    options={[
                                                        { value: 'before', label: __('Before', 'blockish') },
                                                        { value: 'after', label: __('After', 'blockish') },
                                                    ]}
                                                />
                                            </>
                                        {/* )} */}
                                    </BlockishControl>
                                </>
                            )
                        }
                        {
                            tabName === 'style' && (
                                <>
                                    <BlockishControl type="BlockishPanelBody" title={__('Button', 'blockish')} initialOpen={true}>
                                        <BlockishControl
                                            type="BlockishTypography"
                                            label={__('Typography', 'blockish')}
                                            slug="typography"
                                            groupSelector="{{SELECTOR}}"
                                        />
                                        <BlockishControl
                                            type="BlockishTab"
                                            tabs={[
                                                {
                                                    name: 'button-normal',
                                                    title: 'Normal'
                                                },
                                                {
                                                    name: 'button-hover',
                                                    title: 'Hover'
                                                }
                                            ]}
                                        >
                                            {({ name }) => (
                                                <>
                                                    {
                                                        name === 'button-normal' && (
                                                            <>
                                                                <BlockishControl
                                                                    type="BlockishColor"
                                                                    label={__('Text Color', 'blockish')}
                                                                    slug="textColor"
                                                                />
                                                                <BlockishControl
                                                                    type="BlockishColor"
                                                                    label={__('Background Color', 'blockish')}
                                                                    slug="backgroundColor"
                                                                />
                                                                <BlockishControl
                                                                    type="BlockishBorder"
                                                                    label={__('Border', 'blockish')}
                                                                    slug="border"
                                                                    groupSelector="{{SELECTOR}}"
                                                                />
                                                                <BlockishControl
                                                                    type="BlockishBoxShadow"
                                                                    label={__('Box Shadow', 'blockish')}
                                                                    slug="boxShadow"
                                                                    groupSelector="{{SELECTOR}}"
                                                                />
                                                            </>
                                                        )
                                                    }
                                                    {
                                                        name === 'button-hover' && (
                                                            <>
                                                                <BlockishControl
                                                                    type="BlockishColor"
                                                                    label={__('Color', 'blockish')}
                                                                    slug="textHoverColor"
                                                                />
                                                                <BlockishControl
                                                                    type="BlockishColor"
                                                                    label={__('Background Color', 'blockish')}
                                                                    slug="backgroundHoverColor"
                                                                />
                                                                <BlockishControl
                                                                    type="BlockishBorder"
                                                                    label={__('Border', 'blockish')}
                                                                    slug="borderHover"
                                                                    groupSelector="{{SELECTOR}}"
                                                                />
                                                                <BlockishControl
                                                                    type="BlockishBoxShadow"
                                                                    label={__('Box Shadow', 'blockish')}
                                                                    slug="boxShadowHover"
                                                                    groupSelector="{{SELECTOR}}"
                                                                />
                                                            </>
                                                        )
                                                    }
                                                </>
                                            )}
                                        </BlockishControl>

                                        <BlockishResponsiveControl
                                            type="BlockishDimensions"
                                            label={__('Border Radius', 'blockish')}
                                            slug="borderRadius"
                                            units={['px', '%', 'em', 'rem']}
                                        />
                                    </BlockishControl>

                                    <BlockishControl type="BlockishPanelBody" title={__('Spacing', 'blockish')}>
                                        <BlockishResponsiveControl
                                            type="BlockishDimensions"
                                            label={__('Padding', 'blockish')}
                                            slug="padding"
                                            units={['px', '%', 'em', 'rem']}
                                        />
                                        <BlockishResponsiveControl
                                            type="BlockishDimensions"
                                            label={__('Margin', 'blockish')}
                                            slug="margin"
                                            units={['px', '%', 'em', 'rem']}
                                        />
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
