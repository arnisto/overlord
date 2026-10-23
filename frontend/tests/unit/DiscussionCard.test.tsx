import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DiscussionCard } from "@/components/DiscussionCard";
import type { DiscussionSummary } from "@/lib/strapi/types";

const discussion: DiscussionSummary = {
  documentId: "abc123",
  title: "Ouvrir un PEA avec 5 000 € : par où commencer ?",
  slug: "ouvrir-un-pea-avec-5-000-par-ou-commencer",
  type: "question",
  excerpt: "Je viens d'ouvrir un PEA en ligne…",
  createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  author: { id: 1, documentId: "u1", username: "Thomas_PEA" },
  category: { documentId: "c1", name: "Bourse & actions", slug: "bourse", color: "#007aff" },
  repliesCount: 4,
  hasBestReply: false,
};

describe("DiscussionCard", () => {
  it("affiche le titre, l'auteur, la catégorie, le nombre de réponses et la date", () => {
    render(<DiscussionCard discussion={discussion} />);

    expect(screen.getByRole("link", { name: discussion.title })).toHaveAttribute(
      "href",
      `/discussions/${discussion.slug}`,
    );
    expect(screen.getByText("Thomas_PEA")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bourse & actions" })).toHaveAttribute("href", "/?category=bourse");
    expect(screen.getByLabelText("4 réponses")).toBeInTheDocument();
    expect(screen.getByText("Question")).toBeInTheDocument();

    const time = screen.getByText(/il y a 2 heures/);
    expect(time).toHaveAttribute("datetime", discussion.createdAt);
  });

  it("signale une discussion résolue et accorde « réponse » au singulier", () => {
    render(<DiscussionCard discussion={{ ...discussion, repliesCount: 1, hasBestReply: true }} />);
    expect(screen.getByLabelText("1 réponse, résolue")).toBeInTheDocument();
  });
});
