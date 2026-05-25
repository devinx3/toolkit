import React from 'react';
import { Button, Result } from 'antd';
import { useHistory } from 'react-router-dom';

const NotFound = () => {
  const history = useHistory();
  return (
    <Result
      status="404"
      title="404"
      subTitle="抱歉，你访问的页面不存在"
      extra={<Button type="primary" onClick={e => history.push('/')}>返回主页</Button>}
    />
  );
};

export default NotFound;
