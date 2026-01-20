"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, FolderKanban, Wallet, ArrowRightLeft, Users, User, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/auth/login')
    }

    const navItems = [
        { href: "/dashboard", icon: LayoutGrid, label: "Dashboard", exact: true },
        { href: "/dashboard/projects", icon: FolderKanban, label: "Projects" },
        { href: "/dashboard/accounts", icon: Wallet, label: "Accounts" },
        { href: "/dashboard/transactions", icon: ArrowRightLeft, label: "Transactions" },
        { href: "/dashboard/partners", icon: Users, label: "Partners" },
        { href: "/dashboard/profile", icon: User, label: "Profile" },
        { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    ]

    return (
        <aside
            className={cn(
                "bg-sidebar text-sidebar-foreground flex h-screen w-24 flex-col items-center py-8 border-r border-sidebar-border transition-all duration-300 z-10 hidden sm:flex",
                className
            )}
        >
            <div className="mb-12">
                {/* Logo Placeholder - Golden Lion */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <LayoutGrid className="h-6 w-6 text-primary" />
                </div>
            </div>

            <nav className="flex flex-1 flex-col gap-4 items-center w-full px-2">
                {navItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href)

                    return (
                        <NavItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            active={isActive}
                        />
                    )
                })}
            </nav>

            <div className="mt-auto pb-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </aside>
    )
}

function NavItem({
    href,
    icon: Icon,
    label,
    active,
}: {
    href: string
    icon: React.ElementType
    label: string
    active?: boolean
}) {
    // Determine active styling
    return (
        <Link
            href={href}
            className={cn(
                "group relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-110",
                active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
            title={label}
        >
            <Icon className="h-5 w-5" />

            {/* Tooltip */}
            <span className={cn(
                "absolute left-14 top-1/2 -translate-y-1/2 rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none",
                // Keep label visible if active for clarity? No, hover only is cleaner for collapsed view.
            )}>
                {label}
            </span>
        </Link>
    )
}
