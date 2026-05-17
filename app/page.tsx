import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { UseCases } from "@/components/landing/UseCases";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-950">
            Vitrina <span className="text-teal-700">AI</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#how" className="hover:text-slate-950">
              Как работает
            </a>
            <a href="#features" className="hover:text-slate-950">
              Возможности
            </a>
            <a href="#audiences" className="hover:text-slate-950">
              Для кого
            </a>
            <Link href="/studio" className="hover:text-slate-950">
              Студия
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/studio"
              className="rounded-[16px] bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-900/15 transition-colors hover:bg-teal-800"
            >
              Открыть студию
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Hero />
        <HowItWorks />
        <UseCases />
      </main>

      <footer className="border-t border-border bg-white px-4 py-10 text-center text-sm text-muted">
        Vitrina AI Studio · AI-студия товарных фото для маркетплейсов
      </footer>
    </>
  );
}
