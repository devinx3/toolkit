'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const TextEditPage = dynamic(() => import('../../../components/Text/Edit'), { ssr: false })

export default function TextEdit() {
  return <TextEditPage />
}
