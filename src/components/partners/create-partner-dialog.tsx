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
import { createPartner } from "@/app/dashboard/partners/actions"
import { useToast } from "@/hooks/use-toast"
import { InlineEntityEditor, Entity, Association } from "@/components/shared/inline-entity-editor"
import { createClient } from "@/lib/supabase/client"

export function CreatePartnerDialog() {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    // Entity Editor State
    const [availableProjects, setAvailableProjects] = useState<Entity[]>([])
    const [projectAssociations, setProjectAssociations] = useState<Association[]>([])
    const supabase = createClient()

    useEffect(() => {
        if (open) {
            fetchProjects()
        }
    }, [open])

    const fetchProjects = async () => {
        const { data } = await supabase.from('projects').select('id, name')
        if (data) setAvailableProjects(data)
    }

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)

        // Append associations to formData if needed, or handle separately
        // Since server action expects FormData, we might need to send JSON string
        formData.append('project_associations', JSON.stringify(projectAssociations))

        const result = await createPartner(formData)
        setIsLoading(false)

        if (result.error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error,
            })
        } else {
            toast({
                title: "Success",
                description: result.message,
            })
            setOpen(false)
            setProjectAssociations([])
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Partner
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Partner</DialogTitle>
                    <DialogDescription>
                        Create a new partner and associate them with projects.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" name="name" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" name="email" type="email" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">Phone</Label>
                            <Input id="phone" name="phone" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tax_id" className="text-right">Tax ID</Label>
                            <Input id="tax_id" name="tax_id" className="col-span-3" />
                        </div>

                        {/* Inline Editor for Projects */}
                        <div className="col-span-4 mt-2">
                            <InlineEntityEditor
                                label="Associated Projects"
                                availableEntities={availableProjects}
                                associations={projectAssociations}
                                onAssociationsChange={setProjectAssociations}
                            // onCreateEntity logic for projects could be added here if desired
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
