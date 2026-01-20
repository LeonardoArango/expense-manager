import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { TransactionList } from "@/components/transactions/transaction-list"
import { ProjectOverview } from "@/components/projects/project-overview"
import { ProjectTeam } from "@/components/projects/project-team"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Fix for Next.js 15+ Params handling
type Props = {
    params: Promise<{ id: string }>
}

export default async function ProjectDetailsPage({ params }: Props) {
    // Await params mainly for Next.js 15+, safe for 14 too if typed correctly
    const { id } = await params

    const supabase = await createClient()

    // 1. Fetch Project Details
    const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single()

    if (!project) {
        notFound()
    }

    // 2. Fetch Project Partners
    const { data: projectPartners } = await supabase
        .from("project_partners")
        .select(`
      equity_percentage,
      is_owner,
      partner:partners(*)
    `)
        .eq("project_id", id)

    // 3. Fetch Transactions for this Project
    const { data: transactions } = await supabase
        .from("transactions")
        .select(`
       *,
      category:categories(name, type),
      account:accounts(name),
      project:projects(name),
      paid_by:partners(name)
    `)
        .eq("project_id", id)
        .order("date", { ascending: false })

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                <p className="text-muted-foreground">{project.description}</p>
            </div>

            <ProjectOverview transactions={transactions || []} />

            <Tabs defaultValue="transactions" className="w-full">
                <TabsList>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="team">Partner Equity</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="transactions" className="mt-4">
                    <TransactionList initialTransactions={transactions || []} />
                </TabsContent>
                <TabsContent value="team" className="mt-4">
                    <ProjectTeam projectId={id} partners={projectPartners || []} />
                </TabsContent>
                <TabsContent value="settings" className="mt-4">
                    <div className="p-4 border border-dashed rounded-md text-muted-foreground">
                        Project settings and archival options coming soon.
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
