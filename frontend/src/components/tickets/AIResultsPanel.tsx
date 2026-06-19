import { Brain, Sparkles, Tag, AlertTriangle } from "lucide-react";
import type { AIResultView } from "../../types/ai";
import Badge from "../ui/Badge";
import Card from "../ui/Card";

export default function AIResultsPanel({ result }: { result: AIResultView }) {
  const confidencePct = Math.round(result.confidence * 100);

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-br from-brand-600 via-brand-600 to-violet-600 px-6 py-6 text-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">AI Analysis Results</h2>
            <p className="text-sm text-brand-100">DistilBERT + DistilBART · CPU inference</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ticket</p>
          <h3 className="mt-1 text-xl font-bold text-slate-900">{result.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{result.description}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Tag size={14} />
              Category
            </div>
            <Badge label={result.category} variant="category" />
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <AlertTriangle size={14} />
              Priority
            </div>
            <Badge label={result.priority} variant="priority" />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Brain size={16} />
            Summary
          </div>
          <p className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            {result.summary}
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">Confidence Score</span>
            <span className="text-lg font-bold text-brand-600">{confidencePct}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-500"
              style={{ width: `${confidencePct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Model confidence in category and priority classification
          </p>
        </div>
      </div>
    </Card>
  );
}
