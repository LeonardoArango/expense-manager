import { createClient } from "@/lib/supabase/server"
import { ProjectList } from "@/components/projects/project-list"
import { CreateProjectDialog } from "@/components/projects/create-project-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function ProjectsPage() {
    const supabase = await createClient()
    const { data: projects } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
                <CreateProjectDialog />
            </div>
            <ProjectList initialProjects={projects || []} />
        </div>
    )
}
