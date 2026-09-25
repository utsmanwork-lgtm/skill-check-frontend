import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const [error, setError] = useState<string>('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleFormSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      await onSubmit(data.email, data.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="card space-y-4">
        <h1 className="text-2xl font-bold text-center mb-6">Skill Check Assessment</h1>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-danger-100 text-danger-700 rounded-lg">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              id="email"
              type="email"
              className="input-field pl-10"
              placeholder="your@email.com"
              {...register('email')}
              disabled={isLoading}
            />
          </div>
          {errors.email && <p className="text-danger-600 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              id="password"
              type="password"
              className="input-field pl-10"
              placeholder="••••••"
              {...register('password')}
              disabled={isLoading}
            />
          </div>
          {errors.password && <p className="text-danger-600 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-sm text-gray-600 text-center">
          Demo credentials: guru@example.com / admin@example.com / student@example.com
        </p>
      </form>
    </div>
  );
}
