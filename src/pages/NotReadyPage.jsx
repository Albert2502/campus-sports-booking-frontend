import { ButtonLink, Card } from '../components/ui';

/** Stands in for a screen whose Jira task is not done yet. */
export default function NotReadyPage({ title }) {
  return (
    <Card className="mx-auto max-w-md text-center">
      <h1 className="text-[24px] font-bold">{title}</h1>
      <p className="mt-2 text-sm text-text-secundar">
        Ecranul acesta nu este gata încă.
      </p>
      <ButtonLink to="/" variant="outline" className="mt-5">
        Înapoi acasă
      </ButtonLink>
    </Card>
  );
}
