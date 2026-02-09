import { __experimentalDivider as Divider } from "@wordpress/components";

const BlockishDivider = ({ ...props }) => {
    return (
        <div className="blockish-ui-control blockish-divider">
            <Divider {...props} />
        </div>
    )
}

export default BlockishDivider;