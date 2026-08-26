import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card } from "../(app)/_components/card";

export const dynamic = "force-dynamic";

const TIMEZONE = "Asia/Jakarta";

function dateKey(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function formatDateLabel(dateKeyStr: string) {
  return new Date(`${dateKeyStr}T00:00:00Z`).toLocaleDateString("id-ID", {
    timeZone: TIMEZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PromptHistoriesPage() {
  const { data: prompts } = await supabase
    .from("prompts")
    .select("prompted_at")
    .order("prompted_at", { ascending: false });

  const countByDate = new Map<string, number>();
  for (const prompt of prompts ?? []) {
    const key = dateKey(prompt.prompted_at);
    countByDate.set(key, (countByDate.get(key) ?? 0) + 1);
  }

  const dates = Array.from(countByDate.keys()).sort((a, b) =>
    b.localeCompare(a)
  );

  return (
    <div className="flex flex-1 flex-col bg-paper px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="mb-2 font-display text-2xl font-bold text-ink">
          Riwayat Prompt
        </h1>
        <p className="mb-6 text-sm text-muted">
          Kumpulan prompt asli yang dipakai untuk membangun project ini,
          dikelompokkan per hari.
        </p>

        {dates.length === 0 ? (
          <p className="text-sm text-muted">Belum ada prompt yang tercatat.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {dates.map((date) => (
              <li key={date}>
                <Link href={`/prompt-histories/${date}`}>
                  <Card
                    padding="compact"
                    className="flex items-center justify-between text-ink"
                  >
                    <span className="text-sm font-medium">
                      {formatDateLabel(date)}
                    </span>
                    <span className="text-xs text-muted">
                      {countByDate.get(date)} prompt
                    </span>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
