import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VisitorTimeline } from "@/components/admin/VisitorTimeline";
import { verifyVisitorAdminKey } from "@/lib/telegram/visitorAdminUrl";
import {
  fetchVisitorTimeline,
  timelineFromProfile,
} from "@/lib/telegram/visitorStore";
import { getVisitorProfile } from "@/lib/telegram/visitorMemory";

export const metadata: Metadata = {
  title: "Visitor timeline",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ visitorId: string }>;
  searchParams: Promise<{ key?: string }>;
};

export default async function VisitorAdminPage({ params, searchParams }: PageProps) {
  const { visitorId } = await params;
  const { key } = await searchParams;

  if (!verifyVisitorAdminKey(key)) {
    notFound();
  }

  const decodedId = decodeURIComponent(visitorId);
  let { visitor, events } = await fetchVisitorTimeline(decodedId);

  if (events.length === 0) {
    const mem = getVisitorProfile(decodedId);
    if (mem) {
      events = timelineFromProfile(mem);
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          Карточка посетителя
        </h1>
        <p className="mt-2 font-mono text-sm text-slate-500">#{decodedId.slice(0, 12)}</p>
        <div className="mt-8">
          <VisitorTimeline visitor={visitor} events={events} />
        </div>
      </div>
    </main>
  );
}
