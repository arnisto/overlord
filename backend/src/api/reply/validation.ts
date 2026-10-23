import { validateYupSchema, yup } from '@strapi/utils';

const createReplySchema = yup.object({
  content: yup
    .string()
    .trim()
    .required('La réponse ne peut pas être vide.')
    .max(5000, 'La réponse ne peut pas dépasser 5 000 caractères.'),
  discussion: yup.string().trim().required('La discussion est obligatoire.'),
});

export type CreateReplyInput = { content: string; discussion: string };

export const validateCreateReply = (body: unknown) =>
  validateYupSchema(createReplySchema, { strict: false, stripUnknown: true })(
    body ?? {},
    'Réponse invalide.'
  ) as Promise<CreateReplyInput>;
