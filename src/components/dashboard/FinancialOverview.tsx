"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, CreditCard, TrendingUp } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Pie, PieChart, Legend } from "recharts"
import { DebtSummary } from "@/components/partners/DebtSummary"

const cashFlowData = [
    { name: "Jan", income: 4000, expense: 2400 },
    { name: "Feb", income: 3000, expense: 1398 },
    { name: "Mar", income: 2000, expense: 9800 }, // High expense simulation
    { name: "Apr", income: 2780, expense: 3908 },
    { name: "May", income: 1890, expense: 4800 },
    { name: "Jun", income: 2390, expense: 3800 },
    { name: "Jul", income: 3490, expense: 4300 },
]

const spendingData = [
    { name: "Housing", value: 400, color: "#ef4444" }, // Red
    { name: "Transport", value: 300, color: "#3b82f6" }, // Blue
    { name: "Food", value: 300, color: "#f97316" },    // Orange
    { name: "Utilities", value: 200, color: "#10b981" }, // Green
]

export function FinancialOverview() {
    return (
        <div className="flex flex-col gap-6">
            {/* Top Cards Section - The "Pulse" */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-yellow-400 border-yellow-500 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-black">Total Balance</CardTitle>
                        <DollarSign className="h-4 w-4 text-black" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-black">$45,231.89</div>
                        <p className="text-xs text-black/80 font-medium">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Income</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$5,231.89</div>
                        <p className="text-xs text-muted-foreground">
                            +19% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">-$2,350.00</div>
                        <p className="text-xs text-muted-foreground">
                            +10% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$12,234</div>
                        <p className="text-xs text-muted-foreground">
                            +5% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Cash Flow Chart */}
                <Card className="col-span-4 shadow-sm border-none bg-white/50 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle>Cash Flow</CardTitle>
                        <CardDescription>
                            Income vs Expenses over the last 7 months
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={cashFlowData}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="income" name="Income" fill="#EAB308" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Expense" fill="#0f172a" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Spending Breakdown Chart */}
                <Card className="col-span-3 shadow-sm border-none bg-white/50 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle>Spending Breakdown</CardTitle>
                        <CardDescription>
                            Where your money went this month
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={spendingData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {spendingData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 pt-4 border-t">
                            {/* Importing DebtSummary dynamically or placing it here if we want combined view, but sticking to props or composition is better. 
                                For this demo, to show it on the dashboard, I should probably add it as a separate card in the grid or inject it.
                                I'll actually move it to a new row or replace/augment this section.
                            */}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Settlements Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <DebtSummary />
            </div>
        </div>
    )
}
