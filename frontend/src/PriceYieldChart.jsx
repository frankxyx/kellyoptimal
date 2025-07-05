// frontend/src/PriceYieldChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceDot, ReferenceLine } from 'recharts';
import { makeCurve } from './bondUtils';
import { useMemo } from 'react';

export default function PriceYieldChart({ face, coupon, years, correctRate, correctPrice }) {
  const data = useMemo(() => makeCurve(face, coupon, years), [face, coupon, years]);

  return (
    <LineChart width={360} height={240} data={data} margin={{ top: 20, right: 35, left: 0, bottom: 10 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="yield" label={{ value: 'Yield %', position: 'insideBottomRight', offset: -5 }} />
      <YAxis label={{ value: 'Price £', angle: -90, position: 'insideLeft' }} />
      <Tooltip formatter={val => `£${val}`} />
      <Line
        type="monotone"
        dataKey="price"
        stroke="#8884d8"
        isAnimationActive={true}
        animationDuration={1000}
      />
      {/* vertical line at correct yield */}
      <ReferenceLine
        x={correctRate * 100}
        stroke="red"
        label={{ position: 'top', value: `You: ${Math.round(correctPrice)}£` }}
      />
      {/* dot at the exact (yield,price) */}
      <ReferenceDot
        x={correctRate * 100}
        y={correctPrice}
        r={5}
        fill="red"
        stroke="none"
      />
    </LineChart>
  );
}
