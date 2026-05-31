"use client";

import { useCallback, useEffect, useState } from "react";

export interface ProjectSpecMeta {
  id: string;
  createdAt: string;
  filename: string;
}

interface UseProjectSpecsResult {
  specs: ProjectSpecMeta[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useProjectSpecs(
  projectId: string,
  enabled: boolean,
): UseProjectSpecsResult {
  const [specs, setSpecs] = useState<ProjectSpecMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/specs`);

      if (!response.ok) {
        throw new Error("Failed to load specs.");
      }

      const data = (await response.json()) as ProjectSpecMeta[];
      setSpecs(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load specs.";
      setError(message);
      setSpecs([]);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
  }, [enabled, refresh]);

  return { specs, isLoading, error, refresh };
}
