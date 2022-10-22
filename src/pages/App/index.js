import './index.css'
import Icon from '@ant-design/icons'
import { Layout, Menu, Col, Row} from 'antd'
import React, { useState } from 'react'
import { ReactComponent as LogoSvg } from '../../assets/logo.svg'
import routes from '../../configs/router'
import { BrowserRouter, Route, NavLink, Redirect } from 'react-router-dom'

const { Content, Footer, Sider } = Layout;

// Logo
const Logo = (props) => {
  const {collapsed} = props;
  return (<Row className="logo" >
    <Col span={5}><a href={process.env.PUBLIC_URL + '/home'}><Icon component={() => <LogoSvg height="2em" width="2em"/>}/></a></Col>
    {collapsed? null : <Col span={12}>工具箱</Col>}
</Row>)
}

// 侧边栏
function generageItems() {
  if(!routes) {
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
const getPath = () => {
  let path = window.location.pathname;
  if (!path) {
    return [];
  }
  if (path[0] === '/') {
    path = path.substring(1);
  }
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
        list.push(<Route path={process.env.PUBLIC_URL + route.path} key={route.key} component={route.component} />);
      }else if (route.routes) {
        route.routes.forEach(child => {
            list.push(<Route path={process.env.PUBLIC_URL + child.path} key={route.key + "/" + child.key} component={child.component} />);
        })
      }
    });
  return (<>
    { list }
    <Redirect from='/' exact to={process.env.PUBLIC_URL + '/home'}/>
  </>)
}

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <BrowserRouter>
      <Layout
        style={{
          minHeight: '100vh',
        }}
      >
        <Sider theme="light" collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
          <Logo collapsed={collapsed}/>
          <Menu defaultSelectedKeys={getDefaultSelectedKeys()} defaultOpenKeys={getDefaultOpenKeys()} mode="inline" items={generageItems()} />
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
            Devinx3 Toolkit ©2022 Created by Devinx3
          </Footer>
        </Layout>
      </Layout>
    </BrowserRouter>
  );
};
export default App;