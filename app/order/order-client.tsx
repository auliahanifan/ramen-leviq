"use client";

import { useState, useTransition } from "react";
import { submitCart } from "./actions";
import { Card } from "../(app)/_components/card";
import { Button } from "../(app)/_components/button";
import { Label, inputClass, ErrorText } from "../(app)/_components/field";
import { Price } from "../(app)/_components/price";

const CUSTOMER_NAME_KEY = "ramen-order-customer-name";

type MenuItem = {
  id: string;
  nama: string;
  harga: number;
  kategori: string;
  image_url: string | null;
};

type SubmittedItem = {
  id: string;
  qty: number;
  price_at_order: number;
  customer_name: string | null;
  menu_items: { nama: string } | null;
};

function groupByKategori(menu: MenuItem[]) {
  const groups = new Map<string, MenuItem[]>();
  for (const item of menu) {
    const group = groups.get(item.kategori) ?? [];
    group.push(item);
    groups.set(item.kategori, group);
  }
  return Array.from(groups.entries());
}

export default function OrderClient({
  tableId,
  tableNomor,
  menu,
  submittedItems,
}: {
  tableId: string;
  tableNomor: number;
  menu: MenuItem[];
  submittedItems: SubmittedItem[];
}) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (window.localStorage.getItem(CUSTOMER_NAME_KEY) ?? "")
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const menuById = new Map(menu.map((item) => [item.id, item]));
  const cartEntries = Object.entries(cart).filter(([, qty]) => qty > 0);
  const cartCount = cartEntries.reduce((sum, [, qty]) => sum + qty, 0);
  const cartSubtotal = cartEntries.reduce((sum, [menuItemId, qty]) => {
    const item = menuById.get(menuItemId);
    return sum + (item ? item.harga * qty : 0);
  }, 0);
  const submittedSubtotal = submittedItems.reduce(
    (sum, item) => sum + item.qty * item.price_at_order,
    0
  );

  function setQty(menuItemId: string, qty: number) {
    setCart((prev) => ({ ...prev, [menuItemId]: Math.max(0, qty) }));
  }

  function handleSubmit() {
    setError(null);
    const items = cartEntries.map(([menuItemId, qty]) => ({ menuItemId, qty }));
    startTransition(async () => {
      const result = await submitCart(tableId, customerName, items);
      if (result.error) {
        setError(result.error);
        return;
      }
      window.localStorage.setItem(CUSTOMER_NAME_KEY, customerName.trim());
      setCart({});
    });
  }

  return (
    <div className="flex flex-1 flex-col bg-paper">
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 pb-8">
        <h1 className="mb-6 font-display text-display font-bold text-ink">
          Meja {tableNomor}
        </h1>

        {submittedItems.length > 0 && (
          <Card padding="none" className="mb-8">
            <h2 className="border-b border-rule px-4 py-3 text-sm font-semibold tracking-wide text-muted uppercase">
              Pesanan Anda
            </h2>
            <table className="w-full">
              <tbody>
                {submittedItems.map((item) => (
                  <tr key={item.id} className="border-b border-rule last:border-0">
                    <td className="px-4 py-3 text-sm text-ink">
                      {item.menu_items?.nama}
                      {item.customer_name && (
                        <span className="block text-xs text-muted">
                          oleh {item.customer_name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-outlier text-ink-2">
                      {item.qty}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-ink">
                      <Price value={item.qty * item.price_at_order} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-ink">
                    Subtotal
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-ink">
                    <Price value={submittedSubtotal} />
                  </td>
                </tr>
              </tfoot>
            </table>
          </Card>
        )}

        <div className="space-y-8">
          {groupByKategori(menu).map(([kategori, items]) => (
            <section key={kategori}>
              <h2 className="mb-3 font-display text-lg font-bold text-ink">
                {kategori}
              </h2>
              <Card padding="none">
                {items.map((item) => {
                  const qty = cart[item.id] ?? 0;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 border-b border-rule p-3 last:border-0"
                    >
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image_url}
                          alt={item.nama}
                          loading="lazy"
                          className="h-16 w-16 shrink-0 rounded-input object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 shrink-0 rounded-input bg-paper-3" />
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-medium text-ink">
                          {item.nama}
                        </p>
                        <Price value={item.harga} className="text-sm text-muted" />
                      </div>

                      {qty > 0 ? (
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setQty(item.id, qty - 1)}
                            className="flex h-10 w-10 items-center justify-center rounded-button border-2 border-ink-2 text-lg font-medium text-ink-2 active:translate-y-px"
                          >
                            −
                          </button>
                          <span className="w-6 text-center font-outlier text-base text-ink">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(item.id, qty + 1)}
                            className="flex h-10 w-10 items-center justify-center rounded-button border-2 border-ink-2 text-lg font-medium text-ink-2 active:translate-y-px"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          size="compact"
                          onClick={() => setQty(item.id, 1)}
                          className="shrink-0"
                        >
                          + Tambah
                        </Button>
                      )}
                    </div>
                  );
                })}
              </Card>
            </section>
          ))}
        </div>
      </div>

      {cartCount > 0 && (
        <div className="sticky bottom-0 border-t-4 border-accent-2 bg-paper-2 px-4 py-4 shadow-offset">
          <div className="mx-auto w-full max-w-2xl space-y-3">
            <div>
              <Label htmlFor="customer_name">Nama kamu</Label>
              <input
                id="customer_name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nama depan"
                className={inputClass()}
              />
            </div>

            {error && <ErrorText>{error}</ErrorText>}

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-ink-2">
                {cartCount} item &middot; <Price value={cartSubtotal} />
              </span>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isPending || !customerName.trim()}
              >
                {isPending ? "Mengirim..." : "Kirim Pesanan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
