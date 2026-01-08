
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-gray-500">Manage your deposit advances here.</p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Call to Action Card */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold">Start New Application</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Moving out soon? Get your deposit advanced today.
                    </p>
                    <Link
                        href="/onboarding"
                        className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        Start Now
                    </Link>
                </div>

                {/* Placeholder for Active Applications */}
                <div className="rounded-xl border bg-white p-6 shadow-sm opacity-50">
                    <h3 className="text-lg font-semibold">No Active Advances</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Your active applications will appear here.
                    </p>
                </div>
            </div>
        </div>
    )
}
