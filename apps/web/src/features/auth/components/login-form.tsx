'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { useSession } from '@/hooks/use-session';
import { loginSchema, type LoginFormValues } from '../validation/auth.schema';

export function LoginForm() {
  const { setEmail } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '' },
  });

  function onSubmit(values: LoginFormValues) {
    setEmail(values.email);
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6 md:bg-muted/30">
      <div className="w-full max-w-[280px] space-y-6 md:rounded-xl md:border md:border-border md:bg-card md:p-8 md:shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">
            Doc<span className="text-primary">chat</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Ask questions about any PDF.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email" className="sr-only">
                Email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoFocus
                {...register('email')}
              />
              <FieldError errors={errors.email ? [errors.email] : undefined} />
            </Field>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              Continue
            </Button>
          </FieldGroup>
        </form>

        <p className="text-xs text-muted-foreground">
          No password. Your email just keeps your document with you.
        </p>
      </div>
    </div>
  );
}
