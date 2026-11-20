import { FieldIcon } from './icons';

/**
 * The screen 01 layout (Figma): a card over the pitch backdrop, shared by
 * the login and password reset pages.
 * @param {{title: string, subtitle?: React.ReactNode,
 *     children: React.ReactNode}} props
 */
export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="login-backdrop flex min-h-dvh items-center justify-center p-4">
      <main className="w-full max-w-sm rounded-2xl bg-suprafata/95 px-6 py-8 shadow-xl ring-1 ring-bordura backdrop-blur sm:px-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-xl bg-principala text-white shadow">
            <FieldIcon className="size-8" />
          </span>
          <h1 className="mt-5 text-[32px] leading-tight font-bold">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-text-secundar">{subtitle}</p>
          )}
        </div>
        {children}
      </main>
    </div>
  );
}
