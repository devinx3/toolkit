import CuszIcons from '../icons'
import { FileTextOutlined } from '@ant-design/icons'

import Home from '../pages/Home'
import Encrypt from '../components/Text/Encrypt'
import JsonEdit from '../components/Json/Edit'

const routes = [
  {
    menu: false,
    key: 'index',
    path: '/',
    component: Home,
  },
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
  },
  {
    key: 'json',
    name: 'JSON',
    icon: <CuszIcons.JsonFolder />,
    routes: [
      {
        key: 'edit',
        name: '编辑',
        icon: <CuszIcons.JsonEdit />,
        path: '/json/edit',
        component: JsonEdit,
      },
    ],
  }
];

export default routes;