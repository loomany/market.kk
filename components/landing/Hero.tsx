import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-amber-100/50 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl text-center">
        <Badge variant="violet" className="mb-6 gap-1 px-3 py-1">
          <Sparkles className="h-3.5 w-3.5" />
          AI Product Photo Studio
        </Badge>

        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          AI-фото товаров для{" "}
          <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
            маркетплейсов
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
          Загрузите фото одежды, белья или аксессуара — получите чистые карточки
          на AI-модели для Kaspi, Instagram и каталога.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/studio">
            <Button size="lg" className="min-w-[200px]">
              Открыть студию
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-slate-500">
            Демо-режим · без регистрации
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3">
          {[
            { src: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop", label: "Исходник" },
            { src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop", label: "AI-модель" },
            { src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop", label: "Карточка" },
          ].map((item) => (
            <div
              key={item.label}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.label}
                className="aspect-[4/5] w-full object-cover"
              />
              <p className="py-2 text-sm font-medium text-slate-600">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
