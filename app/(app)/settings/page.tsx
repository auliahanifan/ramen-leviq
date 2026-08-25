import { supabase } from "@/lib/supabase";
import SettingsForm from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { data } = await supabase
    .from("settings")
    .select("tax_percent, service_charge_percent")
    .eq("id", 1)
    .single();

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <SettingsForm
        initialTaxPercent={data?.tax_percent ?? 0}
        initialServiceChargePercent={data?.service_charge_percent ?? 0}
      />
    </div>
  );
}
