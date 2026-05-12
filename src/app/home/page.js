'use client'

import React from 'react'
import homeMD from './home.md'
import MarkdownTemplate from '../../components/common/MarkdownTemplate'
import GlobalUtil from '../../utils/GlobalUtil'

// 激活高级功能
const active = () => {
  if (typeof window !== 'undefined' && window.location.hash.lastIndexOf(GlobalUtil.getAdvanceKey()) !== -1) {
    GlobalUtil.setAdvance()
  }
}

export default function Home() {
  const [source, setSource] = React.useState()

  React.useEffect(() => {
    active()
    if (source) return
    setSource(homeMD)
  }, [source])

  if (!source) return null
  return <MarkdownTemplate file={source} />
}
