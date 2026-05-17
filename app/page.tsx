import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { UseCases } from "@/components/landing/UseCases";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-bold text-slate-900">
            Kaspi <span className="text-violet-600">AI</span> Studio
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <a href="#how" className="text-slate-600 hover:text-slate-900">
              Как работает
            </a>
            <Link
              href="/studio"
              className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700"
            >
              Студия
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <Hero />
        <div id="how">
          <HowItWorks />
        </div>
        <UseCases />
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
        Kaspi AI Product Photo Studio · MVP Stage 1
      </footer>
    </>
  );
}
