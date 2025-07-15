import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Simple Next.js App',
  description: 'A dead-simple Next.js webapp',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}