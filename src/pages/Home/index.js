import React from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import ReadMeSource from './home.md'
import GlobalUtil from '../../utils/GlobalUtil'

// 激活高级功能
const active = () => {
    if (window.location.hash.lastIndexOf(GlobalUtil.getAdvanceKey()) !== -1) {
        GlobalUtil.setAdvance();
    }
}

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

    return (<MarkdownPreview 
        source={source} 
        linkTarget='_blank'
        rehypeRewrite={(node, index, parent) => {
            if (node.tagName === "a" && parent && /^h(1|2|3|4|5|6)/.test(parent.tagName)) {
              parent.children = parent.children.slice(1)
            }
        }}
    />);
}
export default Home;