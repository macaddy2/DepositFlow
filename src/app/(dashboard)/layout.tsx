
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, FileText, User, LogOut } from 'lucide-react'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const signOut = async () => {
        'use server'
        const supabase = await createClient()
        await supabase.auth.signOut()
        return redirect('/login')
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col bg-white border-r md:flex">
                <div className="flex h-16 items-center justify-center border-b px-6">
                    <span className="text-xl font-bold text-blue-600">DepositFlow</span>
                </div>
                <nav className="flex-1 space-y-1 px-3 py-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
                    >
                        <Home className="h-5 w-5" />
                        Dashboard
                    </Link>
                    <Link
                        href="/onboarding"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
                    >
                        <FileText className="h-5 w-5" />
                        New Application
                    </Link>
                    <Link
                        href="/profile"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
                    >
                        <User className="h-5 w-5" />
                        Profile
                    </Link>
                </nav>
                <div className="border-t p-4">
                    <form action={signOut}>
                        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50">
                            <LogOut className="h-5 w-5" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}
