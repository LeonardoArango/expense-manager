'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createPartner(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const taxId = formData.get('tax_id') as string

    if (!name) {
        return { error: 'Name is required' }
    }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile?.tenant_id) return { error: "No tenant found" }

    try {
        // 1. Create Partner
        const { data: partner, error: partnerError } = await supabase.from('partners').insert({
            tenant_id: profile.tenant_id,
            user_id: user.id,
            name,
            email,
            phone,
            tax_id: taxId
        }).select('id').single()

        if (partnerError) throw new Error(partnerError.message)

        if (partner) {
            const { error: accountError } = await supabase.from('accounts').insert({
                tenant_id: profile.tenant_id,
                name: `Account - ${name}`,
                type: 'cash',
                partner_id: partner.id,
                currency: 'COP'
            })
            if (accountError) throw new Error(`Partner created but account failed: ${accountError.message}`)

            // 3. Handle Project Associations
            const projectAssociationsStr = formData.get('project_associations') as string
            if (projectAssociationsStr) {
                try {
                    const associations = JSON.parse(projectAssociationsStr)
                    if (Array.isArray(associations) && associations.length > 0) {
                        const { error: projError } = await supabase.from('project_partners').insert(
                            associations.map((assoc: any) => ({
                                tenant_id: profile.tenant_id,
                                partner_id: partner.id,
                                project_id: assoc.entityId,
                                equity_percentage: assoc.percentage || 0,
                                role: assoc.role || 'Partner'
                            }))
                        )
                        if (projError) throw new Error(`Partner created but project association failed: ${projError.message}`)
                    }
                } catch (e: any) {
                    throw new Error(`Failed to process project associations: ${e.message}`)
                }
            }
        }

        revalidatePath('/dashboard/partners')
        return { success: true, message: 'Partner and associated account created successfully' }

    } catch (error: any) {
        return { error: error.message }
    }
}
