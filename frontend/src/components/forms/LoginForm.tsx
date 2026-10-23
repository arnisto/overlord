"use client";

import { useActionState, useRef } from "react";
import { login, type LoginState } from "@/lib/actions/auth";

/** Comptes créés par le jeu de données de démonstration (voir le README). */
const DEMO_ACCOUNTS = ["Thomas_PEA", "Vincent_ETF", "Odile.Retraite", "Karim_Immo"];
const DEMO_PASSWORD = "Demo1234!";

const inputClass =
  "mt-1 w-full rounded-control border border-line bg-surface px-3 py-2 text-[15px] focus:border-line-strong focus:outline-none";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(login, {});
  const formRef = useRef<HTMLFormElement>(null);

  const fillDemoAccount = (username: string) => {
    const form = formRef.current;
    if (!form) return;
    (form.elements.namedItem("identifier") as HTMLInputElement).value = username;
    (form.elements.namedItem("password") as HTMLInputElement).value = DEMO_PASSWORD;
    form.requestSubmit();
  };

  return (
    <>
      <form ref={formRef} action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="identifier" className="text-sm font-medium">
            Pseudo ou e-mail
          </label>
          <input id="identifier" name="identifier" autoComplete="username" defaultValue={state.identifier} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium">
            Mot de passe
          </label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
        </div>
        {state.error && (
          <p role="alert" className="text-sm text-brand-text">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-control bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
        >
          {isPending ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <div className="mt-6 border-t border-line pt-5">
        <p className="text-sm font-medium">Comptes de démonstration</p>
        <p className="text-[13px] text-ink-3">Mot de passe : {DEMO_PASSWORD}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((username) => (
            <button
              key={username}
              type="button"
              disabled={isPending}
              onClick={() => fillDemoAccount(username)}
              className="rounded-full border border-line px-3 py-1 text-sm hover:bg-surface-2"
            >
              {username}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
