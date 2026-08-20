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
      <div className="w-full max-w-[280px] space-y-6 md:max-w-[340px] md:space-y-7 md:rounded-xl md:border md:border-border md:bg-card md:p-8 md:shadow-sm">
        <div className="space-y-1 md:space-y-2">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Doc<span className="text-primary">chat</span>
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Ask questions about any PDF.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="md:gap-5">
            <Field>
              <FieldLabel htmlFor="email" className="sr-only">
                Email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoFocus
                className="md:h-11 md:px-4 md:text-base"
                {...register('email')}
              />
              <FieldError
                errors={errors.email ? [errors.email] : undefined}
                className="md:text-sm"
              />
            </Field>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:h-11 md:text-base"
            >
              Continue
            </Button>
          </FieldGroup>
        </form>

        <p className="text-xs text-muted-foreground md:text-sm">
          No password. Your email just keeps your document with you.
        </p>
      </div>
    </div>
  );
}
