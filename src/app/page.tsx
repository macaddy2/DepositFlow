
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center font-bold text-xl text-blue-600" href="#">
          DepositFlow
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#how-it-works">
            How It Works
          </Link>
          <Link
            className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            href="/login"
          >
            Get Started
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-blue-50 to-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-slate-900">
                  Get Your Deposit Back <span className="text-blue-600">Instantly</span>.
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Don't wait weeks for your landlord. We advance your deposit today and handle the cleaning & repairs.
                </p>
              </div>
              <div className="space-x-4">
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700"
                  href="/login"
                >
                  Unlock My Deposit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950"
                  href="#"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-xl shadow-sm hover:shadow-md transition">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold">Instant Liquidity</h2>
                <p className="text-gray-500">
                  Get up to 70% of your deposit advanced immediately to pay for your next home.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-xl shadow-sm hover:shadow-md transition">
                <div className="p-3 bg-green-100 rounded-full">
                  <ShieldCheck className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold">Zero Liability</h2>
                <p className="text-gray-500">
                  We take on the risk. Once you sign, the checkout and disputes are our problem, not yours.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-xl shadow-sm hover:shadow-md transition">
                <div className="p-3 bg-purple-100 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold">Professional Checkout</h2>
                <p className="text-gray-500">
                  Our "Strike Team" cleans and repairs your flat to guarantee the landlord approves the release.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2024 DepositFlow. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
