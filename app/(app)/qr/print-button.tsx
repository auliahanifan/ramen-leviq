"use client";

import { Button } from "../_components/button";

export default function PrintButton() {
  return (
    <Button type="button" size="compact" onClick={() => window.print()}>
      Cetak
    </Button>
  );
}
