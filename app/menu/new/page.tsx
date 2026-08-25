import MenuForm from "../menu-form";
import { createMenuItem } from "../actions";

export default function NewMenuItemPage() {
  return <MenuForm title="Tambah Menu" action={createMenuItem} />;
}
