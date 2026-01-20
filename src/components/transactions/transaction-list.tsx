"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ArrowDownRight, ArrowUpRight, ArrowRight } from "lucide-react"
import { EditTransactionDialog } from "./edit-transaction-dialog"

type Transaction = {
    id: string
    date: string
    description: string
    amount: number
    type: 'income' | 'expense' | 'transfer'
    category?: { name: string }
    project?: { name: string }
    account?: { name: string }
    paid_by?: { name: string }
}

export function TransactionList({ initialTransactions }: { initialTransactions: any[] }) {
    if (initialTransactions.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground border rounded-lg border-dashed">
                No transactions found. Add one to get started.
            </div>
        )
    }

    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Paid By</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                            <TableCell className="text-sm text-muted-foreground">
                                {format(new Date(tx.date), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="font-medium">{tx.description}</TableCell>
                            <TableCell>
                                {tx.project ? (
                                    <Badge variant="outline" className="text-xs">{tx.project.name}</Badge>
                                ) : '-'}
                            </TableCell>
                            <TableCell>{tx.category?.name || '-'}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{tx.account?.name || 'Cash'}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{tx.paid_by?.name || 'Me'}</TableCell>
                            <TableCell className="text-right">
                                <div className={`flex items-center justify-end font-bold ${tx.type === 'income' ? 'text-green-600' :
                                    tx.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                                    }`}>
                                    {tx.type === 'income' && <ArrowUpRight className="mr-1 h-3 w-3" />}
                                    {tx.type === 'expense' && <ArrowDownRight className="mr-1 h-3 w-3" />}
                                    {tx.type === 'transfer' && <ArrowRight className="mr-1 h-3 w-3" />}
                                    ${Number(tx.amount).toLocaleString()}
                                </div>
                            </TableCell>
                            <TableCell className="w-[50px]">
                                <EditTransactionDialog transaction={tx} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
