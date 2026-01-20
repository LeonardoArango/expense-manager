"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

type Project = {
    id: string
    name: string
    description: string | null
    status: string | null
    created_at: string
}

export function ProjectList({ initialProjects }: { initialProjects: Project[] }) {
    if (initialProjects.length === 0) {
        return (
            <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                    <h3 className="mt-4 text-lg font-semibold">No projects added</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground">
                        You have not added any projects. Add one below.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {initialProjects.map((project) => (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {project.name}
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {project.status === 'active' ? 'Active' : 'Archived'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {project.description || 'No description'}
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
