"use client"

import { useEffect, useState } from "react"
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
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { InlineEntityEditor, Entity, Association } from "@/components/shared/inline-entity-editor"

export function CreateProjectDialog() {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(false)

    // Partner Association State
    const [availablePartners, setAvailablePartners] = useState<Entity[]>([])
    const [partnerAssociations, setPartnerAssociations] = useState<Association[]>([])

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        if (open) {
            fetchPartners()
        }
    }, [open])

    const fetchPartners = async () => {
        const { data } = await supabase.from('partners').select('id, name')
        if (data) setAvailablePartners(data)
    }

    // Calculate Owner Percentage
    const totalPartnerPercentage = partnerAssociations.reduce((sum, p) => sum + (p.percentage || 0), 0)
    const ownerPercentage = Math.max(0, 100 - totalPartnerPercentage)

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

        if (profile?.tenant_id) {
            // 1. Create Project
            const { data: project, error } = await supabase.from('projects').insert({
                name,
                description,
                tenant_id: profile.tenant_id
            }).select('id').single()

            if (error) {
                console.error(error)
                alert("Error creating project: " + error.message)
            } else if (project) {
                // 2. Create Project Partners
                if (partnerAssociations.length > 0) {
                    const { error: partnersError } = await supabase.from('project_partners').insert(
                        partnerAssociations.map(assoc => ({
                            tenant_id: profile.tenant_id,
                            project_id: project.id,
                            partner_id: assoc.entityId,
                            equity_percentage: assoc.percentage || 0,
                            role: assoc.role || 'Investor'
                        }))
                    )
                    if (partnersError) {
                        alert("Project created but partners failed: " + partnersError.message)
                    }
                }

                setOpen(false)
                setName("")
                setDescription("")
                setPartnerAssociations([])
                router.refresh()
            }
        } else {
            alert("Error: Your user profile is incomplete (missing tenant).")
        }

        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleCreate}>
                    <DialogHeader>
                        <DialogTitle>Create Project</DialogTitle>
                        <DialogDescription>
                            Create a new project and assign partners.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Description</Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="col-span-3"
                            />
                        </div>

                        {/* Inline Editor for Partners */}
                        <div className="col-span-4 mt-2 space-y-2">
                            <div className="flex justify-between items-center text-sm font-medium px-1">
                                <span>Equity Distribution</span>
                                <span className={ownerPercentage < 0 ? "text-destructive" : "text-muted-foreground"}>
                                    Owner (You): {ownerPercentage.toFixed(1)}%
                                </span>
                            </div>
                            <InlineEntityEditor
                                label="Add Partners"
                                availableEntities={availablePartners}
                                associations={partnerAssociations}
                                onAssociationsChange={setPartnerAssociations}
                                showPercentage={true}
                            />
                            {totalPartnerPercentage > 100 && (
                                <p className="text-destructive text-xs text-right">Total percentage exceeds 100%</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading || totalPartnerPercentage > 100}>
                            {loading ? "Creating..." : "Create Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
