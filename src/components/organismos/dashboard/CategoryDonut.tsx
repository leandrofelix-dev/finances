"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import styles from "./dashboard.module.css";

type CategorySlice = {
  id: string;
  name: string;
  color: string;
  spent: number;
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type CategoryDonutProps = {
  categories: CategorySlice[];
};

export function CategoryDonut({ categories }: CategoryDonutProps) {
  const slices = categories.filter((category) => category.spent > 0);

  if (!slices.length) {
    return <div className={styles.empty}>Sem gastos por categoria neste mês.</div>;
  }

  const total = slices.reduce((sum, slice) => sum + slice.spent, 0);

  return (
    <div className={styles.donutWrap}>
      <div className={styles.donutChart}>
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie
              cx="50%"
              cy="50%"
              data={slices}
              dataKey="spent"
              innerRadius={58}
              nameKey="name"
              outerRadius={88}
              paddingAngle={2}
            >
              {slices.map((slice) => (
                <Cell fill={slice.color} key={slice.id} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => currency.format(Number(value ?? 0))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.legend}>
        {slices.map((slice) => (
          <div className={styles.legendItem} key={slice.id}>
            <span className={styles.legendDot} style={{ background: slice.color }} />
            <span>
              {slice.name} ({Math.round((slice.spent / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
