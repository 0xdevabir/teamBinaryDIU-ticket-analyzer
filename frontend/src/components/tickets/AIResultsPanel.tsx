import { Tag, AlertTriangle, Clock, FileText } from "lucide-react";
import type { AIResultView } from "../../types/ai";
import Badge from "../ui/Badge";
import Card from "../ui/Card";

const SOURCE_LABELS: Record<string, string> = {
  local: "Local inference",
  api: "Hugging Face API",
  fallback: "Rule-based",
  demo: "Demo data",
};

export default function AIResultsPanel({ result }: { result: AIResultView }) {
  const confidencePct = Math.round(result.confidence * 100);

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
              Analysis
            </h2>
            <p className="mt-0.5 text-sm text-neutral-500">
              {SOURCE_LABELS[result.inference_source ?? "fallback"] ?? "Classification"}
            </p>
          </div>
          {result.processing_ms != null && (
            <div className="flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
              <Clock size={12} />
              {result.processing_ms}ms
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Ticket</p>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {result.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {result.description}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <Tag size={14} />
              Category
            </div>
            <Badge label={result.category} variant="category" />
          </div>
          <div className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <AlertTriangle size={14} />
              Priority
            </div>
            <Badge label={result.priority} variant="priority" />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            <FileText size={14} />
            Summary
          </div>
          <p className="rounded-md border border-neutral-200 bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
            {result.summary}
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">Confidence</span>
            <span className="text-lg font-bold text-neutral-900 dark:text-white">{confidencePct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-sm bg-neutral-100 dark:bg-neutral-800">
            <div
              className="h-full rounded-sm bg-neutral-900 transition-all duration-500 dark:bg-white"
              style={{ width: `${confidencePct}%` }}
            />
          </div>
          {result.confidence_breakdown && Object.keys(result.confidence_breakdown).length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {Object.entries(result.confidence_breakdown).map(([key, val]) => (
                <div
                  key={key}
                  className="rounded-md border border-neutral-200 px-2 py-1.5 text-center dark:border-neutral-800"
                >
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400">{key}</p>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {Math.round(val * 100)}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
