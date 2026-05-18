import { StudioPanelCard } from "@/components/studio/StudioPanelCard";

type PreviewCardProps = {
  title: string;
  url: string | null;
  empty: string;
  badge?: string;
};

export function PreviewCard({ title, url, empty, badge }: PreviewCardProps) {
  return (
    <StudioPanelCard title={title} badge={badge}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`Предпросмотр: ${title}`}
          className="max-h-[460px] min-h-[220px] w-full object-contain"
        />
      ) : (
        <div className="flex min-h-[260px] items-center justify-center p-4 text-center text-sm leading-6 text-slate-500">
          {empty}
        </div>
      )}
    </StudioPanelCard>
  );
}
