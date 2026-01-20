"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export interface Entity {
    id: string
    name: string
}

export interface Association {
    entityId: string
    name: string
    percentage?: number
    role?: string
}

interface InlineEntityEditorProps {
    label: string
    availableEntities: Entity[]
    associations: Association[]
    onAssociationsChange: (newAssociations: Association[]) => void
    onCreateEntity?: (name: string) => Promise<Entity | null> // Optional: inline creation of new entity
    showPercentage?: boolean
}

export function InlineEntityEditor({
    label,
    availableEntities,
    associations,
    onAssociationsChange,
    onCreateEntity,
    showPercentage = false
}: InlineEntityEditorProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")
    const [isCreating, setIsCreating] = React.useState(false)

    const handleSelect = (entity: Entity) => {
        // Check if already associated
        if (associations.find(a => a.entityId === entity.id)) return

        // Add new association
        // Default percentage logic: 
        // If adding 2nd partner, maybe default to 50/50? Or just 0? User asked for "percentage decreases". 
        // For now, let's just add with 0 and let user edit.
        onAssociationsChange([...associations, { entityId: entity.id, name: entity.name, percentage: 0 }])
        setOpen(false)
    }

    const handleCreate = async () => {
        if (!onCreateEntity || !inputValue) return
        setIsCreating(true)
        try {
            const newEntity = await onCreateEntity(inputValue)
            if (newEntity) {
                handleSelect(newEntity)
                // Also add to availableEntities list? Parent should handle this revalidation/state update.
            }
        } finally {
            setIsCreating(false)
        }
    }

    const removeAssociation = (id: string) => {
        onAssociationsChange(associations.filter(a => a.entityId !== id))
    }

    const updatePercentage = (id: string, val: string) => {
        const num = parseFloat(val)
        if (isNaN(num)) return
        onAssociationsChange(associations.map(a => a.entityId === id ? { ...a, percentage: num } : a))
    }

    return (
        <div className="space-y-3">
            <Label>{label}</Label>

            {/* List of current associations */}
            <div className="space-y-2">
                {associations.map(assoc => (
                    <div key={assoc.entityId} className="flex items-center gap-2 p-2 rounded-md border bg-card">
                        <span className="flex-1 text-sm font-medium">{assoc.name}</span>

                        {showPercentage && (
                            <div className="flex items-center gap-1">
                                <Input
                                    type="number"
                                    className="h-7 w-20 text-right"
                                    value={assoc.percentage}
                                    onChange={(e) => updatePercentage(assoc.entityId, e.target.value)}
                                    min={0}
                                    max={100}
                                />
                                <span className="text-muted-foreground text-xs">%</span>
                            </div>
                        )}

                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeAssociation(assoc.entityId)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            {/* Add/Search Trigger */}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between w-full">
                        {`Add ${label}...`}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    <Command>
                        <CommandInput placeholder={`Search ${label}...`} value={inputValue} onValueChange={setInputValue} />
                        <CommandList>
                            <CommandEmpty>
                                {onCreateEntity && inputValue ? (
                                    <div className="p-2">
                                        <p className="text-sm text-muted-foreground mb-2">No results found.</p>
                                        <Button variant="secondary" className="w-full h-8" size="sm" onClick={handleCreate} disabled={isCreating}>
                                            {isCreating ? "Creating..." : `Create "${inputValue}"`}
                                        </Button>
                                    </div>
                                ) : (
                                    "No results found."
                                )}
                            </CommandEmpty>
                            <CommandGroup heading="Suggestions">
                                {availableEntities.map((entity) => {
                                    const isSelected = associations.some(a => a.entityId === entity.id)
                                    if (isSelected) return null // Hide already selected
                                    return (
                                        <CommandItem
                                            key={entity.id}
                                            value={entity.name}
                                            onSelect={() => handleSelect(entity)}
                                        >
                                            <Check className={cn("mr-2 h-4 w-4 opacity-0", isSelected && "opacity-100")} />
                                            {entity.name}
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
