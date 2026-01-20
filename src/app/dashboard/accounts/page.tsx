import { createClient } from "@/lib/supabase/server"
import { AccountList } from "@/components/finance/account-list"
import { CreateAccountDialog } from "@/components/finance/create-account-dialog"

export default async function AccountsPage() {
    const supabase = await createClient()
    const { data: accounts } = await supabase.from("accounts").select("*").order("name")

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
                <CreateAccountDialog />
            </div>
            <AccountList initialAccounts={accounts || []} />
        </div>
    )
}
