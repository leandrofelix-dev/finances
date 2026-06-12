import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/atoms/table";

type Category = {
  name: string;
  color: string;
};

type Card = {
  name: string;
};

type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: "INFLOW" | "OUTFLOW";
  date: string;
  category?: Category | null;
  card?: Card | null;
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type RecentTransactionsTableProps = {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
};

export function RecentTransactionsTable({ transactions, onEdit }: RecentTransactionsTableProps) {
  if (!transactions.length) {
    return <div className="rounded-xl border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">Nenhuma movimentação registrada ainda.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Transação</TableHead>
          <TableHead>Conta</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow
            key={transaction.id}
            onClick={() => onEdit?.(transaction)}
            className={onEdit ? "cursor-pointer" : undefined}
          >
            <TableCell>
              <div className="grid gap-0.5">
                <span className="font-medium text-foreground">{transaction.description}</span>
                <span className="text-xs text-muted-foreground">{transaction.category?.name ?? "Sem categoria"}</span>
              </div>
            </TableCell>
            <TableCell>{transaction.card?.name ?? (transaction.type === "INFLOW" ? "Entrada" : "Conta")}</TableCell>
            <TableCell>{dateLabel(transaction.date)}</TableCell>
            <TableCell className={transaction.type === "INFLOW" ? "font-medium text-emerald-600" : "font-medium text-destructive"}>
              {transaction.type === "OUTFLOW" ? "-" : "+"}
              {currency.format(transaction.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
