'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import CustomizeTemplate from '../../../../components/Customization/Template'

export default function CustomizeCategory() {
  const params = useParams()
  if (!params?.category) {
    return <div>分类未找到</div>
  }
  return <CustomizeTemplate category={params.category} />
}
