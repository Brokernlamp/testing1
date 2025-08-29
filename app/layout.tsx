import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientRoot from '@/components/ClientRoot'
import Image from 'next/image'

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
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto h-14 px-4 flex items-center justify-between">
            <a href="/" className="text-sm font-semibold">Shree Krishna Signs</a>
            <a href="/" className="inline-flex items-center">
              <Image src="/logo.png" alt="SKS" width={40} height={40} priority />
            </a>
          </div>
        </header>
        <ClientRoot>
          {children}
        </ClientRoot>
      </body>
    </html>
  )
}
