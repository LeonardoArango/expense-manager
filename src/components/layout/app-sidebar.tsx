"use client"

import * as React from "react"
import {
    BookOpen,
    Bot,
    Command,
    Frame,
    LifeBuoy,
    Map,
    PieChart,
    Send,
    Settings2,
    SquareTerminal,
    LayoutDashboard,
    Wallet,
    CreditCard,
    Users,
    Settings,
    User
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppSidebar({ className }: React.ComponentProps<"div">) {
    const pathname = usePathname()

    const navItems = [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Personal Profile",
            url: "/dashboard/profile",
            icon: User,
        },
        {
            title: "Projects",
            url: "/dashboard/projects",
            icon: Frame,
        },
        {
            title: "Partners",
            url: "/dashboard/partners",
            icon: Users,
        },
        {
            title: "Transactions",
            url: "/dashboard/transactions",
            icon: Wallet,
        },
        {
            title: "Accounts",
            url: "/dashboard/accounts",
            icon: CreditCard,
        },
        {
            title: "Config",
            url: "/dashboard/settings",
            icon: Settings
        }
    ]

    return (
        <div className={cn("pb-12 w-64 border-r min-h-screen bg-sidebar hidden md:block", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Patrimonio
                    </h2>
                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <Link key={item.url} href={item.url}>
                                <Button variant={pathname === item.url ? "secondary" : "ghost"} className="w-full justify-start">
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.title}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
