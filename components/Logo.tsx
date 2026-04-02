import React from 'react'

export default function Logo() {
  return (
    <svg width="40" height="40" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-label="MacroMate logo">
      <circle cx="40" cy="40" r="38" fill="#D4A017" />
      <circle cx="40" cy="40" r="32" fill="#0A0A0A" />
      <path
        d="M22 54 L22 30 L33 46 L40 34 L47 46 L58 30 L58 54"
        fill="none"
        stroke="#D4A017"
        stroke-width="3.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="40" cy="26" r="4" fill="#D4A017" />
    </svg>
  )
}
