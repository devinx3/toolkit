import CuszIcons from '../icons'
import { FileTextOutlined, EditOutlined, ContainerOutlined, ControlOutlined, InfoOutlined, InteractionOutlined } from '@ant-design/icons'
import React from 'react'
import dynamicRoue from '../components/Customization/Template/route'
import HomeNotFound from '../pages/notFound'
import CustomizationNotFound from '../components/Customization/notFound'



const Home = React.lazy(() => import('../pages/Home'));
const Encrypt = React.lazy(() => import('../components/Text/Encrypt'));
const TextEdit = React.lazy(() => import('../components/Text/Edit'));
const JsonEdit = React.lazy(() => import('../components/Json/Edit'));
const CustomizeManage = React.lazy(() => import('../components/Customization/Manage'));
const CustomizePage = React.lazy(() => import('../components/Customization/Page'));
const ScriptIntroduce = React.lazy(() => import('../pages/About/scriptIntroduce'));

const pages = [{
  key: 'page',
  path: '/page',
  component: CustomizePage,
}];

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
      }, {
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
  },
  {
    menu: false,
    key: 'customize-page',
    path: '/customize/page',
    component: CustomizePage,
  },
  {
    key: 'customize',
    name: '定制化',
    icon: <ContainerOutlined />,
    routes: [
      {
        key: 'customize-manage',
        name: '管理',
        icon: <ControlOutlined />,
        path: '/customize/manage',
        component: CustomizeManage,
      },
      ...dynamicRoue()
    ],
  },
  {
    key: 'about',
    name: '关于',
    icon: <InfoOutlined />,
    routes: [
      {
        key: 'script-introduce',
        name: '脚本介绍',
        icon: <InteractionOutlined />,
        path: '/about/script-introduce',
        component: ScriptIntroduce,
      }
    ],
  },
];

const notFoundList = [{
  key: "customize",
  path: '/customize/*',
  component: CustomizationNotFound
},
{
  key: "index",
  path: '/*',
  component: HomeNotFound
}]

notFoundList.forEach(route => routes.push({ ...route, key: route.key + "-404", menu: false }));

export { routes, pages };