import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
const Layout = ({ name }) => {
    const { BoilerplateControl, BoilerplateResponsiveControl  } = window?.boilerplateBlocks?.controls;
    const layoutMarginExcludes = applyFilters('boilerplateBlocks.advancedControl.layout.margin.exclude', new Set([]));
    const layoutPaddingExcludes = applyFilters('boilerplateBlocks.advancedControl.layout.padding.exclude', new Set([]));
    return (
        <BoilerplateControl type='BoilerplatePanelBody' title={__('Layout', 'boilerplate-blocks')}>
            {
                !layoutPaddingExcludes.has(name) && (
                    <BoilerplateResponsiveControl
                        type='BoilerplateSpacingSizes'
                        label={__('Padding', 'boilerplate-blocks')}
                        slug='padding'
                    />
                )
            }
            {
                !layoutMarginExcludes.has(name) && (
                    <BoilerplateResponsiveControl
                        type='BoilerplateSpacingSizes'
                        label={__('Margin', 'boilerplate-blocks')}
                        slug='margin'
                    />
                )
            }
        </BoilerplateControl>
    );
}
export default Layout;