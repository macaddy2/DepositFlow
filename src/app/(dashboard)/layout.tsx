import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, FileText, User, LogOut, ShieldCheck, Bell, Settings, Video, ClipboardCheck, Wrench, FileCheck2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

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

    const userInitial = user.email?.[0]?.toUpperCase() || 'U'
    const userEmail = user.email || 'user@example.com'

    const navItems = [
        { href: '/dashboard', icon: Home, label: 'Dashboard' },
        { href: '/onboarding', icon: FileText, label: 'New Case' },
        { href: '/video-walkthrough', icon: Video, label: 'Video Walkthrough' },
        { href: '/assessment', icon: ClipboardCheck, label: 'Assessment' },
        { href: '/repairs', icon: Wrench, label: 'Repairs' },
        { href: '/evidence', icon: FileCheck2, label: 'Evidence' },
        { href: '/profile', icon: User, label: 'Profile' },
    ]

    return (
        <div className="flex h-screen bg-slate-100">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col bg-gradient-to-b from-[#1A2332] to-[#0f1820] md:flex">
                {/* Logo */}
                <div className="flex h-16 items-center gap-2 px-6">
                    <ShieldCheck className="w-6 h-6 text-[#02C39A]" />
                    <span className="text-xl font-bold text-white">
                        Deposit<span className="text-[#02C39A]">Guard</span>
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200"
                        >
                            <item.icon className="h-5 w-5 text-slate-400 group-hover:text-[#02C39A] transition-colors" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <Separator className="bg-white/10" />

                {/* User Section */}
                <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-white/5">
                        <Avatar className="h-9 w-9 border-2 border-[#02C39A]/50">
                            <AvatarFallback className="bg-gradient-to-br from-[#028090] to-[#02C39A] text-white font-semibold text-sm">
                                {userInitial}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{userEmail}</p>
                            <p className="text-xs text-slate-400">Tenant</p>
                        </div>
                    </div>

                    <form action={signOut}>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="flex flex-col flex-1">
                <header className="md:hidden flex items-center justify-between h-14 px-4 bg-white border-b">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#028090]" />
                        <span className="font-bold text-[#1A2332]">Deposit<span className="text-[#028090]">Guard</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon-sm">
                            <Bell className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                            <Settings className="h-4 w-4 text-slate-600" />
                        </Button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
