import clsx from "clsx";
const BlockishIcon = ({ icon, className, ...props }) => {
    if(!icon) return null;
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox={icon?.viewBox} className={clsx('blockish-icon', className)} width={props?.width || icon?.viewBox[2]} height={props?.height || icon?.viewBox[3]} {...props}>
            <path d={icon?.path} />
        </svg>
    )
}

export default BlockishIcon;