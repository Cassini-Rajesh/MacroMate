import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MacroMate — AI Nutrition Tracker for College Students',
  description: 'Track your macros in seconds. Just snap a photo. Built for college students who actually care about what they eat.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-primary text-textPrimary antialiased">
        {children}
      </body>
    </html>
  )
}
