'use client'

import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'

interface RiskProportionChartProps {
  total: number
  risk: number
}

export function RiskProportionChart({ total, risk }: RiskProportionChartProps) {
  const normal = Math.max(0, total - risk)
  
  const data = [
    { name: 'กลุ่มปกติ', value: normal, color: '#10b981' }, // emerald-500
    { name: 'กลุ่มเสี่ยง/เฝ้าระวัง', value: risk, color: '#f59e0b' } // amber-500
  ]

  if (total === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
        ไม่มีข้อมูล
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            itemStyle={{ color: '#0f172a', fontWeight: 500 }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
