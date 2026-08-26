/**
 * Xendit invoice callbacks don't reliably echo back custom `metadata`, so the
 * checkout intent (which student is buying the All-Access package) is
 * encoded directly in the invoice's externalId instead, and parsed back out
 * of it in the webhook. The student id is a UUID (contains hyphens), so parts
 * are colon-delimited rather than hyphen-delimited.
 */

const ACCESS_PREFIX = 'access:';
const ACCESS_PATTERN = /^access:([^:]+):/;

export function buildAccessExternalId(studentId: string, uuid: string): string {
  return `${ACCESS_PREFIX}${studentId}:${uuid}`;
}

export function isAccessExternalId(externalId: string): boolean {
  return externalId.startsWith(ACCESS_PREFIX);
}

export function parseAccessExternalId(externalId: string): { studentId: string } | undefined {
  const match = ACCESS_PATTERN.exec(externalId);
  return match ? { studentId: match[1] } : undefined;
}
