
import Link from "next/link";
import { ArrowRight, ShieldCheck, FileText, Users, Video, ClipboardCheck, Wrench, FileCheck2, PoundSterling, ChevronRight, Star } from "lucide-react";

const HOW_IT_WORKS_STEPS = [
  { icon: Video, title: "Video Walkthrough", desc: "Record a room-by-room video on your phone (15 min)" },
  { icon: ClipboardCheck, title: "Risk Assessment", desc: "We review and flag items as green / amber / red" },
  { icon: Wrench, title: "Artisan Repairs", desc: "Verified tradespeople fix issues before your landlord sees them" },
  { icon: FileCheck2, title: "Evidence Trail", desc: "Before/after photos create your documented defence" },
  { icon: PoundSterling, title: "Deposit Back", desc: "Most deposits returned in full. We handle any residual dispute at 10%." },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Proactive Prevention",
    desc: "We fix problems before your landlord finds them — preventing deductions at source.",
    bg: "bg-[#028090]/10",
    iconColor: "text-[#028090]",
  },
  {
    icon: FileText,
    title: "Expert Evidence Trail",
    desc: "Before/after documentation and professional assessment create an airtight defence.",
    bg: "bg-[#02C39A]/10",
    iconColor: "text-[#02C39A]",
  },
  {
    icon: Users,
    title: "Verified Artisan Network",
    desc: "Our vetted tradespeople handle cleaning and repairs to a guaranteed standard.",
    bg: "bg-[#1A2332]/10",
    iconColor: "text-[#1A2332]",
  },
];

const STATS = [
  { value: "4.2M", label: "deposits protected in the UK" },
  { value: "30–40%", label: "of tenants face deductions" },
  { value: "<15%", label: "ever dispute" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2 font-bold text-xl" href="/">
          <ShieldCheck className="h-6 w-6 text-[#028090]" />
          <span className="text-[#1A2332]">Deposit<span className="text-[#028090]">Guard</span></span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium text-slate-600 hover:text-[#028090] transition" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium text-slate-600 hover:text-[#028090] transition" href="#how-it-works">
            How It Works
          </Link>
          <Link
            className="text-sm font-medium bg-[#028090] text-white px-5 py-2.5 rounded-lg hover:bg-[#026d7a] transition shadow-sm"
            href="/login"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-28 lg:py-36 bg-gradient-to-b from-[#028090]/5 via-white to-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#02C39A]/10 text-[#028090] text-sm font-medium">
                <ShieldCheck className="h-4 w-4" />
                Inspect, Repair & Recover
              </div>
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-[#1A2332]">
                  Don&apos;t Lose Your Deposit.{" "}
                  <span className="text-[#028090]">Prevent It.</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-slate-600 md:text-xl leading-relaxed">
                  Submit a video walkthrough. We assess the risks, dispatch repairs, and build your evidence trail — all before your landlord inspects.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-[#028090] px-8 text-base font-semibold text-white shadow-lg shadow-[#028090]/25 transition-all hover:bg-[#026d7a] hover:shadow-[#028090]/40 hover:scale-[1.02] active:scale-[0.98]"
                  href="/login"
                >
                  Start My Free Assessment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-slate-200 bg-white px-8 text-base font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
                  href="#how-it-works"
                >
                  See How It Works
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Bar */}
        <section className="w-full py-8 bg-[#1A2332]">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="w-full py-16 md:py-24 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A2332]">How It Works</h2>
              <p className="text-slate-500 mt-3 text-lg max-w-2xl mx-auto">Five simple steps from notice to deposit back</p>
            </div>
            <div className="flex flex-col md:flex-row items-start justify-center gap-0">
              {HOW_IT_WORKS_STEPS.map((step, idx) => (
                <div key={step.title} className="flex items-center">
                  <div className="flex flex-col items-center text-center max-w-[200px]">
                    <div className="w-16 h-16 rounded-2xl bg-[#028090]/10 flex items-center justify-center mb-4">
                      <step.icon className="h-7 w-7 text-[#028090]" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#028090] text-white flex items-center justify-center text-sm font-bold mb-3">
                      {idx + 1}
                    </div>
                    <h3 className="text-base font-bold text-[#1A2332] mb-1">{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                  {idx < HOW_IT_WORKS_STEPS.length - 1 && (
                    <ChevronRight className="hidden md:block w-6 h-6 text-slate-300 mx-4 mt-8 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A2332]">Why DepositGuard?</h2>
              <p className="text-slate-500 mt-3 text-lg">Prevention is better than cure — and cheaper too</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col items-center space-y-4 text-center p-8 border rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  <div className={`p-4 rounded-2xl ${feature.bg}`}>
                    <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A2332]">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="w-full py-16 md:py-20 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A2332] mb-10">Trusted by Tenants Across London</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { name: "Sarah M.", quote: "They fixed a scuff mark I didn't even notice. Got my full deposit back!", rating: 5 },
                { name: "James K.", quote: "The video walkthrough was so easy. Took 15 minutes and saved me hundreds.", rating: 5 },
                { name: "Priya N.", quote: "I was dreading checkout. DepositGuard made it completely stress-free.", rating: 5 },
              ].map((testimonial) => (
                <div key={testimonial.name} className="bg-white p-6 rounded-2xl border shadow-sm">
                  <div className="flex gap-1 mb-3 justify-center">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm italic mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                  <p className="font-semibold text-sm text-[#1A2332]">{testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-20 bg-[#028090]">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Protect Your Deposit?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Start your free assessment today. No upfront costs, no obligation.
            </p>
            <Link
              className="inline-flex h-13 items-center justify-center rounded-lg bg-white px-10 text-base font-bold text-[#028090] shadow-lg transition-all hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98]"
              href="/login"
            >
              Start My Free Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A2332] text-white py-10">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#02C39A]" />
              <span className="font-bold">Deposit<span className="text-[#02C39A]">Guard</span></span>
            </div>
            <nav className="flex gap-6">
              <Link className="text-sm text-slate-400 hover:text-white transition" href="#">
                Terms of Service
              </Link>
              <Link className="text-sm text-slate-400 hover:text-white transition" href="#">
                Privacy Policy
              </Link>
              <Link className="text-sm text-slate-400 hover:text-white transition" href="mailto:support@depositguard.co.uk">
                Contact
              </Link>
            </nav>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-slate-500">&copy; 2026 DepositGuard Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
