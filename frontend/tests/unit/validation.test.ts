import { describe, expect, it } from "vitest";
import { validateDiscussionForm, validateReply } from "@/lib/validation";

const valid = { title: "Assurance-vie après 70 ans ?", content: "Contexte", type: "question", category: "c1" };

describe("validateDiscussionForm", () => {
  it("accepte une discussion valide", () => {
    expect(validateDiscussionForm(valid)).toEqual({});
  });

  it("exige un titre d'au moins 10 caractères, espaces exclus", () => {
    expect(validateDiscussionForm({ ...valid, title: "Trop cour" }).title).toMatch(/au moins 10/);
    expect(validateDiscussionForm({ ...valid, title: "   PEA ?        " }).title).toMatch(/au moins 10/);
    expect(validateDiscussionForm({ ...valid, title: "Dix lettre" }).title).toBeUndefined();
  });

  it("exige le contenu, un type connu et une catégorie", () => {
    const errors = validateDiscussionForm({ title: valid.title, content: "  ", type: "sondage", category: "" });
    expect(Object.keys(errors).sort()).toEqual(["category", "content", "type"]);
  });
});

describe("validateReply", () => {
  it("refuse une réponse vide", () => {
    expect(validateReply("   ")).toBeDefined();
    expect(validateReply("Merci !")).toBeUndefined();
  });
});
