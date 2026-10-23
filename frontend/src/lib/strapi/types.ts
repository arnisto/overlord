/* Contrats de l'API Strapi tels que consommés par le frontend. */

export type DiscussionType = "question" | "discussion";

export type Category = {
  documentId: string;
  name: string;
  slug: string;
  description?: string | null;
  color: string;
};

export type Author = {
  id: number;
  documentId: string;
  username: string;
};

export type DiscussionSummary = {
  documentId: string;
  title: string;
  slug: string;
  type: DiscussionType;
  excerpt: string;
  createdAt: string;
  author: Author | null;
  category: Pick<Category, "documentId" | "name" | "slug" | "color"> | null;
  repliesCount: number;
  hasBestReply: boolean;
};

export type Reply = {
  documentId: string;
  content: string;
  createdAt: string;
  author: Author | null;
  helpfulCount: number;
  viewerHasVoted: boolean;
};

export type DiscussionDetail = Omit<DiscussionSummary, "excerpt" | "repliesCount" | "hasBestReply"> & {
  content: string;
  bestReplyId: string | null;
  replies: Reply[];
};

export type Pagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

export type SessionUser = {
  id: number;
  documentId: string;
  username: string;
};

/** Détail d'une erreur de validation Strapi (format yup). */
export type StrapiFieldError = { path: string[]; message: string };

export type StrapiErrorBody = {
  error?: {
    status: number;
    name: string;
    message: string;
    details?: { errors?: StrapiFieldError[] };
  };
};
