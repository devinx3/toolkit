'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const JsonEditPage = dynamic(() => import('../../../components/Json/Edit'), { ssr: false })

export default function JsonEdit() {
  return <JsonEditPage />
}
