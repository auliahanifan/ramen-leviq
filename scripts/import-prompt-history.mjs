import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const NOISE_PREFIX =
  /^<(task-notification|system-reminder|local-command|user-prompt-submit-hook|command-)/;

function isGenuinePrompt(entry) {
  return (
    entry.type === "user" &&
    entry.isSidechain === false &&
    typeof entry.message?.content === "string" &&
    !entry.toolUseResult &&
    !NOISE_PREFIX.test(entry.message.content)
  );
}

function isAnswerEntry(entry) {
  return (
    entry.type === "user" &&
    entry.isSidechain === false &&
    entry.toolUseResult?.answers &&
    Array.isArray(entry.toolUseResult?.questions)
  );
}

function formatAnswer(entry) {
  const { questions, answers } = entry.toolUseResult;
  return questions
    .map((q) => `Q: ${q.question}\nA: ${answers[q.question] ?? "-"}`)
    .join("\n\n");
}

function findResponseMeta(entries, fromIndex) {
  for (let j = fromIndex + 1; j < entries.length; j++) {
    const e = entries[j];
    if (e.type === "assistant" && e.isSidechain === false) {
      return { model: e.message?.model ?? null, effort: e.effort ?? null };
    }
  }
  return { model: null, effort: null };
}

async function readPrompts(filePath) {
  const raw = await readFile(filePath, "utf8");
  const entries = raw
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const rows = [];

  entries.forEach((entry, i) => {
    if (isGenuinePrompt(entry)) {
      const { model, effort } = findResponseMeta(entries, i);
      rows.push({
        id: entry.uuid,
        content: entry.message.content.trim(),
        prompted_at: entry.timestamp,
        session_id: entry.sessionId,
        kind: "prompt",
        model,
        effort,
        mode: entry.permissionMode ?? null,
      });
    } else if (isAnswerEntry(entry)) {
      const { model, effort } = findResponseMeta(entries, i);
      rows.push({
        id: entry.uuid,
        content: formatAnswer(entry),
        prompted_at: entry.timestamp,
        session_id: entry.sessionId,
        kind: "answer",
        model,
        effort,
        mode: entry.permissionMode ?? null,
      });
    }
  });

  return rows;
}

async function main() {
  const transcriptsDir = path.join(
    homedir(),
    ".claude",
    "projects",
    process.cwd().replace(/\//g, "-")
  );

  const entries = await readdir(transcriptsDir, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith(".jsonl"))
    .map((e) => path.join(transcriptsDir, e.name));

  const rows = (await Promise.all(files.map(readPrompts))).flat();

  if (rows.length === 0) {
    console.log("No prompts found.");
    return;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { error } = await supabase
    .from("prompts")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    throw error;
  }

  console.log(`Imported ${rows.length} prompt(s) from ${files.length} session file(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
