import CuszIcons from '../icons'
import { FileTextOutlined, EditOutlined } from '@ant-design/icons'
import Home from '../pages/Home'
import React from 'react'

const Encrypt = React.lazy(() => import('../components/Text/Encrypt'))
const TextEdit = React.lazy(() => import('../components/Text/Edit'));
const JsonEdit = React.lazy(() => import('../components/Json/Edit'));

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
        key: 'text-encrypt',
        name: '加密/解密',
        icon: <CuszIcons.Encryption />,
        path: '/text/encrypt',
        component: Encrypt,
      },{
        key: 'text-edit',
        name: '编辑',
        icon: <EditOutlined />,
        path: '/text/edit',
        component: TextEdit,
      },
    ],
  },
  {
    key: 'json',
    name: 'JSON',
    icon: <CuszIcons.JsonFolder />,
    routes: [
      {
        key: 'json-edit',
        name: '编辑',
        icon: <CuszIcons.JsonEdit />,
        path: '/json/edit',
        component: JsonEdit,
      },
    ],
  }
];

export default routes;