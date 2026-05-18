import { StudioShell } from "@/components/studio/StudioShell";
import { getAiSafetyState } from "@/lib/ai/paidAiGuard";

export const metadata = {
  title: "Студия",
  description: "Создавайте товарные фото для маркетплейсов, интернет-магазинов и каталогов",
};

export default function StudioPage() {
  const aiSafety = getAiSafetyState();

  return (
    <StudioShell
      mockMode={aiSafety.mockMode}
      paidAiRunsAllowed={aiSafety.paidAiRunsAllowed}
    />
  );
}
