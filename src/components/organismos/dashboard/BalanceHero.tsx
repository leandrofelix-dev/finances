import { ArrowDownCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import styles from "./dashboard.module.css";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type BalanceHeroProps = {
  balance: number;
  projectedMonthEnd: number;
  onDeposit?: () => void;
  onSend?: () => void;
};

export function BalanceHero({ balance, projectedMonthEnd, onDeposit, onSend }: BalanceHeroProps) {
  return (
    <article className={styles.balanceHero}>
      <div>
        <div className={styles.balanceLabel}>Saldo atual</div>
        <div className={styles.balanceValue}>{currency.format(balance)}</div>
        <div className={styles.balanceHint}>
          Projeção fim do mês: {currency.format(projectedMonthEnd)}
        </div>
      </div>
      <div className={styles.balanceActions}>
        <Button className="border-white bg-white text-primary hover:bg-white/90 hover:text-primary" onClick={onDeposit} type="button" variant="secondary">
          <ArrowDownCircle size={16} />
          Registrar entrada
        </Button>
        <Button className="bg-white/15 text-white hover:bg-white/25 hover:text-white" onClick={onSend} type="button" variant="secondary">
          <ShoppingCart size={16} />
          Registrar compra
        </Button>
      </div>
    </article>
  );
}
