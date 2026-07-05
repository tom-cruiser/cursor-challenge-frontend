import type { AccountRecord, AlertLog, FamilyRecord, MergeCandidateGroup } from "@/types/admin";

export function filterAlertLogs(logs: AlertLog[], query: string): AlertLog[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return logs;
  }

  const digitsOnly = normalized.replace(/\D/g, "");

  return logs.filter((log) => {
    const phoneDigits = log.phoneNumber.replace(/\D/g, "");
    return (
      log.childName.toLowerCase().includes(normalized) ||
      log.region.toLowerCase().includes(normalized) ||
      log.doseLabel.toLowerCase().includes(normalized) ||
      log.message.toLowerCase().includes(normalized) ||
      (digitsOnly.length > 0 && phoneDigits.includes(digitsOnly))
    );
  });
}

export function filterAccountRecords(
  records: AccountRecord[],
  query: string,
): AccountRecord[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return records;
  }

  const digitsOnly = normalized.replace(/\D/g, "");

  return records.filter((record) => {
    const phoneDigits = record.phoneNumber.replace(/\D/g, "");
    return (
      record.parentName.toLowerCase().includes(normalized) ||
      record.region.toLowerCase().includes(normalized) ||
      (digitsOnly.length > 0 && phoneDigits.includes(digitsOnly)) ||
      record.phoneNumber.toLowerCase().includes(normalized)
    );
  });
}

export function filterFamilyRecords(families: FamilyRecord[], query: string): FamilyRecord[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return families;
  }

  const digitsOnly = normalized.replace(/\D/g, "");

  return families.filter((family) => {
    const phoneDigits = family.phoneNumber.replace(/\D/g, "");
    const childMatch = family.children.some((child) =>
      child.name.toLowerCase().includes(normalized),
    );

    return (
      family.parentName.toLowerCase().includes(normalized) ||
      family.region.toLowerCase().includes(normalized) ||
      childMatch ||
      (digitsOnly.length > 0 && phoneDigits.includes(digitsOnly)) ||
      family.phoneNumber.toLowerCase().includes(normalized)
    );
  });
}

export function getDuplicateGroups(records: AccountRecord[]): MergeCandidateGroup[] {
  const groups = new Map<string, AccountRecord[]>();

  for (const record of records) {
    if (!record.duplicateGroupId) {
      continue;
    }

    const existing = groups.get(record.duplicateGroupId) ?? [];
    existing.push(record);
    groups.set(record.duplicateGroupId, existing);
  }

  return Array.from(groups.entries())
    .filter(([, groupRecords]) => groupRecords.length > 1)
    .map(([duplicateGroupId, groupRecords]) => ({
      duplicateGroupId,
      phoneNumber: groupRecords[0]!.phoneNumber,
      records: groupRecords,
    }));
}

export function mergeDuplicateGroup(
  records: AccountRecord[],
  duplicateGroupId: string,
  keepAccountId: string,
): AccountRecord[] {
  const groupRecords = records.filter(
    (record) => record.duplicateGroupId === duplicateGroupId,
  );

  if (groupRecords.length <= 1) {
    return records;
  }

  const keptRecord = groupRecords.find((record) => record.id === keepAccountId);
  if (!keptRecord) {
    return records;
  }

  const mergedChildCount = groupRecords.reduce(
    (total, record) => total + record.childCount,
    0,
  );

  const removedIds = new Set(
    groupRecords.filter((record) => record.id !== keepAccountId).map((record) => record.id),
  );

  return records
    .filter((record) => !removedIds.has(record.id))
    .map((record) =>
      record.id === keepAccountId
        ? {
            ...record,
            childCount: mergedChildCount,
            duplicateGroupId: null,
          }
        : record,
    );
}

export function formatAlertTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
