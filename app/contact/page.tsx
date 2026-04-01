'use client'

import Link from 'next/link'
import Logo from '../../components/Logo'
import { useState } from 'react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name && email && message) {
      setSubmitted(true)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-black text-xl text-gray-900">MacroMate</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-gray-600 font-medium hover:text-gray-900 transition-colors px-3 py-2">
              Home
            </Link>
            <Link href="/how-it-works" className="text-gray-600 font-medium hover:text-gray-900 transition-colors px-3 py-2">
              How It Works
            </Link>
            <Link href="/about" className="text-gray-600 font-medium hover:text-gray-900 transition-colors px-3 py-2">
              About
            </Link>
            <Link href="/contact" className="text-green-500 font-medium hover:text-green-600 transition-colors px-3 py-2">
              Contact
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-600 font-medium hover:text-gray-900 transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/signup" className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl font-black text-gray-900 text-center mb-4">
            Get in touch
          </h1>
          <p className="text-xl text-gray-500 text-center mb-12">
            Have a question, feedback, or want to partner with us? We&apos;d love to hear from you.
          </p>

          {submitted ? (
            <div className="bg-green-100 border border-green-300 text-green-700 px-6 py-4 rounded-lg text-center">
              Thanks for reaching out! We&apos;ll get back to you within 24 hours.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Send Message
              </button>
            </form>
          )}

          <div className="mt-12 text-center text-gray-600">
            <p className="mb-2">
              <strong>Email:</strong> macromate.app@gmail.com
            </p>
            <p>
              <strong>Built at Penn State University</strong>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}