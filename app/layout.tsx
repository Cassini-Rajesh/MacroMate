import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MacroMate — AI Nutrition Tracker for College Students',
  description: 'Track your macros in seconds. Just snap a photo. Built for college students who actually care about what they eat.',
  openGraph: {
    title: 'MacroMate — AI Nutrition Tracker',
    description: 'Track your macros in seconds. Just snap a photo.',
    url: 'https://macro-mate-three.vercel.app',
    siteName: 'MacroMate',
    images: [
      {
        url: 'https://macro-mate-three.vercel.app/api/og',
        width: 1200,
        height: 630,
        alt: 'MacroMate AI Nutrition Tracker',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MacroMate — AI Nutrition Tracker',
    description: 'Track your macros in seconds. Just snap a photo.',
    images: ['https://macro-mate-three.vercel.app/api/og'],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/api/og" />
      </head>
      <body className="bg-primary text-textPrimary antialiased">
        {children}
      </body>
    </html>
  )
}
