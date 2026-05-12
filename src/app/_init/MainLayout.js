'use client'

import React, { Suspense, useState, useEffect, useCallback } from 'react'
import { Layout, Menu, Col, Row, Spin, Alert, Typography, Tooltip } from 'antd'
import Icon from '@ant-design/icons'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { menuItems } from '../../configs/menu'
import { StorageHelper } from '../../components/Customization/handler'
import * as icons from '@ant-design/icons'
import upgrade from './upgradation'
import LogoSvg from '../../assets/logo.svg'

const { Content, Footer, Sider } = Layout

const VERSION = '0.3.0'

// 从路径获取菜单选中项
function getSelectedKeys(pathname) {
  if (!pathname) return []
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length >= 2) {
    return [parts.join('-')]
  }
  return parts
}

function getOpenKeys(pathname) {
  if (!pathname) return []
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length >= 2) {
    return [parts[0]]
  }
  return []
}

function buildMenuItems(items) {
  return items.map(item => {
    if (item.children) {
      return {
        key: item.key,
        icon: item.icon,
        label: item.name,
        children: item.children.map(child => ({
          key: child.key,
          icon: child.icon,
          label: <Link href={child.path}>{child.name}</Link>,
        })),
      }
    }
    return {
      key: item.key,
      icon: item.icon,
      label: item.path ? <Link href={item.path}>{item.name}</Link> : item.name,
    }
  })
}

// 升级公告
const UpgradeBanner = () => {
  const [msg, setMsg] = React.useState(null)
  React.useEffect(() => {
    const upgradeModule = upgrade(VERSION)
    setMsg(upgradeModule)
  }, [])
  return msg ? (
    <Alert
      showIcon={false}
      message={<Typography.Text>{msg}</Typography.Text>}
      tooltip="升级公告"
      banner
      closable
    />
  ) : null
}

// 顶级公告
const TopBanner = () => {
  const [isLocal, setIsLocal] = React.useState(true)

  React.useEffect(() => {
    setIsLocal(typeof global?.location?.hostname === 'string')
  }, [])

  if (isLocal) {
    return null
  }
  return (
    <Alert
      showIcon={false}
      message={
        <Typography.Text>
          国内镜像发布了! &nbsp;&nbsp;
          <Tooltip placement="right" title="需自行迁移配置">
            <Typography.Link href="https://devinx3.gitee.io/toolkit" target="_blank">
              跳转 &gt;&gt;
            </Typography.Link>
          </Tooltip>
        </Typography.Text>
      }
      tooltip="自行迁移配置"
      banner
      closable
    />
  )
}

export default function MainLayout({ children }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [openKeys, setOpenKeys] = useState([])
  const [dynamicMenuItems, setDynamicMenuItems] = useState(menuItems)

  // 从 localStorage 读取用户自定义分类，合并到菜单
  const mergeCustomRoutes = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      const routes = StorageHelper.listRoutes()
      const customizeChildren = routes.map(route => {
        const IconComp = icons[route.icon]
        return {
          key: `customize-cat-${route.category}`,
          name: route.name,
          path: `/customize/cat/${route.category}`,
          icon: IconComp ? <Icon component={IconComp} /> : undefined,
        }
      })
      setDynamicMenuItems(prev => {
        const updated = prev.map(item => {
          if (item.key === 'customize') {
            // 只保留静态的子项（管理中、页面设计），动态添加自定义分类
            const staticChildren = item.children.filter(
              c => c.key === 'customize-manage' || c.key === 'customize-page'
            )
            return {
              ...item,
              children: [...staticChildren, ...customizeChildren],
            }
          }
          return item
        })
        return updated
      })
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    mergeCustomRoutes()
    // 监听菜单更新事件（管理页面新增/删除分类后触发）
    if (typeof window !== 'undefined') {
      window.addEventListener('menu-update', mergeCustomRoutes)
      return () => window.removeEventListener('menu-update', mergeCustomRoutes)
    }
  }, [mergeCustomRoutes])

  useEffect(() => {
    setSelectedKeys(getSelectedKeys(pathname))
    setOpenKeys(getOpenKeys(pathname))
  }, [pathname])

  const items = buildMenuItems(dynamicMenuItems)

  return (
    <>
      <TopBanner />
      <UpgradeBanner />
      <Layout style={{ height: '100vh', overflow: 'hidden' }}>
        <Sider
          theme="light"
          width={200}
          trigger={null}
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100vh' }}
        >
          <Row className="logo">
            <Col span={5}>
              <Link href="/home">
                <Icon
                  component={() => (
                    <LogoSvg height="2em" width="2em" />
                  )}
                />
              </Link>
            </Col>
            {collapsed ? null : (
              <Col span={12}>
                <Link href="/home" style={{ color: 'inherit', textDecoration: 'none' }}>
                  工具箱
                </Link>
              </Col>
            )}
          </Row>
          <Menu
            selectedKeys={selectedKeys}
            defaultOpenKeys={openKeys}
            mode="inline"
            items={items}
            style={{ flex: 1, overflowY: 'auto' }}
          />
          <div
            onClick={() => setCollapsed(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 40,
              cursor: 'pointer',
              color: 'rgba(0,0,0,0.45)',
              borderTop: collapsed ? 'none' : '1px solid rgba(0,0,0,0.06)',
              transition: 'all 0.2s',
              marginTop: 'auto',
            }}
          >
            {collapsed ? <icons.MenuUnfoldOutlined /> : <icons.MenuFoldOutlined />}
          </div>
        </Sider>
        <Layout className="site-layout" style={{ overflow: 'hidden' }}>
          <Content style={{ margin: '5px 8px', overflowY: 'auto', flex: 1 }}>
            <div
              className="site-layout-background"
              style={{ padding: 24 }}
            >
              <Suspense fallback={<Spin />}>{children}</Suspense>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Devinx3 Toolkit ©2022-2024 Created by Devinx3
          </Footer>
        </Layout>
      </Layout>
    </>
  )
}
