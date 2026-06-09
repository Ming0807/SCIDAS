"use client";

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface RiskDonutChartProps {
  total: number;
  risk: number;
}

export function RiskDonutChart({ total, risk }: RiskDonutChartProps) {
  const safe = Math.max(0, total - risk);
  const data = [
    { name: 'กลุ่มปกติ', value: safe, color: '#10b981' }, // Emerald-500
    { name: 'กลุ่มเสี่ยง', value: risk, color: '#f43f5e' } // Rose-500
  ];

  // If there's no data, render an empty state
  if (total === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        ไม่มีข้อมูลนักเรียน
      </div>
    );
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
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ fontWeight: 'bold', color: '#374151' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-sm font-medium text-slate-700 ml-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
