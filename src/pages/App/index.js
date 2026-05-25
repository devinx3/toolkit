import './index.css'
import Icon from '@ant-design/icons'
import { Layout, Menu, Col, Row, Spin, Alert, Typography, Tooltip, Space } from 'antd'
import React, { Suspense, useEffect, useState } from 'react'
import { ReactComponent as LogoSvg } from '../../assets/logo.svg'
import { routes, pages } from '../../configs/router'
import { BrowserRouter, Route, NavLink, Switch } from 'react-router-dom'
import upgrade from './upgradation';

const { Content, Footer, Sider } = Layout;

// 系统版本
const VERSION = "0.3.0";

// Logo
const Logo = (props) => {
  const { collapsed, clearItemKey } = props;
  return (<Row className="logo" >
    <Col span={5}><NavLink to={'/home'} onClick={clearItemKey}><Icon component={() => <LogoSvg height="2em" width="2em" />} /></NavLink></Col>
    {collapsed ? null : <Col span={12}>工具箱</Col>}
  </Row>)
}

// 侧边栏
function generageItems() {
  if (!routes) {
    return [];
  }
  const list = [];
  routes.forEach(route => {
    if (route.menu === false) {
      return;
    }
    const item = {
      key: route.key,
      icon: route.icon,
      label: route.name,
    }
    if (route.routes) {
      const children = [];
      route.routes.forEach(chlid => {
        children.push({
          key: chlid.key,
          icon: chlid.icon,
          label: <NavLink to={chlid.path}>{chlid.name}</NavLink>,
        })
      });
      item.children = children;
    }
    list.push(item);
  });
  return list;
};

const basePath = process.env.PUBLIC_URL || '';
const getPath = () => {
  let path = window.location.pathname;
  // Strip basename prefix for internal route matching
  if (basePath && path.startsWith(basePath)) {
    path = path.substring(basePath.length);
  }
  if (path[0] === '/') {
    path = path.substring(1);
  }
  path = path.split("?")[0];
  return path.split('/').filter(val => val !== '');
}
const getDefaultSelectedKeys = () => {
  const path = getPath();
  if (path) {
    return (path.length === 1) ? path : getDefaultOpenKeys();
  }
  return [];
}
const getDefaultOpenKeys = () => {
  const path = getPath();
  if (!path || path.length <= 1) {
    return [];
  }
  return path;
}

// 路由
const RouterList = () => {
  const list = [];
  routes.forEach(route => {
    if (route.path) {
      list.push(<Route exact path={route.path} key={route.key} component={route.component} />);
    } else if (route.routes) {
      route.routes.forEach(child => {
        list.push(<Route exact path={child.path} key={route.key + "/" + child.key} component={child.component} />);
      })
    }
  });
  return (<Suspense fallback={<Spin></Spin>}><Switch>
    {list}
  </Switch></Suspense>)
}

// 升级公告
const UpgradeBanner = () => {
  const msg = upgrade(VERSION);
  const showHashMigration = !!window.location.hash;

  // 如果都没有内容，不渲染
  if (!msg && !showHashMigration) return null;

  // 替换当前 URL 中的 #/ → ，并刷新页面
  const handleReplaceHash = (e) => {
    e.preventDefault();
    const hash = window.location.hash;
    const pathname = window.location.pathname;
    if (hash && hash.startsWith('#/') && (pathname === basePath ? true : pathname === '/' && basePath == '')) {
      const newPath = basePath + hash.substring(1);
      window.history.replaceState(null, '', newPath);
      window.location.reload();
    }
  };

  const content = msg
    ? (showHashMigration
        ? <Space direction="vertical" size={0}>
            <div>{msg}</div>
            <div>路由策略已升级，可手工替换当前链接中的 <strong>#/</strong> 并刷新页面或者点击
              <Typography.Link onClick={handleReplaceHash} style={{ marginLeft: 8 }}>更新当前链接</Typography.Link>
            </div>
          </Space>
        : <Typography.Text>{msg}</Typography.Text>)
    : (showHashMigration
        ? <Space>
            <Typography.Text>路由策略已升级，可手工替换当前链接中的 <strong>#/</strong> 并刷新页面或者点击</Typography.Text>
            <Typography.Link onClick={handleReplaceHash}>更新当前链接</Typography.Link>
          </Space>
        : null);
  return content ? <Alert showIcon={false} message={content} tooltip="升级公告" banner closable /> : null;
}

// 顶级公告
const TopBanner = () => {
  if (global?.location?.hostname) {
    return <></>
  }
  return global?.location?.hostname === 'devinx3.github.io' && <Alert showIcon={false}
    message={<Typography.Text>国内镜像发布了! &nbsp;&nbsp; <Tooltip placement="right" title="需自行迁移配置">
      <Typography.Link href='https://devinx3.gitee.io/toolkit' target='_blank'>跳转 &gt;&gt;</Typography.Link></Tooltip>
    </Typography.Text>}
    tooltip="自行迁移配置"
    banner
    closable
  />
}

const AppMenu = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [itemSelectKey, setItemSelectKey] = useState();
  const handleMenuClick = (e) => {
    setItemSelectKey(e.key);
  }
  return <Layout
    style={{
      minHeight: '100vh',
    }}
  >
    <Sider theme="light" collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
      <Logo collapsed={collapsed} clearItemKey={() => setItemSelectKey([])} />
      <Menu defaultSelectedKeys={getDefaultSelectedKeys()} defaultOpenKeys={getDefaultOpenKeys()}
        onClick={handleMenuClick} selectedKeys={itemSelectKey} mode="inline" items={generageItems()} />
    </Sider>
    <Layout className="site-layout">
      <Content
        style={{
          margin: '10px 16px',
        }}
      >
        <div
          className="site-layout-background"
          style={{
            padding: 24,
            minHeight: 600,
          }}
        >
          {/* {renderRoutes(routes)} */}
          <RouterList />
        </div>
      </Content>
      <Footer
        style={{
          textAlign: 'center',
        }}
      >
        Devinx3 Toolkit ©2022-2024 Created by Devinx3
      </Footer>
    </Layout>
  </Layout>
}

const AppPage = () => {
  return <Switch>
    <Suspense fallback={<div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>}>
      {pages.map(route => <Route exact path={route.path} key={route.key} component={route.component} />)}
    </Suspense>
  </Switch>
}

const pageMenu = (() => {
  let path = "/" + getPath().join("/");
  for (let route of pages) {
    if (route.path === path) {
      return true;
    }
  }
  return false;
})();

// GitHub Pages 降级恢复：从 404 页面重定向回来
const useSessionRedirect = () => {
  useEffect(() => {
    const redirect = sessionStorage.getItem('devinx3.toolkit.redirect');
    if (redirect) {
      sessionStorage.removeItem('devinx3.toolkit.redirect');
      if (redirect !== window.location.href) {
        window.history.replaceState(null, '', redirect);
      }
    }
  }, []);
};


const App = () => {
  useSessionRedirect();
  return (<>
    <TopBanner />
    <UpgradeBanner />
    <BrowserRouter basename={basePath}>
      {pageMenu ? <AppPage /> : <AppMenu />}
    </BrowserRouter>
  </>);
};
export default App;