import {
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
const BlockishToolsPanel = ({ label, value, onChange, items = [] }) => {
    return(
        <ToolsPanel
            label={label}
            resetAll={() => onChange(undefined)}
        >
            {items.map((item, index) => (
                <ToolsPanelItem
                    key={index}
                    label={item?.label}
                    hasValue={!!item?.value}
                    onDeselect={() => onChange({
                        ...value,
                        [item?.slug]: undefined
                    })}
                >
                    {item?.children}
                </ToolsPanelItem>
            ))}
        </ToolsPanel>
    )
}

export default BlockishToolsPanel;