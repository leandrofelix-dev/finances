import { Card, CardContent } from "@/components/atoms/card";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type MetricCardsProps = {
  income: number;
  expense: number;
  projected: number;
};

export function MetricCards({ income, expense, projected }: MetricCardsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Card className="rounded-[var(--fynix-radius-lg)]">
        <CardContent className="grid gap-2 p-5">
          <div className="text-sm font-medium text-muted-foreground">Entradas</div>
          <div className="text-2xl font-bold tracking-tight text-foreground">{currency.format(income)}</div>
          <div className="text-sm text-muted-foreground">Orçamento de gastos</div>
        </CardContent>
      </Card>
      <Card className="rounded-[var(--fynix-radius-lg)]">
        <CardContent className="grid gap-2 p-5">
          <div className="text-sm font-medium text-muted-foreground">Saídas</div>
          <div className="text-2xl font-bold tracking-tight text-foreground">{currency.format(expense)}</div>
          <div className="text-sm text-muted-foreground">Já registradas no mês</div>
        </CardContent>
      </Card>
      <Card className="rounded-[var(--fynix-radius-lg)]">
        <CardContent className="grid gap-2 p-5">
          <div className="text-sm font-medium text-muted-foreground">Fim do mês</div>
          <div className="text-2xl font-bold tracking-tight text-foreground">{currency.format(projected)}</div>
          <div className="text-sm text-muted-foreground">Projeção com compromissos</div>
        </CardContent>
      </Card>
    </div>
  );
}
