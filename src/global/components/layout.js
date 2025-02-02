import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
const Layout = ({ name }) => {
    const { BlockishControl, BlockishResponsiveControl } = window?.blockish?.controls;
    const layoutMarginExcludes = applyFilters('blockish.advancedControl.layout.margin.exclude', new Set([]));
    const layoutPaddingExcludes = applyFilters('blockish.advancedControl.layout.padding.exclude', new Set([]));
    const layoutZIndexExcludes = applyFilters('blockish.advancedControl.layout.zIndex.exclude', new Set([]));
    return (
        <BlockishControl type='BlockishPanelBody' title={__('Layout', 'blockish')}>
            {
                !layoutMarginExcludes.has(name) && (
                    <BlockishResponsiveControl
                        type='BlockishSpacingSizes'
                        label={__('Margin', 'blockish')}
                        slug='margin'
                        left="46px"
                    />
                )
            }

            {
                !layoutPaddingExcludes.has(name) && (
                    <BlockishResponsiveControl
                        type='BlockishSpacingSizes'
                        label={__('Padding', 'blockish')}
                        slug='padding'
                        left="52px"
                    />
                )
            }

            {
                !layoutZIndexExcludes.has(name) && (
                    <BlockishResponsiveControl
                        type='BlockishRangeControl'
                        label={__('Z-Index', 'blockish')}
                        slug='zIndex'
                        left="48px"
                        min="-999"
                        max="999"
                        step="1"
                    />
                )
            }
        </BlockishControl>
    );
}
export default Layout;