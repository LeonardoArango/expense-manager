'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

type ImportResult = { success: boolean; message: string }

export async function importCategories(data: any[]): Promise<ImportResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile?.tenant_id) return { success: false, message: "No tenant found" }
    const tenantId = profile.tenant_id

    let createdCount = 0
    let errors: string[] = []

    for (const row of data) {
        // Headers: Categoría Principal, Subcategoría, Tipo, Nota
        const parentName = row['Categoría Principal']
        const subName = row['Subcategoría']
        const typeRaw = row['Tipo']?.toLowerCase()
        const note = row['Nota'] || row['Uso']

        if (!parentName || !typeRaw) continue

        const type = (typeRaw === 'income' || typeRaw === 'ingreso') ? 'income' : 'expense'

        try {
            // Find or Create Parent
            let { data: parent } = await supabase
                .from('categories')
                .select('id')
                .eq('tenant_id', tenantId)
                .eq('name', parentName)
                .eq('type', type)
                .is('parent_id', null)
                .single()

            if (!parent) {
                const { data: newParent, error } = await supabase
                    .from('categories')
                    .insert({ tenant_id: tenantId, name: parentName, type })
                    .select('id')
                    .single()

                if (error) throw new Error(`Parent creation failed: ${error.message}`)
                parent = newParent
            }

            // Find or Create Subcategory
            if (subName && parent) {
                let { data: sub } = await supabase
                    .from('categories')
                    .select('id')
                    .eq('tenant_id', tenantId)
                    .eq('name', subName)
                    .eq('parent_id', parent.id)
                    .single()

                if (!sub) {
                    const { error } = await supabase.from('categories').insert({
                        tenant_id: tenantId,
                        name: subName,
                        type,
                        parent_id: parent.id,
                        is_tax_deductible: row['Clasificación Tributaria'] === 'Deducible' // Optional mapping
                    })
                    if (error) throw new Error(`Subcategory creation failed: ${error.message}`)
                    createdCount++
                }
            } else if (!subName) {
                // Just counting parent creation if no sub
                createdCount++
            }

        } catch (err: any) {
            errors.push(`${parentName}/${subName}: ${err.message}`)
        }
    }

    revalidatePath('/dashboard/transactions')
    if (errors.length > 0) {
        return { success: true, message: `Imported with some errors. Created: ${createdCount}. Errors: ${errors.slice(0, 3).join(', ')}...` }
    }
    return { success: true, message: `Successfully imported categories!` }
}

