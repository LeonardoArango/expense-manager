import { createClient } from "@/lib/supabase/server"
import { CreatePartnerDialog } from "@/components/partners/create-partner-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"

export default async function PartnersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch partners for the tenant
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()

    const { data: partners } = await supabase
        .from('partners')
        .select('*')
        .eq('tenant_id', profile?.tenant_id)
        .order('created_at', { ascending: false })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Partners</h1>
                    <p className="text-muted-foreground">Manage your project partners and stakeholders.</p>
                </div>
                <CreatePartnerDialog />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Partners</CardTitle>
                    <CardDescription>
                        A list of all partners associated with your workspace.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Tax ID</TableHead>
                                <TableHead className="text-right">Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {partners?.map((partner) => (
                                <TableRow key={partner.id}>
                                    <TableCell className="font-medium">{partner.name}</TableCell>
                                    <TableCell>{partner.email || '-'}</TableCell>
                                    <TableCell>{partner.phone || '-'}</TableCell>
                                    <TableCell>{partner.tax_id || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        {format(new Date(partner.created_at), "MMM d, yyyy")}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!partners || partners.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                        No partners found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
