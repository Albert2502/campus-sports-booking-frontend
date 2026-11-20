/**
 * Up to two initials for the avatar, e.g. "Ana Popescu" -> "AP".
 * @param {string} fullName
 * @return {string}
 */
export function initials(fullName) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
