import { createClient } from "@/lib/supabase/server"

export default async function DebugPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let profile = null
    let tenant = null

    if (user) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        profile = p
        if (p?.tenant_id) {
            const { data: t } = await supabase.from('tenants').select('*').eq('id', p.tenant_id).single()
            tenant = t
        }
    }

    return (
        <div className="p-8 font-mono text-sm max-w-2xl mx-auto space-y-4">
            <h1 className="text-xl font-bold">Debug Information</h1>

            <div className="bg-muted p-4 rounded">
                <h2 className="font-bold mb-2">Auth User</h2>
                <pre className="whitespace-pre-wrap">{JSON.stringify(user, null, 2)}</pre>
            </div>

            <div className="bg-muted p-4 rounded">
                <h2 className="font-bold mb-2">Profile</h2>
                <pre className="whitespace-pre-wrap">{JSON.stringify(profile, null, 2)}</pre>
            </div>

            <div className="bg-muted p-4 rounded">
                <h2 className="font-bold mb-2">Tenant</h2>
                <pre className="whitespace-pre-wrap">{JSON.stringify(tenant, null, 2)}</pre>
            </div>

            <div className="border-t pt-4 mt-4">
                <form action={async () => {
                    'use server'
                    await import('./actions').then(m => m.fixAccount())
                }}>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Fix My Account (Create Tenant & Profile)
                    </button>
                    <p className="text-xs text-muted-foreground mt-2">
                        Click this if Tenant is null. It will create a new workspace for you.
                    </p>
                </form>

                <form action={async () => {
                    'use server'
                    await import('./actions').then(m => m.seedCategories())
                }} className="mt-8">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        Seed Default Categories
                    </button>
                    <p className="text-xs text-muted-foreground mt-2">
                        Populate your account with the standard category list (Alimentación, Hogar, etc.)
                    </p>
                </form>
            </div>
        </div>
    )
}
