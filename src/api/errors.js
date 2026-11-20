// The one place where API error codes become Romanian messages (DESIGN §6).
const MESSAGES = {
  VALIDATION_ERROR: 'Verifică datele introduse.',
  INVALID_CREDENTIALS: 'Email sau parolă greșite.',
  UNAUTHORIZED: 'Sesiunea a expirat. Autentifică-te din nou.',
  FORBIDDEN: 'Nu ai acces la această pagină.',
  NOT_FOUND: 'Nu am găsit ce ai căutat.',
  INTERNAL_ERROR: 'A apărut o eroare pe server. Încearcă din nou.',
};

/**
 * The stable `code` of an API error, or null for network errors.
 * @param {*} error thrown by the axios client
 * @return {?string}
 */
export function errorCode(error) {
  return error?.response?.data?.code ?? null;
}

/**
 * A message for any error thrown by the API client.
 * @param {*} error thrown by the axios client
 * @return {string}
 */
export function errorMessage(error) {
  if (!error?.response) {
    return 'Serverul nu răspunde. Verifică dacă backend-ul rulează.';
  }
  const body = error.response.data;
  return MESSAGES[body?.code] ?? body?.message ?? 'A apărut o eroare.';
}

/**
 * Per-field messages of a 400 VALIDATION_ERROR (`details.fields`).
 * @param {*} error thrown by the axios client
 * @return {!Object<string, string>}
 */
export function fieldErrors(error) {
  if (errorCode(error) !== 'VALIDATION_ERROR') {
    return {};
  }
  return error.response.data.details?.fields ?? {};
}
