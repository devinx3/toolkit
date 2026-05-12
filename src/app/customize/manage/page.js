'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const CustomizeManagePage = dynamic(() => import('../../../components/Customization/Manage'), { ssr: false })

export default function CustomizeManage() {
  return <CustomizeManagePage />
}
