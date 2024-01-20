import React from 'react';
import Icon from '@ant-design/icons'
import * as icons from '@ant-design/icons'
import { RouteBuilder, StorageHelper } from '../handler'

// 创建图标
const createIconFont = (type) => {
    const component = icons[type];
    if (!component) return <></>
    return (<Icon component={component} />);
}

// 创建页面
const createComponent = (category, name) => React.lazy(async () => {
    const render = (await import('./index')).default;
    return { default: () => render({ category, name }) }
})

const dynamicRoute = () => {
    const storeRoutes = StorageHelper.listRoutes();
    return storeRoutes.map(storeRoute => RouteBuilder.builder(storeRoute).build({ createIconFont, createComponent }));
}

export default dynamicRoute;
