import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientRoot from '@/components/ClientRoot'
import SiteChrome from '@/components/SiteChrome'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Shree Krishna Signs - Business Automation System',
  description: 'High-quality signage and printing solutions since 1991',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientRoot>
          <SiteChrome>
            {children}
          </SiteChrome>
        </ClientRoot>
      </body>
    </html>
  )
}
