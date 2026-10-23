import { afterEach, describe, expect, it, vi } from "vitest";
import { StrapiError, strapiFetch } from "@/lib/strapi/client";

const mockFetch = (status: number, body: unknown) =>
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));

afterEach(() => vi.unstubAllGlobals());

describe("strapiFetch", () => {
  it("transmet le jeton et les paramètres de requête", async () => {
    mockFetch(200, { data: [] });
    await strapiFetch("/discussions", { token: "jwt", query: { page: 2, q: undefined } });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toMatch(/\/api\/discussions\?page=2$/);
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer jwt");
  });

  it("convertit une erreur de validation Strapi en erreurs par champ", async () => {
    mockFetch(400, {
      data: null,
      error: {
        status: 400,
        name: "ValidationError",
        message: "Discussion invalide.",
        details: { errors: [{ path: ["title"], message: "Le titre doit contenir au moins 10 caractères." }] },
      },
    });

    const error = await strapiFetch<never>("/discussions", { method: "POST", body: {} }).catch((e: StrapiError) => e);
    expect(error).toBeInstanceOf(StrapiError);
    expect(error.status).toBe(400);
    expect(error.fieldErrors).toEqual({ title: "Le titre doit contenir au moins 10 caractères." });
  });
});
