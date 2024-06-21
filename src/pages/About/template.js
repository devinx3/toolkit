import React from 'react';
import { Spin } from 'antd';
import MarkdownPreview from '@uiw/react-markdown-preview';

let IMAGE_URL = '';

const Template = ({ file }) => {
    const [source, setSource] = React.useState();
    React.useEffect(() => {
        if (source) {
            return;
        }
        if (!IMAGE_URL) {
            IMAGE_URL = window.location.href.substring(0, window.location.href.indexOf('#')) + "images";
        }
        fetch(file)
            .then(res => res.text())
            .then(content => setSource(content))
            .catch(e => console.error("fetch file error", e));
    }, [source, file]);

    if (!source) {
        return <Spin />
    }
    return (<MarkdownPreview
        source={source}
        linkTarget='_blank'
        rehypeRewrite={(node, index, parent) => {
            if (node.tagName === "a" && parent && /^h(1|2|3|4|5|6)/.test(parent.tagName)) {
                parent.children = parent.children.slice(1)
            } else if (node.tagName === "img" && /^#IMAGE_PREFIX.*/.test(node.properties?.src)) {
                node.properties.src = node.properties.src.replace("#IMAGE_PREFIX", IMAGE_URL)
            }
        }}
    />);
}

export default Template;