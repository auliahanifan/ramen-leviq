"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { Card } from "../(app)/_components/card";
import { Button } from "../(app)/_components/button";
import { Label, inputClass, ErrorText } from "../(app)/_components/field";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="flex flex-1 items-center justify-center bg-paper px-4">
      <Card accentEdge className="w-full max-w-sm">
        <form action={formAction}>
          <h1 className="mb-6 font-display text-3xl font-black tracking-tight text-ink">
            Kasir Ramen
          </h1>
          <Label htmlFor="password">Password</Label>
          <input
            id="password"
            name="password"
            type="password"
            autoFocus
            autoComplete="current-password"
            className={`mb-4 ${inputClass({ error: Boolean(state.error) })}`}
          />
          {state.error && <ErrorText>{state.error}</ErrorText>}
          <Button type="submit" fullWidth disabled={pending} className="mt-2">
            {pending ? "Masuk..." : "Masuk"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
