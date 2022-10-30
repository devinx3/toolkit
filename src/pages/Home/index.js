import React from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import ReadMeSource from './README.md'

const Home = () => {
    const [source, setSource] = React.useState();

    React.useEffect(() => {
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