import { FieldIcon } from '../components/icons';

/** Screen 01 Autentificare (Figma): a card over the pitch backdrop. */
export default function LoginPage() {
  return (
    <div className="login-backdrop flex min-h-dvh items-center justify-center p-4">
      <main className="w-full max-w-sm rounded-2xl bg-suprafata/95 px-6 py-8 shadow-xl ring-1 ring-bordura backdrop-blur sm:px-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-xl bg-principala text-white shadow">
            <FieldIcon className="size-8" />
          </span>
          <h1 className="mt-5 text-[32px] leading-tight font-bold">
            Autentificare
          </h1>
          <p className="mt-2 text-sm text-text-secundar">
            Rezervare facilități sportive
            <br />
            Acces cu un cont instituțional.
          </p>
        </div>
      </main>
    </div>
  );
}
