import {
  CheckCircle2,
  SlidersHorizontal,
  UploadCloud,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

const steps = [
  {
    icon: UploadCloud,
    title: "Загрузите товар",
    description:
      "Подойдёт фото одежды, бижутерии, сумки, обуви или другого небольшого товара.",
  },
  {
    icon: SlidersHorizontal,
    title: "Выберите режим",
    description:
      "Одежда на модели, товарное фото без модели или быстрое удаление фона.",
  },
  {
    icon: CheckCircle2,
    title: "Проверьте и скачайте",
    description:
      "Сравните результат с исходником, примите хороший вариант и скачайте изображение.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Как работает
          </h2>
          <p className="mt-3 text-lg leading-7 text-slate-600">
            Три простых шага от исходного фото до готовой карточки товара.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="relative overflow-hidden shadow-lg">
              <CardContent className="pt-8">
                <span className="absolute right-6 top-5 text-5xl font-bold text-slate-100">
                  {index + 1}
                </span>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[18px] bg-teal-50 text-teal-700">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-950">
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
