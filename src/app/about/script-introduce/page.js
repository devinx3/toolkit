'use client'

import React from 'react'
import scriptIntroduceMD from './scriptIntroduce.md'
import MarkdownTemplate from '../../../components/common/MarkdownTemplate'

export default function AboutScriptIntroduce() {
  return <MarkdownTemplate file={scriptIntroduceMD} />
}
