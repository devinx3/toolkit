import CuszIcons from '../icons'
import { FileTextOutlined } from '@ant-design/icons'

import Home from '../pages/Home'
import Encrypt from '../components/Text/Encrypt'

const routes = [
  {
    menu: false,
    key: 'home',
    path: '/home',
    component: Home,
  },
  {
    key: 'text',
    name: '文本处理',
    icon: <FileTextOutlined />,
    routes: [
      {
        key: 'encrypt',
        name: '加密/解密',
        icon: <CuszIcons.Encryption />,
        path: '/text/encrypt',
        component: Encrypt,
      },
    ],
  }
];

export default routes;