import { supabase } from "@/lib/supabase";
import MenuItemRow from "./menu-item-row";
import MenuItemCard from "./menu-item-card";
import { Card } from "../_components/card";
import { ButtonLink } from "../_components/button";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const { data: items } = await supabase
    .from("menu_items")
    .select("*")
    .order("kategori")
    .order("nama");

  return (
    <div className="flex flex-1 flex-col bg-paper px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-display font-bold text-ink">
            Kelola Menu
          </h1>
          <ButtonLink href="/menu/new" size="compact">
            + Tambah Menu
          </ButtonLink>
        </div>

        {items && items.length > 0 ? (
          <>
            <Card padding="none" className="sm:hidden">
              {items.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </Card>

            <Card padding="none" className="hidden overflow-x-auto sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-rule text-left text-xs font-semibold tracking-wide text-muted uppercase">
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Harga</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <MenuItemRow key={item.id} item={item} />
                  ))}
                </tbody>
              </table>
            </Card>
          </>
        ) : (
          <Card className="text-center text-sm text-muted">
            Belum ada menu.
          </Card>
        )}
      </div>
    </div>
  );
}
