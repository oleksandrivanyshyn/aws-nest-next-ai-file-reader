import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email("That doesn't look like an email address."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
