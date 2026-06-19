import { http } from "./axios";
import type { AnalyzeRequest, AnalyzeResponse } from "../types/ai";

export const aiApi = {
  analyze: (data: AnalyzeRequest) =>
    http.post<AnalyzeResponse>("/ai/analyze", data).then((r) => r.data),
};
