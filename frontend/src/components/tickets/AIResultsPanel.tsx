import { Brain, Sparkles } from "lucide-react";
import type { AIResultView } from "../../types/ai";
import Badge from "../ui/Badge";
import Card from "../ui/Card";

export default function AIResultsPanel({ result }: { result: AIResultView }) {
  const confidencePct = Math.round(result.confidence * 100);

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-brand-600 to-violet-600 px-6 py-5 text-white">
        <div className="flex items-center gap-2">
          <Sparkles size={20} />
          <h2 className="text-lg font-semibold">AI Analysis Results</h2>
        </div>
        <p className="mt-1 text-sm text-brand-100">Powered by Hugging Face · CPU inference</p>
      </div>

      <div className="space-y-6 p-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Ticket</p>
          <h3 className="mt-1 text-xl font-bold text-slate-900">{result.title}</h3>
          <p className="mt-2 text-sm text-slate-600">{result.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge label={result.category} />
          <Badge label={result.priority} />
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <Brain size={16} />
            Summary
          </div>
          <p className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            {result.summary}
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Confidence</span>
            <span className="font-bold text-brand-600">{confidencePct}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all"
              style={{ width: `${confidencePct}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
