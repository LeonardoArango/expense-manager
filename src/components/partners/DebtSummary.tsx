"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowRight, Check } from "lucide-react"

const settlementData = [
    {
        from: "Juan",
        to: "Me",
        amount: 150000,
        project: "Apartment Renovation",
        avatarFrom: "JU",
        avatarTo: "ME"
    },
    {
        from: "Me",
        to: "Maria",
        amount: 45000,
        project: "Vacation Trip",
        avatarFrom: "ME",
        avatarTo: "MA"
    },
]

export function DebtSummary() {
    return (
        <Card className="shadow-md border-none bg-gradient-to-br from-white to-gray-50">
            <CardHeader>
                <CardTitle>Partner Settlements</CardTitle>
                <CardDescription>Pending transfers to balance shared projects</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {settlementData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                                        <AvatarFallback className="bg-orange-200 text-orange-800 text-xs">{item.avatarFrom}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -right-1 top-2 bg-gray-100 rounded-full p-0.5 z-10">
                                        <ArrowRight className="h-3 w-3 text-gray-400" />
                                    </div>
                                    <Avatar className="h-8 w-8 ml-6 border-2 border-white shadow-sm -mt-8">
                                        <AvatarFallback className="bg-blue-200 text-blue-800 text-xs">{item.avatarTo}</AvatarFallback>
                                    </Avatar>
                                </div>

                                <div className="flex flex-col ml-2">
                                    <span className="text-sm font-medium">
                                        {item.from} owes {item.to}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {item.project}
                                    </span>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="font-bold text-red-500">
                                    ${item.amount.toLocaleString()}
                                </div>
                                <button className="text-[10px] text-blue-600 font-medium hover:underline flex items-center justify-end gap-1">
                                    Settle <ArrowRight className="h-2 w-2" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {settlementData.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                            <Check className="h-8 w-8 text-green-500 mb-2" />
                            <p className="text-sm">All settled up!</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
