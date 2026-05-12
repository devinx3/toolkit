'use client'

import React from 'react'
import { Spin } from 'antd'
import MarkdownPreview from '@uiw/react-markdown-preview'

const MarkdownTemplate = ({ file }) => {
  const [source, setSource] = React.useState()
  React.useEffect(() => {
    if (source) return
    setSource(file)
  }, [source, file])

  if (!source) return <Spin />
  return (
    <MarkdownPreview
      source={source}
      linkTarget="_blank"
      rehypeRewrite={(node, index, parent) => {
        if (node.tagName === 'a' && parent && /^h(1|2|3|4|5|6)/.test(parent.tagName)) {
          parent.children = parent.children.slice(1)
        }
      }}
    />
  )
}

export default MarkdownTemplate
