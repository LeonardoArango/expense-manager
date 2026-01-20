"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

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

export type Option = {
    id: string
    name: string
}

interface CreatableSelectProps {
    value?: string
    options: Option[]
    onChange: (value: string) => void
    onCreate: (name: string) => Promise<string | null>
    placeholder?: string
    noun?: string
}

export function CreatableSelect({ value, options, onChange, onCreate, placeholder = "Select...", noun = "item" }: CreatableSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")
    const [isCreating, setIsCreating] = React.useState(false)

    const selectedOption = options.find((option) => option.id === value)

    const handleCreate = async () => {
        if (!inputValue) return
        setIsCreating(true)
        try {
            const newId = await onCreate(inputValue)
            if (newId) {
                onChange(newId)
                setOpen(false)
                setInputValue("")
            }
        } catch (error) {
            console.error("Failed to create item", error)
        } finally {
            setIsCreating(false)
        }
    }

    // Filter options to see if we have an exact match
    const hasExactMatch = options.some(opt => opt.name.toLowerCase() === inputValue.toLowerCase())

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value
                        ? options.find((option) => option.id === value)?.name
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput
                        placeholder={`Search ${noun}...`}
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {!hasExactMatch && inputValue.length > 0 ? (
                                <div className="p-2">
                                    <Button
                                        variant="secondary"
                                        className="w-full justify-start text-sm"
                                        onClick={handleCreate}
                                        disabled={isCreating}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        {isCreating ? "Creating..." : `Create "${inputValue}"`}
                                    </Button>
                                </div>
                            ) : (
                                <span className="p-4 block text-center text-sm text-muted-foreground">No {noun} found.</span>
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.id}
                                    value={option.name} // Search by name
                                    onSelect={() => {
                                        onChange(option.id === value ? "" : option.id)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
