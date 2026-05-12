import Icon from '@ant-design/icons';

import EncryptionSvg from './encryption.svg';
import JsonFolderSvg from './json-folder.svg';
import JsonEditSvg from './json-edit.svg';

const Icons = {
    Encryption: () => (<Icon component={EncryptionSvg}/>),
    JsonFolder: () => (<Icon component={JsonFolderSvg}/>),
    JsonEdit: () => (<Icon component={JsonEditSvg}/>),
}

export default Icons;