import { AuditData } from "../types";

export async function runAudit(data: AuditData) {
  const response = await fetch('/api/audit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to run audit');
  }

  const result = await response.json();
  return result.report;
}
