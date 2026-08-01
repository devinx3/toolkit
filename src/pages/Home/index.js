import React from 'react';
import { Spin } from 'antd';
import MarkdownPreview from '@uiw/react-markdown-preview';
import ReadMeSource from './home.md'
import GlobalUtil from '../../utils/GlobalUtil'

// 激活高级功能
const active = () => {
    if (window.location.search && window.location.search ===  "?" + GlobalUtil.getAdvanceKey()) {
        GlobalUtil.setAdvance();
    }
}

let PUBLIC_URL = process.env.PUBLIC_URL || '';

const Home = () => {
    const [source, setSource] = React.useState();

    React.useEffect(() => {
        active();
        if (source) {
            return;
        }
        fetch(ReadMeSource)
            .then(res => res.text())
            .then(content => setSource(content))
            .catch(e => console.error("fetch readme", e))
    }, [source]);

    if (!source) {
        return <Spin />
    }
    return (<MarkdownPreview
        source={source} 
        linkTarget='_blank'
        rehypeRewrite={(node, index, parent) => {
            if (node.tagName === "a") {
                if (parent && /^h(1|2|3|4|5|6)/.test(parent.tagName)) {
                    parent.children = parent.children.slice(1);
                } else if (node.properties?.href && node.properties.href.startsWith("#PUBLIC_URL")) {
                    node.properties.href = node.properties.href.replace("#PUBLIC_URL", PUBLIC_URL);
                }
            }
        }}
    />);
}
export default Home;