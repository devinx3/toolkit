import React from 'react';
import { Button, Result, Space } from 'antd';
import { useHistory } from 'react-router-dom';

const NotFound = () => {
  const history = useHistory();
  return (
    <Result
      status="404"
      title="404"
      subTitle="抱歉，不存在的定制化页面"
      extra={<Space>
          <Button type="primary" onClick={e => history.push('/customize/manage')}>返回管理页</Button>
          <Button type="default" onClick={e => history.push('/')}>返回主页</Button>
      </Space>}
    />
  );
};

export default NotFound;