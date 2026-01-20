"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function CreateAccountDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const [name, setName] = useState("")
    const [type, setType] = useState("bank")
    const [currency, setCurrency] = useState("COP")
    const [balance, setBalance] = useState("0")
    const [creditLimit, setCreditLimit] = useState("")
    const [cutoffDay, setCutoffDay] = useState("")
    const [paymentDay, setPaymentDay] = useState("")


    const handleCreate = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user!.id).single()

        if (profile) {
            const { error } = await supabase.from('accounts').insert({
                tenant_id: profile.tenant_id,
                name,
                type,
                currency,
                balance: parseFloat(balance),
                credit_limit: creditLimit ? parseFloat(creditLimit) : null,
                cutoff_day: cutoffDay ? parseInt(cutoffDay) : null,
                payment_day: paymentDay ? parseInt(paymentDay) : null
            })

            if (!error) {
                setOpen(false)
                resetForm()
                router.refresh()
            } else {
                alert(error.message)
            }
        }
        setLoading(false)
    }

    const resetForm = () => {
        setName("")
        setType("bank")
        setBalance("0")
        setCreditLimit("")
        setCutoffDay("")
        setPaymentDay("")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Account
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Account</DialogTitle>
                    <DialogDescription>
                        Add a new bank account, wallet, or credit card.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Main Bank" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bank">Bank Account</SelectItem>
                                    <SelectItem value="credit_card">Credit Card</SelectItem>
                                    <SelectItem value="wallet">Virtual Wallet</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="investment">Investment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Currency</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="COP">COP</SelectItem>
                                    <SelectItem value="USD">USD</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="balance">Initial Balance / Current Debt</Label>
                        <Input id="balance" type="number" value={balance} onChange={(e) => setBalance(e.target.value)} />
                    </div>

                    {type === 'credit_card' && (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="limit">Credit Limit</Label>
                                <Input id="limit" type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="cutoff">Cutoff Day</Label>
                                    <Input id="cutoff" type="number" min="1" max="31" value={cutoffDay} onChange={(e) => setCutoffDay(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="payment">Payment Day</Label>
                                    <Input id="payment" type="number" min="1" max="31" value={paymentDay} onChange={(e) => setPaymentDay(e.target.value)} />
                                </div>
                            </div>
                        </>
                    )}

                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleCreate} disabled={loading}>{loading ? "Saving..." : "Save Account"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
