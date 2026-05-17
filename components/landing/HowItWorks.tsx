import { Camera, Download, UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

const steps = [
  {
    icon: Camera,
    title: "Загрузите фото товара",
    description:
      "Фото одежды на вешалке, flat-lay или на модели — мы подстроим обработку под тип снимка.",
  },
  {
    icon: UserRound,
    title: "Выберите AI-модель",
    description:
      "Готовый пресет студийной модели или своя референсная фотография для virtual try-on.",
  },
  {
    icon: Download,
    title: "Получите карточки",
    description:
      "Несколько вариантов для Kaspi и соцсетей: чистый фон, before/after и скачивание.",
  },
];

export function HowItWorks() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Как работает
          </h2>
          <p className="mt-3 text-slate-600">
            Три шага от исходника до готовой карточки маркетплейса
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="relative overflow-hidden">
              <CardContent className="pt-8">
                <span className="absolute right-6 top-6 text-5xl font-bold text-slate-100">
                  {index + 1}
                </span>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
