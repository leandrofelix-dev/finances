import Link from "next/link";

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
            Ver metas por categoria
          </Button>
          <Link
            className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            href="/projections"
          >
            Ir para projeções
          </Link>
          <Button onClick={onShowCashflow} type="button" variant="secondary">
            Ver fluxo de caixa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