export async function importTransactions(data: any[]): Promise<ImportResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile?.tenant_id) return { success: false, message: "No tenant found" }
    const tenantId = profile.tenant_id

    let count = 0
    let errors: string[] = []

    // Cache maps to avoid DB hammering
    const accountMap = new Map<string, string>() // Name -> ID
    const partnerMap = new Map<string, string>() // Name -> ID
    const projectMap = new Map<string, string>() // Name -> ID
    // Categories are trickier due to Sub/Parent relationship. We'll lookup dynamically or optimize later.

    for (const row of data) {
        // Headers: Fecha, Descripción, Monto, Tipo, Cuenta, Categoría, Subcategoría, Proyecto, Socio
        const date = row['Fecha']
        const desc = row['Descripción']
        const amount = row['Monto']
        const typeRaw = row['Tipo']?.toLowerCase()
        const accountName = row['Cuenta']
        const catParent = row['Categoría']
        const catSub = row['Subcategoría']
        const projectName = row['Proyecto']
        const partnerName = row['Socio']

        if (!date || !amount || !accountName) {
            errors.push(`Row missing required fields: ${desc}`)
            continue
        }

        const type = (typeRaw === 'income' || typeRaw === 'ingreso') ? 'income' : 'expense'

        try {
            // 1. Resolve Account
            let accountId = accountMap.get(accountName)
            if (!accountId) {
                // Find or Create Account
                let { data: acc } = await supabase.from('accounts').select('id').eq('tenant_id', tenantId).ilike('name', accountName).single()
                if (!acc) {
                    const { data: newAcc } = await supabase.from('accounts').insert({
                        tenant_id: tenantId,
                        name: accountName,
                        type: 'cash', // Default
                        currency: 'COP'
                    }).select('id').single()
                    acc = newAcc
                }
                if (acc) {
                    accountId = acc.id
                    if (accountId) accountMap.set(accountName, accountId)
                }
            }

            // 2. Resolve Partner
            let partnerId = null
            if (partnerName) {
                partnerId = partnerMap.get(partnerName)
                if (!partnerId) {
                    let { data: ptr } = await supabase.from('partners').select('id').eq('tenant_id', tenantId).ilike('name', partnerName).single()
                    if (!ptr) {
                        // Auto-associate account? Logic suggests create partner + account?
                        // For transaction import simpler is just create partner.
                        const { data: newPtr } = await supabase.from('partners').insert({
                            tenant_id: tenantId,
                            name: partnerName,
                            user_id: user.id // Default to admin?
                        }).select('id').single()
                        ptr = newPtr

                        // Also auto-create account for partner if needed?
                        // "Need to be able to create partners for my projects, and automatically create an account associated to my partner"
                        // This requirement was for the Partner *creation UI*, but implies we want it here too.
                        // Let's create a Payable Account for them.
                        if (ptr) { // Ensure ptr was successfully created
                            await supabase.from('accounts').insert({
                                tenant_id: tenantId,
                                name: `Account - ${partnerName}`,
                                type: 'cash', // Or specific type if we had it
                                partner_id: ptr.id // ptr.id is a valid UUID here
                            })
                        }
                    }
                    if (ptr) {
                        partnerId = ptr.id
                        partnerMap.set(partnerName, partnerId)
                    }
                }
            }

            // 3. Resolve Project
            let projectId = null
            if (projectName) {
                projectId = projectMap.get(projectName)
                if (!projectId) {
                    let { data: proj } = await supabase.from('projects').select('id').eq('tenant_id', tenantId).ilike('name', projectName).single()
                    if (!proj) {
                        const { data: newProj } = await supabase.from('projects').insert({
                            tenant_id: tenantId,
                            name: projectName,
                            status: 'active'
                        }).select('id').single()
                        proj = newProj
                    }
                    if (proj) {
                        projectId = proj.id
                        projectMap.set(projectName, projectId)
                    }
                }
            }

            // 4. Resolve Category
            let categoryId = null
            if (catParent) {
                // Try to find specific subcategory first
                if (catSub) {
                    const { data: sub } = await supabase.from('categories')
                        .select('id')
                        .eq('tenant_id', tenantId)
                        .eq('name', catSub) // Simplified lookup without parent check for loose matching
                        .single()
                    if (sub) categoryId = sub.id
                }
                // If no sub or sub not found, find parent
                if (!categoryId) {
                    let { data: parent } = await supabase.from('categories').select('id').eq('tenant_id', tenantId).eq('name', catParent).single()
                    if (!parent) {
                        // Create Parent implicitly? Yes per plan.
                        const { data: newP } = await supabase.from('categories').insert({ tenant_id: tenantId, name: catParent, type }).select('id').single()
                        parent = newP
                    }
                    categoryId = parent?.id
                }
            }

            // 5. Insert Transaction
            /*
              Excel date often comes as serial number (e.g. 45302). 
              Need to parse if it's number.
            */
            let finalDate = new Date(date)
            if (typeof date === 'number') {
                // Excel serial date to JS Date
                // Excel base date: Dec 30 1899
                finalDate = new Date(Date.UTC(1899, 11, 30) + date * 24 * 60 * 60 * 1000)
            }


            const { error } = await supabase.from('transactions').insert({
                tenant_id: tenantId,
                date: finalDate.toISOString(),
                description: desc,
                amount: parseFloat(amount),
                type,
                account_id: accountId,
                category_id: categoryId,
                project_id: projectId,
                paid_by_partner_id: partnerId,
                status: 'paid'
            })

            if (error) throw error
            count++

        } catch (err: any) {
            errors.push(`Row error (${desc}): ${err.message}`)
        }
    }

    revalidatePath('/dashboard/transactions')
    if (errors.length > 0) {
        return { success: true, message: `Imported ${count} transactions. Errors: ${errors.length}` }
    }
    return { success: true, message: `Successfully imported ${count} transactions!` }
}
