import Link from "next/link";
import { ArrowDown, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  MOCK_MODEL_IMAGE,
  MOCK_PRODUCT_IMAGE,
  MOCK_PRODUCT_SHOT_IMAGES,
} from "@/lib/ai/mockResults";

const benefitBadges = [
  "Без сложной обработки",
  "Для маркетплейсов и каталогов",
  "Одежда, аксессуары, бижутерия",
  "Ручная проверка качества",
  "Генерация за минуту",
];

const demoSteps = [
  {
    title: "Исходник",
    description: "Фото одежды, белья или товара.",
    src: MOCK_PRODUCT_IMAGE,
  },
  {
    title: "AI-модель",
    description: "Выберите модель или создайте новую.",
    src: MOCK_MODEL_IMAGE,
  },
  {
    title: "Готовая карточка",
    description: "Проверьте результат и скачайте.",
    src: MOCK_PRODUCT_SHOT_IMAGES[0].url,
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-18">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
        <div>
          <Badge variant="violet" className="mb-5 px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Vitrina AI Studio
          </Badge>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            AI-студия товарных фото и видео для маркетплейсов
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            Создавайте фото на модели, точные карточки товара, фоны, Reels и
            короткие видео из одного изображения.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/studio"
              data-telegram-event="cta_click"
              data-telegram-label="hero_studio"
            >
              <Button size="lg" className="min-w-[200px]">
                Открыть студию
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="#how">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                Посмотреть пример
                <ArrowDown className="h-5 w-5" />
              </Button>
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {benefitBadges.map((benefit) => (
              <span
                key={benefit}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4 text-teal-700" />
                {benefit}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-border/80 bg-white p-3 shadow-2xl shadow-slate-200/70">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {demoSteps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="overflow-hidden rounded-[22px] border border-slate-100 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={step.src}
                    alt={step.title}
                    className="aspect-[4/5] w-full object-cover"
                  />
                </div>
                <div className="mt-3 px-1">
                  <p className="text-sm font-semibold text-slate-950">
                    {step.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {step.description}
                  </p>
                </div>
                {index < demoSteps.length - 1 && (
                  <div className="absolute -right-5 top-[42%] z-10 hidden h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-teal-700 shadow-lg sm:flex lg:hidden xl:flex">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
