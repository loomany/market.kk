type AssetMissingNoticeProps = {
  title: string;
  body: string;
  checklistTitle?: string;
  checklist?: string[];
};

export function AssetMissingNotice({
  title,
  body,
  checklistTitle,
  checklist,
}: AssetMissingNoticeProps) {
  return (
    <section
      className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6"
      aria-label={title}
    >
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
      {checklist && checklist.length > 0 ? (
        <div className="mt-4">
          {checklistTitle ? (
            <h3 className="text-sm font-semibold text-slate-800">{checklistTitle}</h3>
          ) : null}
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
