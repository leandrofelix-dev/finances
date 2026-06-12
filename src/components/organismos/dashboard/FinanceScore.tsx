import { Card, CardContent } from "@/components/atoms/card";

type FinanceScoreProps = {
  score: number;
  label: string;
  hint: string;
};

export function FinanceScore({ score, label, hint }: FinanceScoreProps) {
  return (
    <Card className="rounded-[var(--fynix-radius-lg)]">
      <CardContent className="grid gap-3 p-5">
        <div>
          <div className="text-sm font-medium text-muted-foreground">Qualidade financeira</div>
          <div className="text-2xl font-bold tracking-tight text-foreground">{label}</div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} />
        </div>
        <div className="text-sm text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  );
}

export function computeFinanceScore(
  categoryUsage: number[],
  balanceNow: number
): { score: number; label: string; hint: string } {
  const withTargets = categoryUsage.filter((usage) => usage > 0);
  const usageAverage =
    withTargets.length > 0
      ? withTargets.reduce((sum, usage) => sum + usage, 0) / withTargets.length
      : 50;

  let score = Math.round(100 - usageAverage * 0.6);
  if (balanceNow < 0) score -= 20;
  if (balanceNow > 0) score += 8;
  score = Math.max(0, Math.min(100, score));

  let label = "Regular";
  if (score >= 85) label = "Excelente";
  else if (score >= 70) label = "Boa";
  else if (score >= 50) label = "Atenção";

  const hint =
    balanceNow < 0
      ? "Saldo negativo neste mês. Revise gastos fixos e parcelamentos."
      : withTargets.length === 0
        ? "Cadastre metas por categoria para acompanhar sua saúde financeira."
        : "Baseado no uso das metas por categoria e no saldo atual.";

  return { score, label, hint };
}
