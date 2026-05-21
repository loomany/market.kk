import { humanEventLabel } from "@/lib/telegram/eventLabels";
import type { StoredVisitor, StoredVisitorEvent } from "@/lib/telegram/visitorStore";

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function VisitorTimeline({
  visitor,
  events,
}: {
  visitor: StoredVisitor | null;
  events: StoredVisitorEvent[];
}) {
  if (!visitor && events.length === 0) {
    return (
      <p className="text-slate-600">
        Нет данных в базе. Примените миграцию Supabase и проверьте{" "}
        <code className="text-sm">SUPABASE_SERVICE_ROLE_KEY</code>.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {visitor ? (
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
          <h2 className="text-base font-semibold text-slate-900">Сводка</h2>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Visitor ID</dt>
              <dd className="font-mono text-xs">{visitor.visitor_id}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Первый визит</dt>
              <dd>{formatTime(visitor.first_seen_at)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Последняя активность</dt>
              <dd>{formatTime(visitor.last_seen_at)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Источник (первый)</dt>
              <dd>{visitor.first_traffic_source ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Язык</dt>
              <dd>{visitor.locale?.toUpperCase() ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Страна</dt>
              <dd>{visitor.country ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Устройство</dt>
              <dd>{visitor.user_agent_summary ?? "—"}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <section>
        <h2 className="text-base font-semibold text-slate-900">
          Шаги ({events.length})
        </h2>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">Событий пока нет.</p>
        ) : (
          <ol className="mt-4 space-y-2">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:gap-4"
              >
                <time className="shrink-0 font-mono text-xs text-slate-500">
                  {formatTime(ev.created_at)}
                </time>
                <span className="font-medium text-slate-900">
                  {humanEventLabel(ev.event_type, ev.label)}
                </span>
                <span className="font-mono text-xs text-teal-800">{ev.path}</span>
                {ev.traffic_source ? (
                  <span className="text-xs text-slate-500">{ev.traffic_source}</span>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
