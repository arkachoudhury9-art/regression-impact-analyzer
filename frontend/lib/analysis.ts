import { API_URL } from "./changes";

export type ChangedFile = {
  file_path: string;
  file_content: string;
  diff_content: string;
  criticality: string;
};

export type AnalysisResponse = {
  change_summary: string;
  regression_risks: string[];
  changed_files: ChangedFile[];
};

const SELECTION_STORAGE_KEY = "analysis.changeIds";

function validChangeIds(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return [...new Set(value.filter((id): id is number => Number.isInteger(id) && id > 0))];
}

export function storeChangeIds(changeIds: number[]): void {
  sessionStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(validChangeIds(changeIds)));
}

export function readStoredChangeIds(): number[] {
  const raw = sessionStorage.getItem(SELECTION_STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return validChangeIds(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

export async function requestAnalysis(
  changeIds: number[],
  signal?: AbortSignal,
): Promise<AnalysisResponse> {
  const response = await fetch(`${API_URL}/analysis/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ change_ids: changeIds }),
    signal,
  });
  if (!response.ok) {
    throw new Error(`Analysis API returned ${response.status}`);
  }
  return response.json() as Promise<AnalysisResponse>;
}
