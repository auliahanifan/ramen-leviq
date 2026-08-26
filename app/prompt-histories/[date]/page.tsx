import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card } from "../../(app)/_components/card";
import { Badge } from "../../(app)/_components/badge";

export const dynamic = "force-dynamic";

const TIMEZONE = "Asia/Jakarta";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function formatDateLabel(dateKeyStr: string) {
  return new Date(`${dateKeyStr}T00:00:00+07:00`).toLocaleDateString("id-ID", {
    timeZone: TIMEZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
}

const EFFORT_LABELS: Record<string, string> = {
  low: "Rendah",
  medium: "Sedang",
  high: "Tinggi",
  xhigh: "Sangat tinggi",
  max: "Maksimal",
};

const MODE_LABELS: Record<string, string> = {
  plan: "Mode Plan",
  auto: "Mode Auto",
};

function formatModel(model: string) {
  const match = /^claude-(.+)$/.exec(model);
  if (!match) return model;
  return match[1]
    .split("-")
    .map((part) => (/^\d+$/.test(part) ? part : part[0].toUpperCase() + part.slice(1)))
    .join(" ");
}

function formatMeta(prompt: { model: string | null; effort: string | null; mode: string | null }) {
  if (!prompt.model || !prompt.effort) return null;
  const parts = [
    formatModel(prompt.model),
    `Effort ${EFFORT_LABELS[prompt.effort] ?? prompt.effort}`,
  ];
  if (prompt.mode) {
    parts.push(MODE_LABELS[prompt.mode] ?? `Mode ${prompt.mode}`);
  }
  return parts.join(" · ");
}

export default async function PromptHistoryDetailPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  if (!DATE_RE.test(date)) {
    notFound();
  }

  const start = new Date(`${date}T00:00:00+07:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  const { data: prompts } = await supabase
    .from("prompts")
    .select("id, content, prompted_at, session_id, kind, model, effort, mode")
    .gte("prompted_at", start.toISOString())
    .lt("prompted_at", end.toISOString())
    .order("prompted_at", { ascending: true });

  const bySession = new Map<string, NonNullable<typeof prompts>>();
  for (const prompt of prompts ?? []) {
    const items = bySession.get(prompt.session_id) ?? [];
    items.push(prompt);
    bySession.set(prompt.session_id, items);
  }
  const sessions = Array.from(bySession, ([sessionId, items]) => ({
    sessionId,
    items,
  })).sort(
    (a, b) =>
      new Date(a.items[0].prompted_at).getTime() -
      new Date(b.items[0].prompted_at).getTime()
  );

  return (
    <div className="flex flex-1 flex-col bg-paper px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/prompt-histories"
          className="mb-4 inline-block text-sm text-muted hover:text-ink"
        >
          &larr; Semua tanggal
        </Link>
        <h1 className="mb-6 font-display text-2xl font-bold text-ink">
          {formatDateLabel(date)}
        </h1>

        {sessions.length === 0 ? (
          <p className="text-sm text-muted">Tidak ada prompt di tanggal ini.</p>
        ) : (
          <div className="flex flex-col gap-8">
            {sessions.map((session, index) => (
              <div key={session.sessionId}>
                <h2 className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
                  Sesi {index + 1} &middot; mulai{" "}
                  {formatTime(session.items[0].prompted_at)}
                </h2>
                <ul className="flex flex-col gap-4">
                  {session.items.map((prompt) => (
                    <li key={prompt.id}>
                      <Card padding="compact">
                        <div className="mb-2 flex items-center gap-2">
                          <p className="text-xs font-medium text-muted">
                            {formatTime(prompt.prompted_at)}
                          </p>
                          {prompt.kind === "answer" && (
                            <Badge tone="info">Menjawab pertanyaan</Badge>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-ink">
                          {prompt.content}
                        </p>
                        {formatMeta(prompt) && (
                          <p className="mt-3 text-xs text-muted">
                            {formatMeta(prompt)}
                          </p>
                        )}
                      </Card>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
