import { describe, expect, it } from "vitest";
import { homeHref, parseDiscussionListParams } from "@/lib/search-params";

describe("parseDiscussionListParams", () => {
  it("applique des valeurs par défaut sûres", () => {
    expect(parseDiscussionListParams({ sort: "title:asc", page: "-3" })).toEqual({
      category: undefined,
      q: undefined,
      sort: "createdAt:desc",
      page: 1,
      pageSize: 10,
    });
  });

  it("conserve les filtres valides", () => {
    expect(parseDiscussionListParams({ category: "bourse", q: " PEA ", sort: "createdAt:asc", page: "2" })).toMatchObject({
      category: "bourse",
      q: "PEA",
      sort: "createdAt:asc",
      page: 2,
    });
  });
});

describe("homeHref", () => {
  const base = parseDiscussionListParams({ category: "bourse", q: "PEA" });

  it("garde les filtres courants et omet les valeurs par défaut", () => {
    expect(homeHref(base, { page: 2 })).toBe("/?category=bourse&q=PEA&page=2");
    expect(homeHref(base, { q: undefined })).toBe("/?category=bourse");
    expect(homeHref(parseDiscussionListParams({}))).toBe("/");
  });
});
