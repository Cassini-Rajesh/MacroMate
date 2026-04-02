import { ImageResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (ImageResponse as any)(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0A0A',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '999px',
            backgroundColor: '#D4A017',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '999px',
              backgroundColor: '#0A0A0A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                color: '#D4A017',
                fontSize: '52px',
                fontWeight: 'bold',
                lineHeight: 1,
              }}
            >
              M
            </span>
          </div>
        </div>
        <div
          style={{
            marginTop: '42px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '18px',
          }}
        >
          <div style={{ color: '#FFFFFF', fontSize: '64px', fontWeight: 'bold' }}>
            MacroMate
          </div>
          <div style={{ color: '#D4A017', fontSize: '28px', fontWeight: 600 }}>
            AI Nutrition Tracker for College Students
          </div>
          <div style={{ color: '#A0A0A0', fontSize: '20px', fontWeight: 500 }}>
            snap a photo · track macros · hit your goals
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
