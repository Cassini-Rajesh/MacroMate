'use client'

interface Props {
  label: string
  consumed: number
  target: number
  color: string
  unit: string
}

export default function MacroBar({ label, consumed, target, color, unit }: Props) {
  const pct = Math.min((consumed / target) * 100, 100)
  const over = consumed > target

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className={`text-sm font-bold ${over ? 'text-red-500' : 'text-gray-600'}`}>
          {consumed} / {target} {unit}
        </span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-red-400' : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
