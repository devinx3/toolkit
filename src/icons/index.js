import Icon from '@ant-design/icons';

import { ReactComponent as EncryptionSvg } from './encryption.svg';
import { ReactComponent as JsonFolderSvg } from './json-folder.svg';
import { ReactComponent as JsonEditSvg } from './json-edit.svg';

const Icons = {
    Encryption: () => (<Icon component={EncryptionSvg}/>),
    JsonFolder: () => (<Icon component={JsonFolderSvg}/>),
    JsonEdit: () => (<Icon component={JsonEditSvg}/>),
}

export default Icons;