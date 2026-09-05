import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'

interface HealthGaugeProps {
  score: number
}

function getColor(score: number) {
  if (score >= 75) return '#10B981'
  if (score >= 50) return '#F59E0B'
  return '#EF4444'
}

function getLabel(score: number) {
  if (score >= 75) return 'Saudável'
  if (score >= 50) return 'Atenção'
  return 'Crítico'
}

export function HealthGauge({ score }: HealthGaugeProps) {
  const color = getColor(score)
  const label = getLabel(score)
  const data = [{ value: score, fill: color }]

  return (
    <div className="relative flex flex-col items-center">
      <div className="w-36 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="70%" outerRadius="100%"
            startAngle={220} endAngle={-40}
            data={data}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={8}
              background={{ fill: '#2A2A3E' }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-semibold mt-1" style={{ color }}>{label}</span>
    </div>
  )
}
