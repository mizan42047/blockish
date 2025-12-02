import { __ } from '@wordpress/i18n';
import { rotateRight } from '@wordpress/icons';
import {
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';

const Transform = ({ attributes, setAttributes }) => {
    const { BlockishControl, BlockishResponsiveControl } = window?.blockish?.controls;
    const { useDeviceType, getResponsiveValue } = window?.blockish?.helpers;
    const { BlockishDropdown } = window?.blockish?.components;
    const device = useDeviceType();
    return (
        <BlockishControl type='BlockishPanelBody' title={__('Transform', 'blockish')}>
            <BlockishControl
                type="BlockishTab"
                tabs={[
                    {
                        name: 'transform-normal',
                        title: 'Normal'
                    },
                    {
                        name: 'transform-hover',
                        title: 'Hover'
                    }
                ]}
            >
                {({ name: tabName }) => (
                    <>
                        {
                            tabName === 'transform-normal' && (
                                <>
                                    <BlockishControl
                                        type="BlockishToolsPanel"
                                        label={__('Transform', 'blockish')}
                                        parentSlug="transform"
                                        items ={[
                                            
                                        ]}
                                    />
                                </>
                            )
                        }
                    </>
                )}
            </BlockishControl>
        </BlockishControl>
    )
}
export default Transform;