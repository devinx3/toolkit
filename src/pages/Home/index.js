import React from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';

const source = `
# 工具箱

收集常用的工具箱功能
`;

const Home = () => {
    return (<MarkdownPreview source={source} />);
}
export default Home;