'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { authService } from '@/lib/api/auth';
import { Loader2, Anchor } from 'lucide-react';

const loginSchema = z.object({
  nombreUsuario: z.string().min(1, 'El nombre de usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError('');
      await authService.login(data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#081320' }}>

      {/* ── LEFT PANEL — Club Branding ──────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[55%] flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #050E1A 0%, #0A1D38 55%, #06111F 100%)',
          borderRight: '1px solid rgba(201,168,76,0.12)',
        }}
      >
        {/* Ambient glow bottom */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
        {/* Ambient glow top-right */}
        <div
          className="absolute top-0 right-0 w-[350px] h-[350px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(75,140,200,0.06) 0%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />

        {/* Gold accent line top */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.7) 50%, transparent 100%)' }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-16 max-w-lg">
          {/* Logo with concentric gold rings */}
          <div className="mb-10 relative flex items-center justify-center">
            <div
              className="absolute rounded-full"
              style={{ inset: '-18px', border: '1px solid rgba(201,168,76,0.15)' }}
            />
            <div
              className="absolute rounded-full"
              style={{ inset: '-9px', border: '1px solid rgba(201,168,76,0.3)' }}
            />
            <div
              className="w-36 h-36 rounded-full overflow-hidden relative flex-shrink-0"
              style={{
                border: '2px solid rgba(201,168,76,0.65)',
                boxShadow: '0 0 60px rgba(201,168,76,0.12), 0 0 120px rgba(201,168,76,0.05)',
              }}
            >
              <Image
                src="/assets/images/logo-matienzo.png"
                alt="Regatas Corrientes"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Club name */}
          <h1
            className="leading-none mb-1 font-display"
            style={{
              fontSize: '3.75rem',
              fontWeight: 600,
              color: '#E8C874',
              letterSpacing: '0.1em',
            }}
          >
            REGATAS
          </h1>
          <h2
            className="font-display mb-9"
            style={{
              fontSize: '1.4rem',
              fontWeight: 400,
              color: '#C9A84C',
              letterSpacing: '0.3em',
            }}
          >
            CORRIENTES
          </h2>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8 w-56">
            <div
              className="flex-1 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5))' }}
            />
            <Anchor className="w-4 h-4 flex-shrink-0" style={{ color: '#C9A84C' }} />
            <div
              className="flex-1 h-px"
              style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.5), transparent)' }}
            />
          </div>

          <p
            className="text-xs tracking-widest uppercase mb-2"
            style={{ color: '#5A7A9A', letterSpacing: '0.35em' }}
          >
            Sistema de Gestión
          </p>
          <p className="text-sm" style={{ color: '#2E4E6A' }}>
            Club Náutico y Deportivo · Corrientes, Argentina
          </p>
        </div>

        {/* Bottom ornament */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <p className="text-xs" style={{ color: '#1E3A54', letterSpacing: '0.5em' }}>
            ✦ &nbsp; ✦ &nbsp; ✦
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — Login Form ────────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{ background: '#081320' }}
      >
        <div className="w-full max-w-sm">

          {/* Mobile logo (only visible below lg) */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div
              className="w-20 h-20 rounded-full overflow-hidden relative mb-4"
              style={{ border: '2px solid rgba(201,168,76,0.5)' }}
            >
              <Image
                src="/assets/images/logo-matienzo.png"
                alt="Regatas Corrientes"
                fill
                className="object-cover"
                priority
              />
            </div>
            <h1
              className="font-display"
              style={{ fontSize: '1.5rem', color: '#E8C874', letterSpacing: '0.1em' }}
            >
              REGATAS CORRIENTES
            </h1>
          </div>

          {/* Form Card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: '#0D1E35',
              border: '1px solid rgba(201,168,76,0.15)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
            }}
          >
            <div className="mb-8">
              <h3
                className="font-display mb-1"
                style={{ fontSize: '1.85rem', fontWeight: 500, color: '#EDE8DC' }}
              >
                Acceso al Sistema
              </h3>
              <p className="text-sm" style={{ color: '#4A6A8A' }}>
                Ingresá tus credenciales para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
              {error && (
                <div
                  className="rounded-lg px-4 py-3 text-sm"
                  style={{
                    background: 'rgba(248,113,113,0.08)',
                    border: '1px solid rgba(248,113,113,0.25)',
                    color: '#FCA5A5',
                  }}
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="nombreUsuario"
                  className="block text-xs font-medium mb-3 uppercase"
                  style={{ color: '#5A7A9A', letterSpacing: '0.12em' }}
                >
                  Usuario
                </label>
                <input
                  {...register('nombreUsuario')}
                  id="nombreUsuario"
                  type="text"
                  className="nautical-input"
                  placeholder="nombre de usuario"
                  autoComplete="username"
                />
                {errors.nombreUsuario && (
                  <p className="mt-2 text-xs" style={{ color: '#FCA5A5' }}>
                    {errors.nombreUsuario.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium mb-3 uppercase"
                  style={{ color: '#5A7A9A', letterSpacing: '0.12em' }}
                >
                  Contraseña
                </label>
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  className="nautical-input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="mt-2 text-xs" style={{ color: '#FCA5A5' }}>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #B8922A 0%, #E8C874 50%, #C9A84C 100%)',
                    color: '#081320',
                    letterSpacing: '0.08em',
                    boxShadow: '0 4px 24px rgba(201,168,76,0.25)',
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Ingresar'
                  )}
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: '#1E3A54' }}>
            © {new Date().getFullYear()} Regatas Corrientes · Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
