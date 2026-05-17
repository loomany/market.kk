import { StudioShell } from "@/components/studio/StudioShell";

export const metadata = {
  title: "Студия",
  description: "Создавайте товарные фото для маркетплейсов, интернет-магазинов и каталогов",
};

export default function StudioPage() {
  return <StudioShell mockMode={process.env.AI_MOCK_MODE !== "0"} />;
}
