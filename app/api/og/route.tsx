import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: '#0A0A0A',
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            width: '140px',
            height: '140px',
            borderRadius: '70px',
            backgroundColor: '#D4A017',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '116px',
              height: '116px',
              borderRadius: '58px',
              backgroundColor: '#0A0A0A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                color: '#D4A017',
                fontSize: '60px',
                fontWeight: '700',
              }}
            >
              M
            </span>
          </div>
        </div>
        <div
          style={{
            color: '#FFFFFF',
            fontSize: '72px',
            fontWeight: '700',
            marginBottom: '20px',
          }}
        >
          MacroMate
        </div>
        <div
          style={{
            color: '#D4A017',
            fontSize: '32px',
            marginBottom: '12px',
          }}
        >
          AI Nutrition Tracker for College Students
        </div>
        <div
          style={{
            color: '#A0A0A0',
            fontSize: '24px',
          }}
        >
          Snap a photo · Track your macros · Hit your goals
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
