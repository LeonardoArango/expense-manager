"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, FolderTree, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type Category = {
    id: string
    name: string
    parentId?: string | null
    type: string
}

export function ManageCategoriesDialog() {
    const [open, setOpen] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const [newName, setNewName] = useState("")
    const [newParentId, setNewParentId] = useState<string>("none")
    const [newType, setNewType] = useState("expense")

    const supabase = createClient()

    useEffect(() => {
        if (open) fetchCategories()
    }, [open])

    const fetchCategories = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
        if (!profile) return

        const { data } = await supabase.from('categories')
            .select('id, name, type, parent_id') // Check if parent_id or parentId exists. Import logic used name matching? No, schema says... let's check schema.

        // Assuming schema has parent_id (self-ref).
        // If not, I need to add it! But I already implemented subcategories in import logic?
        // Let's verify schema. Import logic used "parent exists check" via name lookup on same table.
        // So Categories table MUST have hierarchy support.
        // "const { data: parent } = await supabase.from('categories')... .eq('name', catParent)..."
        // Yes it implies hierarchy.

        if (data) {
            const mapped = data.map((c: any) => ({
                id: c.id,
                name: c.name,
                parentId: c.parent_id,
                type: c.type
            }))
            setCategories(mapped)
        }
    }

    const handleCreate = async () => {
        if (!newName) return
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user!.id).single()

        if (profile) {
            const { error } = await supabase.from('categories').insert({
                tenant_id: profile.tenant_id,
                name: newName,
                type: newType,
                parent_id: newParentId === "none" ? null : newParentId
            })

            if (error) {
                alert(error.message)
            } else {
                setNewName("")
                fetchCategories()
            }
        }
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this category?")) return
        const { error } = await supabase.from('categories').delete().eq('id', id)
        if (!error) fetchCategories()
        else alert(error.message)
    }

    // Organize into tree
    const rootCategories = categories.filter(c => !c.parentId && c.type === newType)
    const getChildren = (id: string) => categories.filter(c => c.parentId === id)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <FolderTree className="mr-2 h-4 w-4" />
                    Manage Categories
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Categories & Subcategories</DialogTitle>
                    <DialogDescription>Manage your income and expense categories.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 border-b">
                    <div className="flex gap-2">
                        <Select value={newType} onValueChange={setNewType}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="expense">Expense</SelectItem>
                                <SelectItem value="income">Income</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="New category name..."
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                        />
                        <Select value={newParentId} onValueChange={setNewParentId}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="No Parent" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">-- No Parent --</SelectItem>
                                {categories.filter(c => c.type === newType).map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleCreate} disabled={loading || !newName}><Plus className="h-4 w-4" /></Button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto space-y-2">
                    {rootCategories.map(root => (
                        <div key={root.id} className="border rounded-md bg-card p-2">
                            <div className="flex items-center justify-between font-medium">
                                <div className="flex items-center gap-2">
                                    <span className={cn("h-2 w-2 rounded-full", root.type === 'income' ? "bg-green-500" : "bg-red-500")}></span>
                                    {root.name}
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(root.id)} className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></Button>
                            </div>

                            {/* Subcategories */}
                            <div className="ml-4 mt-2 space-y-1 pl-2 border-l">
                                {getChildren(root.id).map(child => (
                                    <div key={child.id} className="flex items-center justify-between text-sm py-1">
                                        <span>{child.name}</span>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(child.id)} className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {rootCategories.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">No categories found for {newType}.</div>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    )
}
