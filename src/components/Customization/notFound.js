import React from 'react';
import { Button, Result, Space } from 'antd';

const NotFound = () => (
  <Result
    status="404"
    title="404"
    subTitle="抱歉，不存在的定制化页面"
    extra={<Space>
        <Button type="primary" onClick={e => window.location.hash='/customize/manage'}>返回管理页</Button>
        <Button type="default" onClick={e => window.location.hash='/'}>返回主页</Button>
    </Space>}
  />
);

export default NotFound;