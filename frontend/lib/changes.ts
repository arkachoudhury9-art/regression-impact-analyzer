export type Criticality = "low" | "medium" | "high";

export type Change = {
  id: number;
  change_id: string | null;
  category: string | null;
  criticality: Criticality | null;
  file_name: string | null;
  created_at: string;
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export const CRITICALITY_RANK: Record<Criticality, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const CATEGORY_LABELS: Record<string, string> = {
  business_logic: "Business logic",
  template: "Template",
  ui: "UI",
};

export function formatCategory(category: string | null): string {
  if (!category) {
    return "Uncategorized";
  }
  return (
    CATEGORY_LABELS[category] ??
    category.replace(/_/g, " ").replace(/^\w/, (letter) => letter.toUpperCase())
  );
}

export async function fetchChanges(signal?: AbortSignal): Promise<Change[]> {
  const response = await fetch(`${API_URL}/change/`, { signal });
  if (!response.ok) {
    throw new Error(`Changes API returned ${response.status}`);
  }
  return response.json() as Promise<Change[]>;
}
