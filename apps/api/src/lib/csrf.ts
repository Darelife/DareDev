/**
 * Double-submit cookie check. Login sets a non-HttpOnly csrf-token cookie;
 * the frontend echoes it back as the x-csrf-token header on every mutating
 * request. A same-site attacker page can trigger the request but can't read
 * the cookie to produce a matching header.
 */
export function csrfTokensMatch(cookieValue: string | undefined, headerValue: string | null): boolean {
  return !!cookieValue && !!headerValue && cookieValue === headerValue;
}
