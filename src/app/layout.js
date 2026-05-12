import './globals.css'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import MainLayout from './_init/MainLayout'

export const metadata = {
  title: 'Devinx3 工具箱',
  description: 'Devinx3 Toolkit - 在线工具集',
  icons: {
    icon: '/favicon.ico',
    apple: '/logo128.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <AntdRegistry>
          <MainLayout>{children}</MainLayout>
        </AntdRegistry>
      </body>
    </html>
  )
}
