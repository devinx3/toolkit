import CuszIcons from '../icons'
import { FileTextOutlined, EditOutlined, ControlOutlined, InfoOutlined, InteractionOutlined } from '@ant-design/icons'
import React from 'react'

export const menuItems = [
  {
    key: 'text',
    name: '文本处理',
    icon: <FileTextOutlined />,
    children: [
      { key: 'text-encrypt', name: '加密/解密', path: '/text/encrypt', icon: <CuszIcons.Encryption /> },
      { key: 'text-edit', name: '编辑', path: '/text/edit', icon: <EditOutlined /> },
    ],
  },
  {
    key: 'json',
    name: 'JSON',
    icon: <CuszIcons.JsonFolder />,
    children: [
      { key: 'json-edit', name: '编辑', path: '/json/edit', icon: <CuszIcons.JsonEdit />  },
    ],
  },
  {
    key: 'customize',
    name: '定制化',
    icon: <ControlOutlined />,
    children: [
      { key: 'customize-manage', name: '管理', path: '/customize/manage', icon: <ControlOutlined /> },
    ],
  },
  {
    key: 'about',
    name: '关于',
    icon: <InfoOutlined />,
    children: [
      { key: 'script-introduce', name: '脚本介绍', path: '/about/script-introduce', icon: <InteractionOutlined /> },
    ],
  },
];
