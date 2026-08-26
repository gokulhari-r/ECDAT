export type MigrationStatus = "Planned" | "In Progress" | "Complete";

export type MigrationItem = {
  findingKey: string;
  assetName: string;
  algorithm: string;
  candidate: string;
  priority: string;
  complexity: string;
  status: MigrationStatus;
  addedAt: number;
};

export type MigrationDraft = Omit<MigrationItem, "status" | "addedAt">;
export const migrationStorageKey = "ecdat-migration-plan-v1";

export function nextMigrationStatus(status: MigrationStatus): MigrationStatus {
  return status === "Planned" ? "In Progress" : status === "In Progress" ? "Complete" : "Planned";
}

export function addPlanItem(items: MigrationItem[], item: MigrationDraft, addedAt = Date.now()) {
  if (items.some(existing => existing.findingKey === item.findingKey)) return items;
  return [...items, { ...item, status: "Planned" as const, addedAt }];
}

export function removePlanItem(items: MigrationItem[], findingKey: string) {
  return items.filter(item => item.findingKey !== findingKey);
}

export function updatePlanItemStatus(items: MigrationItem[], findingKey: string, status?: MigrationStatus) {
  return items.map(item => item.findingKey === findingKey ? { ...item, status: status ?? nextMigrationStatus(item.status) } : item);
}

export function migrationProgress(items: MigrationItem[], availableCount: number) {
  const counts = items.reduce((summary, item) => ({ ...summary, [item.status]: summary[item.status] + 1 }), { Planned: 0, "In Progress": 0, Complete: 0 } as Record<MigrationStatus, number>);
  return { total: availableCount, plannedItems: items.length, ...counts, completePercent: availableCount ? Math.round((counts.Complete / availableCount) * 100) : 0 };
}

function storage() {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}

function parsePlan(raw: string | null): MigrationItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is MigrationItem => Boolean(item && typeof item.findingKey === "string" && typeof item.assetName === "string" && typeof item.algorithm === "string" && typeof item.candidate === "string" && typeof item.priority === "string" && typeof item.complexity === "string" && ["Planned", "In Progress", "Complete"].includes(item.status) && typeof item.addedAt === "number"));
  } catch {
    return [];
  }
}

function persist(items: MigrationItem[]) {
  const target = storage();
  if (!target) return { items, warning: "Migration-plan storage is unavailable in this environment." };
  try {
    target.setItem(migrationStorageKey, JSON.stringify(items));
    return { items, warning: null as string | null };
  } catch {
    return { items, warning: "Your browser could not save this migration-plan change locally." };
  }
}

export function getPlan() {
  const target = storage();
  if (!target) return { items: [] as MigrationItem[], warning: "Migration-plan storage is unavailable in this environment." };
  try {
    return { items: parsePlan(target.getItem(migrationStorageKey)), warning: null as string | null };
  } catch {
    return { items: [] as MigrationItem[], warning: "Your browser could not read the local migration plan." };
  }
}

export function addItem(item: MigrationDraft) {
  const current = getPlan();
  return persist(addPlanItem(current.items, item));
}

export function removeItem(findingKey: string) {
  const current = getPlan();
  return persist(removePlanItem(current.items, findingKey));
}

export function updateStatus(findingKey: string, status?: MigrationStatus) {
  const current = getPlan();
  return persist(updatePlanItemStatus(current.items, findingKey, status));
}

export function clearPlan() {
  return persist([]);
}
