"use client"

import { useState, useEffect } from "react"
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
import { CalendarIcon, Pencil } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

type Option = { id: string, name: string }

interface EditTransactionDialogProps {
    transaction: {
        id: string
        date: string
        description: string
        amount: number
        type: 'income' | 'expense' | 'transfer'
        category_id?: string
        project_id?: string
        account_id?: string
        paid_by_partner_id?: string
    }
}

export function EditTransactionDialog({ transaction }: EditTransactionDialogProps) {
    const [open, setOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    // Form State
    const [items, setItems] = useState<{
        projects: Option[],
        categories: Option[],
        accounts: Option[],
        partners: Option[]
    }>({ projects: [], categories: [], accounts: [], partners: [] })

    const [amount, setAmount] = useState(transaction.amount?.toString() || "")
    const [description, setDescription] = useState(transaction.description || "")
    const [date, setDate] = useState<Date>(new Date(transaction.date))
    const [type, setType] = useState<"income" | "expense">(transaction.type as "income" | "expense")
    const [categoryId, setCategoryId] = useState<string>(transaction.category_id || "")
    const [projectId, setProjectId] = useState<string>(transaction.project_id || "")
    const [accountId, setAccountId] = useState<string>(transaction.account_id || "")
    const [paidBy, setPaidBy] = useState<string>(transaction.paid_by_partner_id || "")

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
                if (!profile?.tenant_id) return

                const tenantId = profile.tenant_id

                const [projectsRes, categoriesRes, accountsRes, partnersRes] = await Promise.all([
                    supabase.from('projects').select('id, name').eq('tenant_id', tenantId).eq('status', 'active'),
                    supabase.from('categories').select('id, name').eq('tenant_id', tenantId).eq('type', type),
                    supabase.from('accounts').select('id, name').eq('tenant_id', tenantId),
                    supabase.from('partners').select('id, name').eq('tenant_id', tenantId)
                ])

                setItems({
                    projects: projectsRes.data || [],
                    categories: categoriesRes.data || [],
                    accounts: accountsRes.data || [],
                    partners: partnersRes.data || []
                })
            }
            fetchData()
        }
    }, [open, type]) // Refetch categories if type changes

    const handleSave = async () => {
        setIsProcessing(true)
        try {
            const { error } = await supabase.from('transactions').update({
                date: date.toISOString(),
                amount: parseFloat(amount),
                description,
                type,
                category_id: categoryId || null,
                project_id: (projectId && projectId !== "none") ? projectId : null,
                account_id: accountId || null,
                paid_by_partner_id: (paidBy && paidBy !== "me") ? paidBy : null,
            }).eq('id', transaction.id)

            if (error) throw error

            setOpen(false)
            router.refresh()
        } catch (err: any) {
            console.error(err)
            alert("Error updating: " + err.message)
        } finally {
            setIsProcessing(false)
        }
    }

    // Re-sync if prop updates (unlikely given keying normally, but good practice)
    useEffect(() => {
        setAmount(transaction.amount?.toString() || "")
        setDescription(transaction.description || "")
        setDate(new Date(transaction.date))
        setType(transaction.type as "income" | "expense")
        setCategoryId(transaction.category_id || "")
        setProjectId(transaction.project_id || "")
        setAccountId(transaction.account_id || "")
        setPaidBy(transaction.paid_by_partner_id || "")
    }, [transaction])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted">
                    <Pencil className="h-3 w-3 text-muted-foreground" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Transaction</DialogTitle>
                    <DialogDescription>Modify transaction details.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex justify-center mb-4">
                        <div className="bg-muted p-1 rounded-lg flex">
                            <button
                                onClick={() => setType("expense")}
                                className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", type === "expense" ? "bg-white shadow-sm text-red-600" : "text-muted-foreground hover:text-foreground")}
                            >
                                Expense
                            </button>
                            <button
                                onClick={() => setType("income")}
                                className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", type === "income" ? "bg-white shadow-sm text-green-600" : "text-muted-foreground hover:text-foreground")}
                            >
                                Income
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Amount</Label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="text-lg font-bold"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn("w-full justify-start text-left font-normal")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(date, "PPP")}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Category</Label>
                            <Select value={categoryId} onValueChange={setCategoryId}>
                                <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
                                <SelectContent>
                                    {items.categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Account</Label>
                            <Select value={accountId} onValueChange={setAccountId}>
                                <SelectTrigger><SelectValue placeholder="Select account..." /></SelectTrigger>
                                <SelectContent>
                                    {items.accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Project</Label>
                            <Select value={projectId} onValueChange={setProjectId}>
                                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {items.projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Paid By</Label>
                            <Select value={paidBy} onValueChange={setPaidBy}>
                                <SelectTrigger><SelectValue placeholder="Me" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="me">Me</SelectItem>
                                    {items.partners.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="submit" onClick={handleSave} disabled={isProcessing}>
                        {isProcessing ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
