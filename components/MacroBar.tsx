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
        <span className="text-sm font-semibold text-textPrimary">{label}</span>
        <span className={`text-sm font-bold ${over ? 'text-danger' : 'text-textSecondary'}`}>
          {consumed} / {target} {unit}
        </span>
      </div>
      <div className="h-3 bg-surface2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-danger' : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
