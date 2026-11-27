import { ButtonLink, Card } from '../components/ui';

export default function ForbiddenPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <Card className="text-center">
        <h1 className="text-[24px] font-bold">Acces interzis</h1>
        <p className="mt-2 text-sm text-text-secundar">
          Doar administratorul are acces la această pagină.
        </p>
        <ButtonLink to="/" variant="outline" className="mt-5">
          Înapoi acasă
        </ButtonLink>
      </Card>
    </main>
  );
}
