import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import MenuForm from "../../menu-form";
import { updateMenuItem } from "../../actions";

export default async function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data } = await supabase
    .from("menu_items")
    .select("nama, harga, kategori")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const action = updateMenuItem.bind(null, id);

  return <MenuForm title="Edit Menu" action={action} initialValues={data} />;
}
