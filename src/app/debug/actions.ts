'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function fixAccount() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, message: "No user found" }

    // 1. Check Profile
    let { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    let tenantId = profile?.tenant_id

    // 2. Create Tenant if missing
    if (!tenantId) {
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .insert({ name: 'My Workspace' })
            .select()
            .single()

        if (tenantError) return { success: false, message: "Failed to create tenant: " + tenantError.message }
        tenantId = tenant.id
    }

    // 3. Create or Update Profile
    if (!profile) {
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                full_name: user.email?.split('@')[0] || 'User',
                tenant_id: tenantId
            })

        if (profileError) return { success: false, message: "Failed to create profile: " + profileError.message }
    } else if (!profile.tenant_id) {
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ tenant_id: tenantId })
            .eq('id', user.id)

        if (updateError) return { success: false, message: "Failed to update profile: " + updateError.message }
    }

    revalidatePath('/debug')
    return { success: true, message: "Account fixed successfully!" }
}

import { DEFAULT_CATEGORIES } from "@/lib/data/default-categories"

export async function seedCategories() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: "No user found" }

    // Get tenant
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile?.tenant_id) return { success: false, message: "No tenant found for user" }

    const tenantId = profile.tenant_id
    let createdCount = 0

    for (const category of DEFAULT_CATEGORIES) {
        // 1. Check if parent exists
        let { data: parent } = await supabase
            .from('categories')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('name', category.name)
            .eq('type', category.type)
            .single()

        // 2. Create parent if not exists
        if (!parent) {
            const { data: newParent, error } = await supabase
                .from('categories')
                .insert({
                    tenant_id: tenantId,
                    name: category.name,
                    type: category.type
                })
                .select('id')
                .single()

            if (error) {
                console.error(`Error creating parent ${category.name}:`, error)
                continue
            }
            parent = newParent
            createdCount++
        }

        // 3. Create subcategories
        if (parent) {
            for (const sub of category.subcategories) {
                // Check if sub exists
                const { data: existingSub } = await supabase
                    .from('categories')
                    .select('id')
                    .eq('tenant_id', tenantId)
                    .eq('parent_id', parent.id)
                    .eq('name', sub.name)
                    .single()

                if (!existingSub) {
                    await supabase.from('categories').insert({
                        tenant_id: tenantId,
                        name: sub.name,
                        type: category.type,
                        parent_id: parent.id,
                        is_tax_deductible: sub.is_tax_deductible
                    })
                    createdCount++
                }
            }
        }
    }

    revalidatePath('/dashboard/transactions')
    return { success: true, message: `Categories seeded! Created ${createdCount} items.` }
}
