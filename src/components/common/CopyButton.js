import React from 'react';
import { Tooltip, Button } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import GlobalUtil from '../../utils/GlobalUtil'


const CopyButton = props => {
    const [successFlag, setSuccessFlag] = React.useState(false);
    const onClick = e => {
        if (successFlag) {
            return;
        }
        if (props.onClick) {
            const result = props.onClick(e);
            if (result === true) {
                setSuccessFlag(true);
            }
            return result;
        }
    }
    const onMouseLeave = () => {
        if (successFlag) {
            setSuccessFlag(false);
        }
    }
    const btnProps = GlobalUtil.omit(props, 'tipTitle');
    return <Tooltip title={props.tipTitle || '复制'}>
        <Button {...btnProps} onClick={onClick} icon={successFlag ? <CheckOutlined style={{ color: "#52c41a" }} /> : < CopyOutlined />} onMouseLeave={onMouseLeave} />
    </Tooltip>
}

export default CopyButton