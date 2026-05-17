import { Gem, ImageIcon, Shirt, Sparkle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const useCases = [
  {
    icon: Shirt,
    title: "Одежда на модели",
    description:
      "Платья, куртки, футболки — virtual try-on на студийную AI-модель с чистым фоном.",
    badge: "Try-On",
  },
  {
    icon: Sparkle,
    title: "Бельё и комплекты",
    description:
      "Коммерческий каталожный стиль для маркетплейса: adult-модели, нейтральные позы.",
    badge: "Lingerie",
  },
  {
    icon: Gem,
    title: "Бижутерия",
    description:
      "Чистый product shot, удаление фона и студийная подложка для карточки товара.",
    badge: "Accessories",
  },
  {
    icon: ImageIcon,
    title: "Фон для маркетплейса",
    description:
      "Белый или серый studio background, форматы 1:1 и 4:5 под Kaspi и Instagram.",
    badge: "Export",
  },
];

export function UseCases() {
  return (
    <section className="bg-slate-50/80 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Сценарии использования
          </h2>
          <p className="mt-3 text-slate-600">
            Для продавцов Kaspi, Wildberries и собственных каталогов
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {useCases.map((item) => (
            <Card key={item.title} className="transition-shadow hover:shadow-xl">
              <CardContent>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline">{item.badge}</Badge>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
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
    </section>
  );
}
