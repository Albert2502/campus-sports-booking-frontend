// The one place where API error codes become Romanian messages.
const MESSAGES = {
  VALIDATION_ERROR: 'Verifică datele introduse.',
  INVALID_CREDENTIALS: 'Email sau parolă greșite.',
  UNAUTHORIZED: 'Sesiunea a expirat. Autentifică-te din nou.',
  FORBIDDEN: 'Nu ai acces la această pagină.',
  ACCOUNT_BLOCKED: 'Contul tău este blocat și nu poate face rezervări.',
  NOT_FOUND: 'Nu am găsit ce ai căutat.',
  SLOT_TAKEN: 'Intervalul a fost ocupat între timp. Alege alt interval.',
  SLOT_IN_PAST: 'Intervalul a început deja. Alege un interval viitor.',
  FACILITY_CLOSED: 'Facilitatea este închisă în acest interval.',
};

/**
 * A message for any error thrown by the API client.
 * @param {*} error
 * @return {string}
 */
export function errorMessage(error) {
  const body = error?.response?.data;
  if (!error?.response) {
    return 'Serverul nu răspunde. Verifică dacă backend-ul rulează.';
  }
  // Some messages carry values from the server (e.g. the monthly limit).
  if (body?.code === 'MONTHLY_LIMIT_REACHED' && body.message) {
    return body.message;
  }
  return MESSAGES[body?.code] ?? body?.message ?? 'A apărut o eroare.';
}

export function errorCode(error) {
  return error?.response?.data?.code ?? null;
}
