const useStyle = (attributes, WRAPPER) => {
    const { useDeviceList } = window.blockish.helpers;

    const deviceList = useDeviceList();
    let css = '';

    for (const device of deviceList) {
        let widthRules = null;
        if (attributes.widthType[device.slug] && attributes.widthType[device.slug]?.value !== 'custom') {
            widthRules = attributes.widthType[device.slug]?.value
        } else if (attributes.customWidth?.[device?.slug] && attributes.widthType?.[device.slug]?.value == 'custom') {
            widthRules = attributes.customWidth[device.slug]
        }

        if (device.slug === 'Desktop') {
            widthRules ? (
                css += `
                    .${WRAPPER} {
                        width: ${widthRules};
                    }
                `
            ) : null;
        }else {
            widthRules ? (
                css += `
                    @media (max-width: ${device.value}) {
                        .${WRAPPER} {
                            width: ${widthRules};
                        }
                    }
                `
            ) : null;
        }
    }
    return css;
};

export default useStyle;
