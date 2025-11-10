import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../services/api-client";

const formatKey = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^\w/, (char) => char.toUpperCase());

const toDisplayValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return JSON.stringify(value, null, 2);
};

const extractItems = (payload: unknown): { items: unknown[]; meta?: unknown } => {
  if (!payload) {
    return { items: [] };
  }
  if (Array.isArray(payload)) {
    return { items: payload };
  }
  if (
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    const { data, meta } = payload as { data: unknown[]; meta?: unknown };
    return { items: data, meta };
  }
  if (
    typeof payload === "object" &&
    "success" in payload &&
    typeof (payload as { success: unknown }).success === "boolean"
  ) {
    const { data, meta } = payload as { data: unknown; meta?: unknown };
    if (Array.isArray(data)) {
      return { items: data, meta };
    }
    if (data) {
      return { items: [data], meta };
    }
    return { items: [], meta };
  }
  return { items: [payload] };
};

interface ApiDataGridProps {
  endpoint: string;
  queryKey: readonly unknown[];
  title: string;
  description?: string;
}

export const ApiDataGrid = ({ endpoint, queryKey, title, description }: ApiDataGridProps) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await apiClient.get(endpoint);
      const payload = response.data;
      return extractItems(payload);
    },
  });

  const meta = data?.meta;

  const grid = useMemo(() => {
    const source = data?.items ?? [];
    return source.map((item) => {
      if (!item || typeof item !== "object") {
        return { __value: toDisplayValue(item) };
      }
      const record = item as Record<string, unknown>;
      return record;
    });
  }, [data]);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">{title}</h1>
            {description ? <p className="text-sm text-white/70">{description}</p> : null}
          </div>
          {meta ? (
            <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70">
              {typeof meta === "object" && meta
                ? Object.entries(meta as Record<string, unknown>)
                    .filter(([key]) =>
                      ["total", "current_page", "per_page", "last_page"].includes(key)
                    )
                    .map(([key, value]) => `${formatKey(key)}: ${value ?? "—"}`)
                    .join(" · ")
                : null}
            </div>
          ) : null}
        </div>
      </header>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#173468] border-t-transparent" />
        </div>
      ) : isError ? (
        <div className="space-y-3 rounded-3xl border border-destructive/40 bg-gradient-to-r from-rose-500/20 via-rose-500/10 to-amber-400/20 p-6 text-destructive-foreground backdrop-blur">
          <p>Unable to load data right now.</p>
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-destructive/50 bg-destructive/30 px-4 py-2 text-sm font-semibold text-destructive-foreground transition hover:bg-destructive/40"
          >
            Retry
          </button>
        </div>
      ) : !grid.length ? (
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#173468]/20 via-white/10 to-[#C7A46A]/20 p-8 text-center text-sm text-white/70 shadow backdrop-blur">
          No records found.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {grid.map((record, index) => (
            <article
              key={index}
              className="space-y-3 rounded-3xl border border-white/10 bg-gradient-to-br from-[#173468]/25 via-white/10 to-[#C7A46A]/20 p-5 shadow transition hover:border-white/20 hover:bg-white/12 backdrop-blur"
            >
              <dl className="space-y-2 text-sm text-white/80">
                {Object.entries(record).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <dt className="text-xs uppercase tracking-widest text-white/45">
                      {formatKey(key)}
                    </dt>
                    <dd className="whitespace-pre-wrap text-white/90">
                      {toDisplayValue(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

