"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Wallet, Landmark, Banknote } from "lucide-react"

type Account = {
    id: string
    name: string
    type: string
    balance: number
    currency: string
    credit_limit?: number
    cutoff_day?: number
    payment_day?: number
}

export function AccountList({ initialAccounts }: { initialAccounts: Account[] }) {
    if (initialAccounts.length === 0) {
        return (
            <div className="flex h-[200px] shrink-0 items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">No accounts configured.</p>
            </div>
        )
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'bank': return <Landmark className="h-4 w-4" />
            case 'credit_card': return <CreditCard className="h-4 w-4" />
            case 'wallet': return <Wallet className="h-4 w-4" />
            case 'cash': return <Banknote className="h-4 w-4" />
            default: return <Wallet className="h-4 w-4" />
        }
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {initialAccounts.map((account) => (
                <Card key={account.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {account.name}
                        </CardTitle>
                        {getIcon(account.type)}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {account.currency} ${account.balance.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground capitalize mt-1">
                            {account.type.replace('_', ' ')}
                        </p>
                        {account.type === 'credit_card' && (
                            <div className="mt-2 text-xs text-muted-foreground">
                                Limit: ${account.credit_limit?.toLocaleString()} <br />
                                Cutoff: {account.cutoff_day}th
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
