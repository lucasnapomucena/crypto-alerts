import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction } from "@/interfaces/transactions";
import { TableVirtuoso } from "react-virtuoso";

interface TransactionsListProps {
  transactions: Transaction[];
}

export const TransactionsList = ({ transactions }: TransactionsListProps) => {
  return (
    <TableVirtuoso
      style={{ height: "calc(100vh - 100px)" }}
      data={transactions}
      components={{
        Scroller: (props) => <div {...props} className="overflow-auto" />,
        Table: (props) => <Table {...props} />,
        TableHead: (props) => <TableHeader {...props} />,
        TableRow: (props) => <TableRow {...props} />,
        TableBody: (props) => <TableBody {...props} />,
      }}
      fixedHeaderContent={() => (
        <TableRow>
          <TableHead>Action</TableHead>
          <TableHead>M</TableHead>
          <TableHead>FSYM</TableHead>
          <TableHead>TSYM</TableHead>
          <TableHead>P</TableHead>
          <TableHead>CCSEQ</TableHead>
          <TableHead>TYPE</TableHead>
          <TableHead>SIDE</TableHead>
          <TableHead>Q</TableHead>
          <TableHead>SEQ</TableHead>
          <TableHead>REPORTEDNS</TableHead>
          <TableHead>DELAYNS</TableHead>
        </TableRow>
      )}
      itemContent={(_, transaction) => (
        <>
          <TableCell>{transaction.ACTION}</TableCell>
          <TableCell>{transaction.M}</TableCell>
          <TableCell>{transaction.FSYM}</TableCell>
          <TableCell>{transaction.TSYM}</TableCell>
          <TableCell>{transaction.P}</TableCell>
          <TableCell>{transaction.CCSEQ}</TableCell>
          <TableCell>{transaction.TYPE}</TableCell>
          <TableCell>{transaction.SIDE}</TableCell>
          <TableCell>{transaction.Q}</TableCell>
          <TableCell>{transaction.SEQ}</TableCell>
          <TableCell>{transaction.REPORTEDNS}</TableCell>
          <TableCell>{transaction.DELAYNS}</TableCell>
        </>
      )}
    />
  );
};
