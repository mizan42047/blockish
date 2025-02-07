import { InspectorControls } from '@wordpress/block-editor';
import { memo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
const Inspector = ({ attributes, advancedControls }) => {
    const {
        BlockishControl,
        BlockishResponsiveControl,
    } = window?.blockish?.controls;

    const {
        BlockishMediaUploader
    } = window?.blockish?.components;

    const [backgroundImage, setBackgroundImage] = useState(null);
    
    return (
        <InspectorControls>
            <BlockishControl
                type="BlockishTab"
                tabType="top-level"
                tabs={[
                    {
                        name: 'layout',
                        title: 'Layout'
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
                            tabName === 'layout' && (
                                <>
                                    <BlockishControl type="BlockishPanelBody" title={__('Layout', 'blockish')}>
                                        <BlockishControl
                                            type="BlockishToggleGroup"
                                            label={__('Container Width', 'blockish')}
                                            slug="containerWidth"
                                            options={[
                                                {
                                                    label: 'Full Width',
                                                    value: 'alignfull'
                                                },
                                                {
                                                    label: 'Boxed',
                                                    value: 'alignwide'
                                                },
                                                {
                                                    label: 'Custom',
                                                    value: 'align-custom-width'
                                                }
                                            ]}
                                        />
                                        {
                                            attributes?.containerWidth === 'align-custom-width' && (
                                                <BlockishResponsiveControl
                                                    type="BlockishRangeUnit"
                                                    label={__('Custom Width', 'blockish')}
                                                    slug="customWidthContainer"
                                                    left="90px"
                                                />
                                            )
                                        }
                                        <BlockishResponsiveControl
                                            type="BlockishRangeUnit"
                                            label={__('Min Height', 'blockish')}
                                            slug="containerMinHeight"
                                            left="68px"
                                        />
                                        <BlockishControl
                                            type="BlockishToggleGroup"
                                            label={__('Display', 'blockish')}
                                            slug="display"
                                            options={[
                                                {
                                                    label: 'Flex',
                                                    value: 'flex'
                                                },
                                                {
                                                    label: 'Grid',
                                                    value: 'grid'
                                                },
                                                {
                                                    label: 'Block',
                                                    value: 'block'
                                                },
                                            ]}
                                            __nextHasNoMarginBottom={true}
                                            left="48px"
                                            isDeselectable={false}
                                        />
                                        {
                                            attributes?.display === 'flex' && (
                                                <>
                                                    <BlockishResponsiveControl
                                                        type="BlockishSelect"
                                                        label={__('Direction', 'blockish')}
                                                        slug="flexDirection"
                                                        options={[
                                                            {
                                                                label: 'Row',
                                                                value: 'row'
                                                            },
                                                            {
                                                                label: 'Column',
                                                                value: 'column'
                                                            },
                                                            {
                                                                label: 'Row Reverse',
                                                                value: 'row-reverse'
                                                            },
                                                            {
                                                                label: 'Column Reverse',
                                                                value: 'column-reverse'
                                                            },
                                                        ]}
                                                        __nextHasNoMarginBottom={true}
                                                        left="65px"
                                                    />
                                                    <BlockishResponsiveControl
                                                        type="BlockishToggleGroup"
                                                        label={__('Flex Wrap', 'blockish')}
                                                        slug="flexWrap"
                                                        options={[
                                                            {
                                                                label: 'Wrap',
                                                                value: 'wrap'
                                                            },
                                                            {
                                                                label: 'No Wrap',
                                                                value: 'nowrap'
                                                            },
                                                            {
                                                                label: 'Reverse',
                                                                value: 'wrap-reverse'
                                                            }
                                                        ]}
                                                        __nextHasNoMarginBottom={true}
                                                        left="66px"
                                                    />
                                                    <BlockishResponsiveControl
                                                        type="BlockishSelect"
                                                        label={__('Justify Content', 'blockish')}
                                                        slug="justifyContent"
                                                        options={[
                                                            {
                                                                label: 'Start',
                                                                value: 'flex-start'
                                                            },
                                                            {
                                                                label: 'End',
                                                                value: 'flex-end'
                                                            },
                                                            {
                                                                label: 'Center',
                                                                value: 'center'
                                                            },
                                                            {
                                                                label: 'Space Between',
                                                                value: 'space-between'
                                                            },
                                                            {
                                                                label: 'Space Around',
                                                                value: 'space-around'
                                                            },
                                                            {
                                                                label: 'Space Evenly',
                                                                value: 'space-evenly'
                                                            },
                                                        ]}
                                                        __nextHasNoMarginBottom={true}
                                                        left="105px"
                                                    />
                                                    <BlockishResponsiveControl
                                                        type="BlockishSelect"
                                                        label={__('Align Items', 'blockish')}
                                                        slug="alignItems"
                                                        options={[
                                                            {
                                                                label: 'Start',
                                                                value: 'flex-start'
                                                            },
                                                            {
                                                                label: 'End',
                                                                value: 'flex-end'
                                                            },
                                                            {
                                                                label: 'Center',
                                                                value: 'center'
                                                            },
                                                            {
                                                                label: 'Stretch',
                                                                value: 'stretch'
                                                            }
                                                        ]}
                                                        __nextHasNoMarginBottom={true}
                                                        left="75px"
                                                    />
                                                </>
                                            )
                                        }
                                        {
                                            attributes?.display === 'grid' && (
                                                <>
                                                    <BlockishControl
                                                        type="BlockishToggleGroup"
                                                        label={__('Grid Layout', 'blockish')}
                                                        slug="gridLayoutType"
                                                        options={[
                                                            {
                                                                label: 'Auto',
                                                                value: 'auto'
                                                            },
                                                            {
                                                                label: 'Fixed',
                                                                value: 'fixed'
                                                            }
                                                        ]}
                                                        isDeselectable={false}
                                                    />
                                                    {
                                                        attributes?.gridLayoutType === 'fixed' && (
                                                            <>
                                                                <BlockishResponsiveControl
                                                                    type="BlockishRangeControl"
                                                                    label={__('Columns', 'blockish')}
                                                                    slug="gridColumns"
                                                                    left="60px"
                                                                    min={1}
                                                                    max={12}
                                                                />
                                                                <BlockishResponsiveControl
                                                                    type="BlockishRangeControl"
                                                                    label={__('Rows', 'blockish')}
                                                                    slug="gridRows"
                                                                    left="60px"
                                                                    min={1}
                                                                    max={12}
                                                                />
                                                            </>
                                                        )
                                                    }
                                                    {
                                                        attributes?.gridLayoutType === 'auto' && (
                                                            <>
                                                                <BlockishResponsiveControl
                                                                    type="BlockishRangeUnit"
                                                                    label={__('Grid Width', 'blockish')}
                                                                    slug="autoGridWidth"
                                                                    left="70px"
                                                                />
                                                                <BlockishResponsiveControl
                                                                    type="BlockishRangeUnit"
                                                                    label={__('Grid Height', 'blockish')}
                                                                    slug="autoGridHeight"
                                                                    left="72px"
                                                                />
                                                            </>
                                                        )
                                                    }
                                                </>
                                            )
                                        }
                                        {
                                            attributes?.display !== 'block' && (
                                                <>
                                                    <BlockishResponsiveControl
                                                        type="BlockishRangeUnit"
                                                        label={__('Column Gap', 'blockish')}
                                                        slug="columnGap"
                                                        left="77px"
                                                    />
                                                    <BlockishResponsiveControl
                                                        type="BlockishRangeUnit"
                                                        label={__('Row Gap', 'blockish')}
                                                        slug="rowGap"
                                                        left="54px"
                                                    />
                                                </>
                                            )
                                        }
                                    </BlockishControl>
                                    <BlockishControl type="BlockishPanelBody" title={__('Additional', 'blockish')} initialOpen={false}>
                                        <BlockishControl
                                            type="BlockishSelect"
                                            label={__('Tag', 'blockish')}
                                            slug="tagName"
                                            options={[
                                                {
                                                    label: 'Div',
                                                    value: 'div'
                                                },
                                                {
                                                    label: 'Section',
                                                    value: 'section'
                                                },
                                                {
                                                    label: 'Article',
                                                    value: 'article'
                                                },
                                                {
                                                    label: 'Main',
                                                    value: 'main'
                                                },
                                                {
                                                    label: 'a(Link)',
                                                    value: 'a'
                                                },
                                                {
                                                    label: 'Nav',
                                                    value: 'nav'
                                                },
                                                {
                                                    label: 'Header',
                                                    value: 'header'
                                                },
                                                {
                                                    label: 'Footer',
                                                    value: 'footer'
                                                },
                                                {
                                                    label: 'Ul(List)',
                                                    value: 'ul'
                                                },
                                                {
                                                    label: 'Ol(List)',
                                                    value: 'ol'
                                                },
                                                {
                                                    label: 'Li(List Item)',
                                                    value: 'li'
                                                },
                                                {
                                                    label: 'Figure',
                                                    value: 'figure'
                                                }
                                            ]}
                                            __nextHasNoMarginBottom={true}
                                        />
                                    </BlockishControl>
                                </>
                            )
                        }
                        {
                            tabName === 'style' && (
                                <BlockishControl type="BlockishPanelBody" title={__('Style', 'blockish')}>
                                    {/* <BlockishControl
                                        type="BlockishColor"
                                        slug="textColor"
                                        label={__('Text Color', 'blockish')}
                                    />
                                    <BlockishControl
                                        type="BlockishFontSizePicker"
                                        slug="fontSize"
                                        label={__('Font Size', 'blockish')}
                                    /> */}
                                    <BlockishMediaUploader 
                                        label={__('Background Image', 'blockish')}
                                        placeholder={__('Upload Background Image', 'blockish')}
                                        value={backgroundImage}
                                        onChange={(image) => {
                                            setBackgroundImage(image);
                                        }}
                                    />
                                </BlockishControl>
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