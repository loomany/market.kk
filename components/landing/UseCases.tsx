import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Gem,
  ImageIcon,
  RefreshCw,
  Scissors,
  Shirt,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const features = [
  {
    icon: Shirt,
    title: "Одежда на модели",
    description:
      "Платья, футболки, костюмы и бельё на нейтральной взрослой AI-модели.",
    badge: "Для одежды",
  },
  {
    icon: Gem,
    title: "Бижутерия и аксессуары",
    description:
      "Чистые кадры для украшений, сумок, обуви и небольших товаров.",
    badge: "Для каталога",
  },
  {
    icon: Sparkles,
    title: "Product Shot",
    description:
      "Товарное фото без модели на белом, светлом или более красивом фоне.",
    badge: "Без модели",
  },
  {
    icon: ImageIcon,
    title: "Удаление фона",
    description:
      "Быстро убрать лишний фон у готового изображения по ссылке.",
    badge: "PNG",
  },
  {
    icon: CheckCircle2,
    title: "Проверка качества",
    description:
      "Чеклист помогает проверить цвет, форму, детали товара и чистоту фона.",
    badge: "Перед скачиванием",
  },
  {
    icon: RefreshCw,
    title: "Перегенерация",
    description:
      "Если вариант не подошёл, можно создать ещё один без сложных настроек.",
    badge: "Ещё варианты",
  },
];

const audiences = [
  "продавцы маркетплейсов",
  "продавцы Kaspi",
  "Wildberries и Ozon",
  "Instagram-магазины",
  "Shopify",
  "локальные интернет-магазины",
  "каталоги поставщиков",
  "шоурумы",
  "продавцы одежды",
  "продавцы бижутерии",
  "продавцы аксессуаров",
  "маркетплейс-менеджеры",
];

export function UseCases() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-16">
        <div id="features">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-3">
              Возможности
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Что можно делать
            </h2>
            <p className="mt-3 text-lg leading-7 text-slate-600">
              Vitrina AI помогает подготовить фото для карточек товаров,
              каталогов и витрин без сложной ручной обработки.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item) => (
              <Card
                key={item.title}
                className="transition-transform hover:-translate-y-0.5"
              >
                <CardContent>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-teal-50 text-teal-700">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline">{item.badge}</Badge>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div
          id="audiences"
          className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start"
        >
          <div>
            <Badge variant="outline" className="mb-3">
              Для кого
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Для продавцов на разных площадках
            </h2>
            <p className="mt-3 text-lg leading-7 text-slate-600">
              Kaspi — только один из примеров. Сервис подходит для
              маркетплейсов, интернет-магазинов, Instagram-витрин и каталогов.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {audiences.map((audience) => (
              <span
                key={audience}
                className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
              >
                {audience}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[28px] border border-amber-200 bg-amber-50/80 p-6 text-amber-950 shadow-lg shadow-amber-100/60">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-white text-warning">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Важно знать</h2>
                <p className="mt-2 text-sm leading-6">
                  AI может ошибаться: менять цвет, форму, узор или детали
                  товара. Поэтому в студии есть чеклист качества перед
                  скачиванием.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/70">
            <Scissors className="h-7 w-7 text-teal-200" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight">
              Попробовать в студии
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Откройте демо-режим, загрузите фото товара и пройдите весь
              сценарий без списаний.
            </p>
            <Link href="/studio" className="mt-5 inline-block">
              <Button variant="primary" size="lg">
                Открыть студию
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
