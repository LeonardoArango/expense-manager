import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FinancialOverview } from "@/components/dashboard/FinancialOverview"
import { QuickAddTransaction } from "@/components/transactions/QuickAddTransaction"

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect("/auth/login")
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Financial Pulse</h2>
                <div className="flex items-center space-x-2">
                    <QuickAddTransaction />
                </div>
            </div>
            <FinancialOverview />
        </div>
    )
}
