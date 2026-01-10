'use client'

import Link from 'next/link'
import { Plus, TrendingUp, Clock, Wallet, ArrowRight, FileCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const statsCards = [
    {
        title: 'Active Applications',
        value: '0',
        change: 'Start your first application',
        icon: FileCheck,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
    },
    {
        title: 'Pending Payouts',
        value: '£0',
        change: 'No pending payouts',
        icon: Clock,
        color: 'from-amber-500 to-orange-500',
        bgColor: 'bg-amber-50',
    },
    {
        title: 'Total Received',
        value: '£0',
        change: 'Complete an application to get started',
        icon: Wallet,
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-50',
    },
]

const recentApplications = [
    // Empty state - no applications yet
]

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Welcome back! 👋</h1>
                    <p className="text-slate-500 mt-1">Manage your deposit advances and applications.</p>
                </div>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25">
                    <Link href="/onboarding">
                        <Plus className="h-4 w-4 mr-2" />
                        New Application
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {statsCards.map((stat) => (
                    <Card key={stat.title} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                                    <p className="text-xs text-slate-400">{stat.change}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                    <stat.icon className={`h-6 w-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ color: stat.color.includes('blue') ? '#3b82f6' : stat.color.includes('amber') ? '#f59e0b' : '#10b981' }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* CTA Card */}
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
                    <CardHeader className="relative">
                        <CardTitle className="text-xl font-bold">Get Your Deposit Advanced</CardTitle>
                        <CardDescription className="text-slate-300">
                            Moving out soon? We&apos;ll advance your deposit so you&apos;re never stuck paying double.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">1</div>
                                <span>Tell us about your tenancy</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">2</div>
                                <span>Accept your instant offer</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">3</div>
                                <span>Receive cash same-day</span>
                            </div>
                        </div>
                        <Button asChild className="mt-6 w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold">
                            <Link href="/onboarding">
                                Start Now
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Application Progress Card */}
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            Your Progress
                        </CardTitle>
                        <CardDescription>Complete your profile to get started</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Profile completion</span>
                                <span className="font-medium text-slate-900">25%</span>
                            </div>
                            <Progress value={25} className="h-2" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                                <span className="text-sm font-medium text-green-800">✓ Account created</span>
                                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Complete</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                                <span className="text-sm font-medium text-slate-600">Add personal details</span>
                                <Badge variant="outline" className="text-slate-500">Pending</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                                <span className="text-sm font-medium text-slate-600">Add bank details</span>
                                <Badge variant="outline" className="text-slate-500">Pending</Badge>
                            </div>
                        </div>

                        <Button asChild variant="outline" className="w-full">
                            <Link href="/profile">
                                Complete Profile
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Applications Table */}
            <Card className="border-0 shadow-md">
                <CardHeader className="border-b bg-slate-50/50">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold">Recent Applications</CardTitle>
                        <Badge variant="secondary">0 total</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {recentApplications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <FileCheck className="h-8 w-8 text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-medium">No applications yet</p>
                            <p className="text-sm text-slate-400 mt-1">Start your first application to see it here</p>
                            <Button asChild className="mt-4" variant="outline">
                                <Link href="/onboarding">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Start Application
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {/* Table rows would go here */}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
