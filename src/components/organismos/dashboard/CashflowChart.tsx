"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "./dashboard.module.css";

export type CashflowPoint = {
  month: string;
  income: number;
  expense: number;
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type CashflowChartProps = {
  data: CashflowPoint[];
};

export function CashflowChart({ data }: CashflowChartProps) {
  if (!data.length) {
    return <div className={styles.empty}>Sem dados de fluxo de caixa ainda.</div>;
  }

  return (
    <div className={styles.chartWrap}>
      <ResponsiveContainer height="100%" width="100%">
        <BarChart barGap={4} data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
          <XAxis axisLine={false} dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} tickLine={false} />
          <YAxis
            axisLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            tickFormatter={(value) => currency.format(value).replace("R$", "R$ ")}
            tickLine={false}
            width={72}
          />
          <Tooltip
            formatter={(value) => currency.format(Number(value ?? 0))}
            labelStyle={{ color: "#111827", fontWeight: 600 }}
          />
          <Legend />
          <Bar dataKey="income" fill="#059669" name="Entradas" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expense" fill="#6ee7b7" name="Saídas" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
