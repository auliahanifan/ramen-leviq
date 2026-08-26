import { headers } from "next/headers";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";
import { Card } from "../_components/card";
import PrintButton from "./print-button";

export const dynamic = "force-dynamic";

export default async function QrPage() {
  const [{ data: tables }, headerList] = await Promise.all([
    supabase.from("tables").select("id, nomor").order("nomor"),
    headers(),
  ]);

  const proto = headerList.get("x-forwarded-proto") ?? "https";
  const host = headerList.get("host");
  const baseUrl = `${proto}://${host}`;

  const tablesWithQr = await Promise.all(
    (tables ?? []).map(async (table) => {
      const url = `${baseUrl}/order?table=${table.id}`;
      const svg = await QRCode.toString(url, {
        type: "svg",
        margin: 1,
        width: 220,
      });
      return { ...table, url, svg };
    })
  );

  return (
    <div className="flex flex-1 flex-col bg-paper px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <h1 className="font-display text-display font-bold text-ink">
            QR Meja
          </h1>
          <PrintButton />
        </div>

        {tablesWithQr.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 print:grid-cols-3 print:gap-6">
            {tablesWithQr.map((table) => (
              <Card
                key={table.id}
                padding="compact"
                className="print:break-inside-avoid print:border-2 print:border-ink print:shadow-none"
              >
                <a
                  href={table.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 text-center text-inherit no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                  <div
                    className="w-full [&_svg]:h-auto [&_svg]:w-full"
                    dangerouslySetInnerHTML={{ __html: table.svg }}
                  />
                  <p className="font-display text-lg font-bold text-ink">
                    Meja {table.nomor}
                  </p>
                </a>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center text-sm text-muted">
            Belum ada meja.
          </Card>
        )}
      </div>
    </div>
  );
}
