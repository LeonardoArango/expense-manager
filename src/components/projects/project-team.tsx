"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from "lucide-react"
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
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function ProjectTeam({ projectId, partners }: { projectId: string, partners: any[] }) {
    const [open, setOpen] = useState(false)
    const [newPartnerName, setNewPartnerName] = useState("")
    const [equity, setEquity] = useState("0")
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleAddPartner = async () => {
        setLoading(true)
        // 1. Create Partner in 'partners' table if not exists (simplified logic: always create new for now)
        // Ideally we search existing global partners first.
        const { data: { user } } = await supabase.auth.getUser()
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user!.id).single()


        // Check if partner exists by name contextually could be added here, 
        // but for now let's create a new partner record for this project context
        if (profile) {
            const { data: newPartner, error: partnerError } = await supabase
                .from('partners')
                .insert({
                    tenant_id: profile.tenant_id,
                    name: newPartnerName,
                })
                .select()
                .single()

            if (partnerError) {
                alert("Error creating partner: " + partnerError.message)
                setLoading(false)
                return
            }

            // 2. Link to Project
            const { error: linkError } = await supabase
                .from('project_partners')
                .insert({
                    project_id: projectId,
                    partner_id: newPartner.id,
                    equity_percentage: parseFloat(equity),
                    is_owner: false
                })

            if (!linkError) {
                setOpen(false)
                setNewPartnerName("")
                setEquity("0")
                router.refresh()
            } else {
                alert("Error linking: " + linkError.message)
            }
        }
        setLoading(false)
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Partners & Equity</h3>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Partner</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Partner to Project</DialogTitle>
                            <DialogDescription>Add a stakeholder and define their equity share.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Partner Name</Label>
                                <Input value={newPartnerName} onChange={(e) => setNewPartnerName(e.target.value)} placeholder="John Doe" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Equity (%)</Label>
                                <Input type="number" min="0" max="100" value={equity} onChange={(e) => setEquity(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddPartner} disabled={loading}>{loading ? "Adding..." : "Add Partner"}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {partners.map((p) => (
                    <Card key={p.partner.id}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>{p.partner.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-base">{p.partner.name}</CardTitle>
                                    <CardDescription>{p.is_owner ? 'Owner' : 'Partner'}</CardDescription>
                                </div>
                            </div>
                            <Badge variant="secondary" className="text-lg">{p.equity_percentage}%</Badge>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    )
}
