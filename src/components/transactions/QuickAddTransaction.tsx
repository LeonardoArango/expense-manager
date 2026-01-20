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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Plus, Users, CalendarIcon, Repeat } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { CreatableSelect } from "@/components/ui/creatable-select"
import { RRule } from "rrule"

type Option = { id: string, name: string }

export function QuickAddTransaction() {
    const [open, setOpen] = useState(false)
    const [isAiMode, setIsAiMode] = useState(false) // Default to manual for functionality first
    const [naturalInput, setNaturalInput] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)

    // Form State
    const [items, setItems] = useState<{
        projects: Option[],
        categories: Option[],
        accounts: Option[],
        partners: Option[]
    }>({ projects: [], categories: [], accounts: [], partners: [] })

    const [amount, setAmount] = useState("")
    const [description, setDescription] = useState("")
    const [date, setDate] = useState<Date>(new Date())
    const [type, setType] = useState<"income" | "expense">("expense")
    const [categoryId, setCategoryId] = useState<string>("")
    const [projectId, setProjectId] = useState<string>("")
    const [accountId, setAccountId] = useState<string>("")
    const [paidBy, setPaidBy] = useState<string>("") // If empty, assume current user

    // Recurrence State
    const [isRecurring, setIsRecurring] = useState(false)
    const [freq, setFreq] = useState<string>("MONTHLY")
    const [interval, setInterval] = useState("1")
    const [weekDays, setWeekDays] = useState<string[]>([])
    const [recurrenceEnd, setRecurrenceEnd] = useState<Date | undefined>(undefined)

    const supabase = createClient()
    const router = useRouter()

    // Fetch lists when dialog opens
    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
                if (!profile) return

                const tenantId = profile.tenant_id

                // Parallel fetching
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
    }, [open, type]) // Re-fetch categories when type changes

    const handleSave = async () => {
        setIsProcessing(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user!.id).single()

            if (!profile || !profile.tenant_id) {
                alert("Error: User profile or tenant missing.")
                throw new Error("Profile error")
            }

            // 1. Create the Transaction (First instance)
            const { error } = await supabase.from('transactions').insert({
                tenant_id: profile.tenant_id,
                created_at: new Date().toISOString(),
                date: date.toISOString(),
                amount: parseFloat(amount),
                description,
                type,
                category_id: categoryId || null,
                project_id: (projectId && projectId !== "none") ? projectId : null,
                account_id: accountId || null,
                paid_by_partner_id: (paidBy && paidBy !== "me") ? paidBy : null,
                status: 'paid'
            })

            if (error) throw error

            // 2. Create Recurring Transaction if enabled
            if (isRecurring) {
                // Build RRule
                const rruleOptions: any = {
                    freq: RRule[freq as keyof typeof RRule],
                    interval: parseInt(interval),
                    dtstart: date,
                }
                if (recurrenceEnd) {
                    rruleOptions.until = recurrenceEnd
                }
                if (freq === 'WEEKLY' && weekDays.length > 0) {
                    rruleOptions.byweekday = weekDays.map(d => RRule[d as keyof typeof RRule])
                }

                const rule = new RRule(rruleOptions)
                const ruleString = rule.toString()

                const { error: recError } = await supabase.from('recurring_transactions').insert({
                    tenant_id: profile.tenant_id,
                    description,
                    amount: parseFloat(amount),
                    type,
                    category_id: categoryId || null,
                    project_id: (projectId && projectId !== "none") ? projectId : null,
                    account_id: accountId || null,
                    start_date: date.toISOString(),
                    next_due_date: rule.after(new Date(), true)?.toISOString() || date.toISOString(), // Calculate next
                    frequency: freq.toLowerCase(),
                    recurrence_rule: ruleString,
                    active: true
                })
                if (recError) console.error("Failed to create recurring template:", recError)
            }

            setOpen(false)
            resetForm()
            router.refresh()

        } catch (err: any) {
            console.error(err)
            alert("Error saving: " + err.message)
        } finally {
            setIsProcessing(false)
        }
    }

    const resetForm = () => {
        setAmount("")
        setDescription("")
        setDate(new Date())
        setCategoryId("")
        setProjectId("")
        setAccountId("")
        setPaidBy("")
        setIsRecurring(false)
        setFreq("MONTHLY")
        setInterval("1")
        setWeekDays([])
        setRecurrenceEnd(undefined)
    }

    const toggleWeekDay = (day: string) => {
        if (weekDays.includes(day)) setWeekDays(weekDays.filter(d => d !== day))
        else setWeekDays([...weekDays, day])
    }

    const weekDayOptions = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-full font-semibold shadow-md gap-2">
                    <Plus className="h-4 w-4" /> Quick Add
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                    <DialogDescription>Record a new income or expense.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Type Toggle */}
                    <div className="flex justify-center mb-2">
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

                    {/* Main Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Amount</Label>
                            <Input
                                placeholder="0.00"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="text-lg font-bold"
                                autoFocus
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
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
                        <Input placeholder="What is this for?" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Category</Label>
                            <CreatableSelect
                                value={categoryId}
                                options={items.categories}
                                onChange={setCategoryId}
                                onCreate={async (name) => {
                                    // Quick Create logic... (Simplified for brevity, same as before)
                                    const { data: { user } } = await supabase.auth.getUser()
                                    if (!user) return null
                                    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
                                    if (!profile?.tenant_id) return null
                                    const { data } = await supabase.from('categories').insert({ name, type, tenant_id: profile.tenant_id }).select('id, name').single()
                                    if (data) setItems(prev => ({ ...prev, categories: [...prev.categories, data] }))
                                    return data?.id || null
                                }}
                                noun="category"
                            />
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

                    {/* Recurrence Section */}
                    <div className="border rounded-md p-4 bg-muted/30 space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch id="recurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
                            <Label htmlFor="recurring" className="flex items-center gap-2 cursor-pointer font-medium">
                                <Repeat className="h-4 w-4" /> Repeat Transaction?
                            </Label>
                        </div>

                        {isRecurring && (
                            <div className="grid gap-4 animate-in fade-in slide-in-from-top-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Frequency</Label>
                                        <Select value={freq} onValueChange={setFreq}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DAILY">Daily</SelectItem>
                                                <SelectItem value="WEEKLY">Weekly</SelectItem>
                                                <SelectItem value="MONTHLY">Monthly</SelectItem>
                                                <SelectItem value="YEARLY">Yearly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Interval (Every X)</Label>
                                        <Input type="number" min="1" value={interval} onChange={e => setInterval(e.target.value)} />
                                    </div>
                                </div>

                                {freq === 'WEEKLY' && (
                                    <div className="grid gap-2">
                                        <Label>On Days</Label>
                                        <div className="flex gap-2">
                                            {weekDayOptions.map(day => (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => toggleWeekDay(day)}
                                                    className={cn(
                                                        "h-8 w-8 rounded-full text-xs font-semibold border flex items-center justify-center transition-colors",
                                                        weekDays.includes(day) ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"
                                                    )}
                                                >
                                                    {day[0]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label>End Date (Optional)</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !recurrenceEnd && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {recurrenceEnd ? format(recurrenceEnd, "PPP") : <span>No end date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={recurrenceEnd} onSelect={setRecurrenceEnd} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button type="submit" onClick={handleSave} disabled={isProcessing || !amount || !description}>
                        {isProcessing ? "Saving..." : "Save Transaction"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}
