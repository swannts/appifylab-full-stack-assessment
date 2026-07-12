import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

export const registerSchema = z.object({
  first_name: z.string().trim().min(1, { message: 'First name is required.' }),
  last_name: z.string().trim().min(1, { message: 'Last name is required.' }),
  email: z.string().trim().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

export const postSchema = z.object({
  content: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
  visibility: z.boolean(),
}).refine(data => data.content || data.imageUrl, {
  message: 'Post must contain either text content or an image.',
  path: ['content'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PostInput = z.infer<typeof postSchema>;
