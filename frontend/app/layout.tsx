import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'E-Shop | 发现全球好物',
  description: '现代、极简、高品质的在线购物商城，为您提供最优质的商品和服务。',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased text-gray-900 bg-[#fafafa]">{children}</body>
    </html>
  )
}
