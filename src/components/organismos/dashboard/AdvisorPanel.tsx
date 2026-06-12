import Link from "next/link";
import { BarChart3, ChartPie, Tags } from "lucide-react";

import { Button } from "@/components/atoms/Button";
import { Card, CardContent } from "@/components/atoms/card";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type AdvisorPanelProps = {
  healthyDailySpend: number;
  daysRemaining: number;
  onShowCategories?: () => void;
  onShowCashflow?: () => void;
};

export function AdvisorPanel({
  healthyDailySpend,
  daysRemaining,
  onShowCategories,
  onShowCashflow,
}: AdvisorPanelProps) {
  return (
    <Card className="rounded-[var(--fynix-radius-lg)]">
      <CardContent className="grid gap-4 p-5">
        <h3 className="text-base font-bold text-foreground">Como posso ajudar?</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Acompanhe seu orçamento diário, revise categorias e projete saldo futuro com base nos
          seus dados reais.
        </p>
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm font-medium text-foreground">
          Gasto diário saudável: {currency.format(healthyDailySpend)} · {daysRemaining} dias restantes
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onShowCategories} type="button" variant="secondary">
            <Tags size={16} />
            Ver metas por categoria
          </Button>
          <Button render={<Link href="/projections" />} variant="secondary">
            <BarChart3 size={16} />
            Ir para projeções
          </Button>
          <Button onClick={onShowCashflow} type="button" variant="secondary">
            <ChartPie size={16} />
            Ver fluxo de caixa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
