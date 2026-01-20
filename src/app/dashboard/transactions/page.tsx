import { createClient } from "@/lib/supabase/server"
import { TransactionList } from "@/components/transactions/transaction-list"
import { QuickAddTransaction } from "@/components/transactions/QuickAddTransaction"

export default async function TransactionsPage() {
    const supabase = await createClient()

    // Fetch transactions with related data
    const { data: transactions, error } = await supabase
        .from("transactions")
        .select(`
      *,
      category:categories(name, type),
      account:accounts(name),
      project:projects(name),
      paid_by:partners(name)
    `)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
                <QuickAddTransaction />
            </div>
            <TransactionList initialTransactions={transactions || []} />
        </div>
    )
}
