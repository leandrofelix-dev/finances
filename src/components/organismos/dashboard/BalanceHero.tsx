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
        <button className={styles.balanceButton} onClick={onDeposit} type="button">
          Registrar entrada
        </button>
        <button className={styles.balanceButtonOutline} onClick={onSend} type="button">
          Registrar compra
        </button>
      </div>
    </article>
  );
}
