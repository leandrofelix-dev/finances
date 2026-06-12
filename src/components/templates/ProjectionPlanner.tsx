"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { DateInput } from "@/components/moleculas/FormControls";
import styles from "./ProjectionPlanner.module.css";

type ProjectionEvent = {
  type: string;
  label: string;
  amount: number;
};

type ProjectionDay = {
  date: string;
  balance: number;
};

type EventGroup = {
  date: string;
  events: ProjectionEvent[];
};

type InstallmentEnding = {
  id: string;
  description: string;
  card: string;
  endsAt: string;
  totalInstallments: number;
};

type Projection = {
  targetDate: string;
  projectedBalance: number;
  points: ProjectionDay[];
  events: EventGroup[];
  installmentEndings: InstallmentEnding[];
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function defaultTargetDate() {
  const date = new Date();
  date.setMonth(date.getMonth() + 3);
  return date.toISOString().slice(0, 10);
}

export function ProjectionPlanner() {
  const [targetDate, setTargetDate] = useState(defaultTargetDate);
  const [projection, setProjection] = useState<Projection | null>(null);
  const [message, setMessage] = useState("Calculando projeção...");

  const loadProjection = useCallback(async (date: string) => {
    setMessage("Calculando projeção...");
    const response = await fetch(`/api/projections?targetDate=${date}`);

    if (!response.ok) {
      setMessage("Não foi possível calcular a projeção para essa data.");
      return;
    }

    setProjection(await response.json());
    setMessage("Projeção atualizada.");
  }, []);

  useEffect(() => {
    // Client-side bootstrap fetch for the selected projection range.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProjection(targetDate);
  }, [loadProjection, targetDate]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadProjection(targetDate);
  }

  const balances = projection?.points.map((point) => point.balance) ?? [];
  const min = Math.min(0, ...balances);
  const max = Math.max(1, ...balances);
  const range = max - min || 1;

  return (
    <div className={styles.page}>
      <section className="grid gap-4 lg:grid-cols-[1.4fr_auto]">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Simulação temporal</div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Projeções até uma data futura.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Veja como receitas recorrentes, despesas fixas com margem de variação e
            parcelamentos afetam o saldo previsto no caminho até o dia escolhido.
          </p>
        </div>
        <form className="flex items-center gap-2 self-start rounded-xl border border-border bg-card p-2 shadow-sm" onSubmit={submit}>
          <DateInput
            min={new Date().toISOString().slice(0, 10)}
            onChange={(event) => setTargetDate(event.target.value)}
            value={targetDate}
          />
          <Button type="submit">
            <RefreshCw size={16} />
            Recalcular
          </Button>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Saldo projetado" value={currency.format(projection?.projectedBalance ?? 0)} />
        <Metric label="Dias simulados" value={String(projection?.points.length ?? 0)} />
        <Metric label="Status" value={message} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Linha do tempo do saldo</CardTitle>
          <CardDescription>cada barra representa um dia</CardDescription>
        </CardHeader>
        {projection?.points.length ? (
          <CardContent>
            <div className={styles.chart} aria-label="Gráfico de saldo projetado diário">
            {projection.points.map((point) => {
              const height = 12 + ((point.balance - min) / range) * 88;
              return (
                <div
                  key={point.date}
                  className={styles.bar}
                  style={{ height: `${height}%` }}
                  title={`${dateFormatter.format(new Date(point.date))}: ${currency.format(point.balance)}`}
                />
              );
            })}
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <div className={styles.empty}>Sem dados suficientes para montar a linha do tempo.</div>
          </CardContent>
        )}
      </Card>

      <section className={styles.lists}>
        <Card>
          <CardHeader>
            <CardTitle>Eventos da projeção</CardTitle>
            <CardDescription>entradas e saídas previstas</CardDescription>
          </CardHeader>
          <CardContent>
            {projection?.events.length ? (
              projection.events.slice(0, 12).map((group) => (
                <div key={group.date} className={styles.event}>
                  <div className={styles.eventDate}>{dateFormatter.format(new Date(group.date))}</div>
                  <ul className={styles.eventItems}>
                    {group.events.map((event, index) => (
                      <li key={`${group.date}-${event.type}-${index}`}>
                        {event.label}{" "}
                        <strong className={event.amount >= 0 ? styles.positive : styles.negative}>
                          {currency.format(event.amount)}
                        </strong>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <div className={styles.empty}>Nenhum evento no intervalo.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fim dos parcelamentos</CardTitle>
            <CardDescription>mês em que cada compra termina</CardDescription>
          </CardHeader>
          <CardContent>
            {projection?.installmentEndings.length ? (
              projection.installmentEndings.map((ending) => (
                <div key={ending.id} className={styles.ending}>
                  <strong>{ending.description}</strong>
                  <div className={styles.endingDate}>
                    {ending.card} · {ending.totalInstallments} parcelas · termina em{" "}
                    {dateFormatter.format(new Date(ending.endsAt))}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.empty}>Nenhum parcelamento cadastrado.</div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="grid gap-1.5 p-5">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div className="text-xl font-bold tracking-tight text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}
