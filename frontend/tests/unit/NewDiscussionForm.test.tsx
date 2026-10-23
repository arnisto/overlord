import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const createDiscussion = vi.fn(async () => ({}));
vi.mock("@/lib/actions/discussions", () => ({ createDiscussion }));

const { NewDiscussionForm } = await import("@/components/forms/NewDiscussionForm");

const categories = [{ documentId: "c1", name: "Bourse & actions", slug: "bourse" }];

describe("NewDiscussionForm", () => {
  it("affiche les erreurs de validation sans appeler le serveur", async () => {
    const user = userEvent.setup();
    render(<NewDiscussionForm categories={categories} />);

    await user.type(screen.getByLabelText("Titre"), "Court");
    await user.click(screen.getByRole("button", { name: "Publier" }));

    expect(screen.getByText(/au moins 10 caractères/)).toBeInTheDocument();
    expect(screen.getByText("Le contenu est obligatoire.")).toBeInTheDocument();
    expect(screen.getByText("La catégorie est obligatoire.")).toBeInTheDocument();
    expect(screen.getByLabelText("Titre")).toHaveAttribute("aria-invalid", "true");
    expect(createDiscussion).not.toHaveBeenCalled();
  });

  it("présélectionne la catégorie passée dans l'URL", () => {
    render(<NewDiscussionForm categories={categories} defaultCategorySlug="bourse" />);
    expect(screen.getByLabelText("Catégorie")).toHaveValue("c1");
  });
});
