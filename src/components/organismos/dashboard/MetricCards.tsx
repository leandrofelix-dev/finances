import { Card, CardContent } from "@/components/atoms/card";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type MetricCardsProps = {
  income: number;
  expense: number;
  financeScore: {
    score: number;
    label: string;
    hint: string;
  };
  projected: number;
};

function projectedColor(projected: number) {
  if (projected > 1000) return "text-emerald-600";
  if (projected >= 500) return "text-yellow-600";
  if (projected >= 0) return "text-orange-500";
  return "text-red-400";
}

export function MetricCards({ financeScore, income, expense, projected }: MetricCardsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-[minmax(180px,0.8fr)_minmax(260px,1.2fr)]">
      <div className="grid gap-3">
        <Card className="rounded-[var(--fynix-radius-lg)]">
          <CardContent className="grid gap-2 p-5">
            <div className="text-sm font-medium text-muted-foreground">Entradas</div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">{currency.format(income)}</div>
            <div className="text-sm text-muted-foreground">Até a data de hoje</div>
          </CardContent>
        </Card>
        <Card className="rounded-[var(--fynix-radius-lg)]">
          <CardContent className="grid gap-2 p-5">
            <div className="text-sm font-medium text-muted-foreground">Saídas</div>
            <div className="text-2xl font-bold tracking-tight text-red-400">{currency.format(expense)}</div>
            <div className="text-sm text-muted-foreground">Até a data de hoje</div>
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-[var(--fynix-radius-lg)]">
        <CardContent className="grid gap-3 p-5">
          <div className="grid gap-2">
            <div className="text-sm font-medium text-muted-foreground">Projeção para o fim do mês</div>
            <div className={`text-2xl font-bold tracking-tight ${projectedColor(projected)}`}>
              {currency.format(projected)}
            </div>
            <div className="text-sm text-muted-foreground">Considerando gastos previstos</div>
          </div>
          <div className="border-t border-border pt-3">
            <div className="text-sm font-medium text-muted-foreground">Qualidade financeira</div>
            <div className="mt-1 text-lg font-bold tracking-tight text-foreground">{financeScore.label}</div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${financeScore.score}%` }} />
          </div>
          <div className="text-sm text-muted-foreground">{financeScore.hint}</div>
        </CardContent>
      </Card>
    </div>
  );
}
