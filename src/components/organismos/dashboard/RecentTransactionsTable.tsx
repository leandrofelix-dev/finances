import {
  CardTag,
  ColumnHead,
  DateCell,
  DescriptionCell,
  EmptyTableState,
  MoneyCell,
  TextCell,
} from "@/components/moleculas/TableColumns";
import { Table, TableBody, TableHeader, TableRow } from "@/components/atoms/table";

type Category = {
  name: string;
  color: string;
};

type Card = {
  name: string;
  color?: string | null;
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

type RecentTransactionsTableProps = {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
};

export function RecentTransactionsTable({ transactions, onEdit }: RecentTransactionsTableProps) {
  if (!transactions.length) {
    return <EmptyTableState message="Nenhuma movimentação registrada ainda." />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <ColumnHead kind="description" label="Transação" />
          <ColumnHead kind="card" label="Conta" />
          <ColumnHead kind="date" />
          <ColumnHead kind="money" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow
            key={transaction.id}
            className={onEdit ? "cursor-pointer" : undefined}
            onClick={() => onEdit?.(transaction)}
          >
            <DescriptionCell
              subtitle={transaction.category?.name ?? "Sem categoria"}
              title={transaction.description}
            />
            <TextCell>
              {transaction.card ? (
                <CardTag color={transaction.card.color} name={transaction.card.name} />
              ) : (
                transaction.type === "INFLOW" ? "Entrada" : "Conta"
              )}
            </TextCell>
            <DateCell format="datetime" value={transaction.date} />
            <MoneyCell
              tone={transaction.type === "INFLOW" ? "positive" : "negative"}
              value={transaction.amount}
            />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
