import React from 'react';
import { Button, Result } from 'antd';

const NotFound = () => (
  <Result
    status="404"
    title="404"
    subTitle="抱歉，你访问的页面不存在"
    extra={<Button type="primary" onClick={e => window.location.hash='/'}>返回主页</Button>}
  />
);

export default NotFound;