"use client"

import React, { useState } from 'react'
import * as XLSX from 'xlsx'
import { Button } from "@/components/ui/button"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ExcelImporterProps {
    onImport: (data: any[]) => Promise<{ success: boolean; message: string }>
    buttonLabel?: string
    templateHeaders?: string[]
}

export function ExcelImporter({ onImport, buttonLabel = "Import Excel", templateHeaders }: ExcelImporterProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsLoading(true)
        setStatus({ type: null, message: '' })

        const reader = new FileReader()
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result
                const wb = XLSX.read(bstr, { type: 'binary' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const data = XLSX.utils.sheet_to_json(ws)

                if (data.length === 0) {
                    throw new Error("Excel file appears to be empty.")
                }

                // Optional: Validate headers
                if (templateHeaders) {
                    const firstRow = data[0] as object
                    const missingHeaders = templateHeaders.filter(h => !Object.keys(firstRow).some(k => k.toLowerCase() === h.toLowerCase()))
                    if (missingHeaders.length > 0) {
                        console.warn("Possible missing headers:", missingHeaders)
                        // Verify strictly or leniently? Let's just warn for now or let the server action fail if it cant find keys.
                    }
                }

                const result = await onImport(data)

                setStatus({
                    type: result.success ? 'success' : 'error',
                    message: result.message
                })

            } catch (error: any) {
                console.error("Import error:", error)
                setStatus({ type: 'error', message: error.message || "Failed to parse file." })
            } finally {
                setIsLoading(false)
                // Reset input
                e.target.value = ''
            }
        }
        reader.readAsBinaryString(file)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button disabled={isLoading} variant="outline" className="relative cursor-pointer" asChild>
                    <label>
                        {isLoading ? (
                            <span className="flex items-center gap-2">Importing...</span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                {buttonLabel}
                            </span>
                        )}
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isLoading}
                        />
                    </label>
                </Button>
                {templateHeaders && (
                    <div className="text-xs text-muted-foreground">
                        Expected columns: {templateHeaders.slice(0, 3).join(", ")}...
                    </div>
                )}
            </div>

            {status.type === 'error' && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{status.message}</AlertDescription>
                </Alert>
            )}

            {status.type === 'success' && (
                <Alert className="border-green-500 text-green-700 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{status.message}</AlertDescription>
                </Alert>
            )}
        </div>
    )
}
