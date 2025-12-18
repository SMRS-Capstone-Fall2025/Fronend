import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getErrorMessage } from "@/lib/utils";
import { usePlagiarismResultByScanIdQuery } from "@/services/plagiarism/hooks";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Database,
  ExternalLink,
  FileText,
  Globe,
  TrendingUp,
  Clock,
  Languages,
  User,
  FileCheck,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export interface PlagiarismResultData {
  scannedDocument: {
    scanId: string;
    totalWords: number;
    totalExcluded: number;
    credits: number;
    expectedCredits: number;
    creationTime: string;
    metadata?: {
      creationDate?: string;
      lastModificationDate?: string;
      author?: string;
      filename?: string;
    };
    detectedLanguage?: string;
  };
  results: {
    score: {
      identicalWords: number;
      minorChangedWords: number;
      relatedMeaningWords: number;
      aggregatedScore: number;
    };
    internet: Array<{
      url: string;
      id: string;
      title: string;
      introduction: string;
      matchedWords: number;
      identicalWords: number;
      similarWords: number;
      paraphrasedWords: number;
      totalWords: number;
    }>;
    database: Array<unknown>;
    batch: Array<unknown>;
    repositories: Array<unknown>;
  };
  writingFeedback?: {
    textStatistics: {
      sentenceCount: number;
      averageWordLength: number;
      averageSentenceLength: number;
      readingTimeSeconds: number;
      speakingTimeSeconds: number;
    };
    score: {
      grammarCorrectionsCount: number;
      grammarCorrectionsScore: number;
      mechanicsCorrectionsCount: number;
      mechanicsCorrectionsScore: number;
      sentenceStructureCorrectionsCount: number;
      sentenceStructureCorrectionsScore: number;
      wordChoiceCorrectionsCount: number;
      wordChoiceCorrectionsScore: number;
      overallScore: number;
    };
    readability: {
      score: number;
      readabilityLevel: number;
      readabilityLevelText: string;
      readabilityLevelDescription: string;
    };
  };
  status: number;
}

interface ApiPlagiarismResultResponse {
  id: number;
  scanId: string;
  status: string;
  payload: string; // JSON string
  receivedAt: string;
}

interface ParsedPayload {
  status: number;
  results?: {
    batch?: unknown[];
    score?: {
      identicalWords?: number;
      aggregatedScore?: number;
      minorChangedWords?: number;
      relatedMeaningWords?: number;
    };
    database?: unknown[];
    internet?: Array<{
      id?: string;
      url?: string;
      tags?: unknown[];
      title?: string;
      metadata?: {
        authors?: unknown[];
      };
      totalWords?: number;
      introduction?: string;
      matchedWords?: number;
      similarWords?: number;
      identicalWords?: number;
      paraphrasedWords?: number;
    }>;
    repositories?: unknown[];
  };
  scannedDocument?: {
    scanId?: string;
    credits?: number;
    enabled?: Record<string, boolean>;
    metadata?: {
      author?: string;
      filename?: string;
      creationDate?: string;
      lastModificationDate?: string;
    };
    totalWords?: number;
    creationTime?: string;
    totalExcluded?: number;
    expectedCredits?: number;
    detectedLanguage?: string;
  };
  writingFeedback?: {
    score?: {
      overallScore?: number;
      grammarScoreWeight?: number;
      mechanicsScoreWeight?: number;
      wordChoiceScoreWeight?: number;
      grammarCorrectionsCount?: number;
      grammarCorrectionsScore?: number;
      mechanicsCorrectionsCount?: number;
      mechanicsCorrectionsScore?: number;
      wordChoiceCorrectionsCount?: number;
      wordChoiceCorrectionsScore?: number;
      sentenceStructureScoreWeight?: number;
      sentenceStructureCorrectionsCount?: number;
      sentenceStructureCorrectionsScore?: number;
    };
    readability?: {
      score?: number;
      readabilityLevel?: number;
      readabilityLevelText?: string;
      readabilityLevelDescription?: string;
    };
    textStatistics?: {
      sentenceCount?: number;
      averageWordLength?: number;
      readingTimeSeconds?: number;
      speakingTimeSeconds?: number;
      averageSentenceLength?: number;
    };
  };
  notifications?: {
    alerts?: unknown[];
  };
  developerPayload?: string;
}

function mapResponseToPlagiarismResultData(
  response: ApiPlagiarismResultResponse | unknown
): PlagiarismResultData | null {
  try {
    // Type guard
    if (
      !response ||
      typeof response !== "object" ||
      !("payload" in response) ||
      typeof (response as ApiPlagiarismResultResponse).payload !== "string"
    ) {
      return null;
    }

    const apiResponse = response as ApiPlagiarismResultResponse;

    // Parse payload JSON string
    let parsedPayload: ParsedPayload;
    try {
      parsedPayload = JSON.parse(apiResponse.payload) as ParsedPayload;
    } catch (error) {
      console.error("Failed to parse payload JSON:", error);
      return null;
    }

    const { scannedDocument, results, writingFeedback, status } = parsedPayload;

    if (!scannedDocument || !results || !results.score) {
      return null;
    }

    // Map to PlagiarismResultData format
    const mappedData: PlagiarismResultData = {
      status: status ?? 0,
      scannedDocument: {
        scanId: scannedDocument.scanId ?? "",
        totalWords: scannedDocument.totalWords ?? 0,
        totalExcluded: scannedDocument.totalExcluded ?? 0,
        credits: scannedDocument.credits ?? 0,
        expectedCredits: scannedDocument.expectedCredits ?? 0,
        creationTime: scannedDocument.creationTime ?? "",
        metadata: scannedDocument.metadata
          ? {
              creationDate: scannedDocument.metadata.creationDate,
              lastModificationDate:
                scannedDocument.metadata.lastModificationDate,
              author: scannedDocument.metadata.author,
              filename: scannedDocument.metadata.filename,
            }
          : undefined,
        detectedLanguage: scannedDocument.detectedLanguage,
      },
      results: {
        score: {
          identicalWords: results.score.identicalWords ?? 0,
          minorChangedWords: results.score.minorChangedWords ?? 0,
          relatedMeaningWords: results.score.relatedMeaningWords ?? 0,
          aggregatedScore: results.score.aggregatedScore ?? 0,
        },
        internet: (results.internet ?? []).map((item) => ({
          id: item.id ?? "",
          url: item.url ?? "",
          title: item.title ?? "",
          introduction: item.introduction ?? "",
          matchedWords: item.matchedWords ?? 0,
          identicalWords: item.identicalWords ?? 0,
          similarWords: item.similarWords ?? 0,
          paraphrasedWords: item.paraphrasedWords ?? 0,
          totalWords: item.totalWords ?? 0,
        })),
        database: results.database ?? [],
        batch: results.batch ?? [],
        repositories: results.repositories ?? [],
      },
      writingFeedback: writingFeedback
        ? {
            textStatistics: {
              sentenceCount: writingFeedback.textStatistics?.sentenceCount ?? 0,
              averageWordLength:
                writingFeedback.textStatistics?.averageWordLength ?? 0,
              averageSentenceLength:
                writingFeedback.textStatistics?.averageSentenceLength ?? 0,
              readingTimeSeconds:
                writingFeedback.textStatistics?.readingTimeSeconds ?? 0,
              speakingTimeSeconds:
                writingFeedback.textStatistics?.speakingTimeSeconds ?? 0,
            },
            score: {
              grammarCorrectionsCount:
                writingFeedback.score?.grammarCorrectionsCount ?? 0,
              grammarCorrectionsScore:
                writingFeedback.score?.grammarCorrectionsScore ?? 0,
              mechanicsCorrectionsCount:
                writingFeedback.score?.mechanicsCorrectionsCount ?? 0,
              mechanicsCorrectionsScore:
                writingFeedback.score?.mechanicsCorrectionsScore ?? 0,
              sentenceStructureCorrectionsCount:
                writingFeedback.score?.sentenceStructureCorrectionsCount ?? 0,
              sentenceStructureCorrectionsScore:
                writingFeedback.score?.sentenceStructureCorrectionsScore ?? 0,
              wordChoiceCorrectionsCount:
                writingFeedback.score?.wordChoiceCorrectionsCount ?? 0,
              wordChoiceCorrectionsScore:
                writingFeedback.score?.wordChoiceCorrectionsScore ?? 0,
              overallScore: writingFeedback.score?.overallScore ?? 0,
            },
            readability: {
              score: writingFeedback.readability?.score ?? 0,
              readabilityLevel:
                writingFeedback.readability?.readabilityLevel ?? 0,
              readabilityLevelText:
                writingFeedback.readability?.readabilityLevelText ?? "",
              readabilityLevelDescription:
                writingFeedback.readability?.readabilityLevelDescription ?? "",
            },
          }
        : undefined,
    };

    return mappedData;
  } catch (error) {
    console.error("Failed to map response to PlagiarismResultData:", error);
    return null;
  }
}

interface PlagiarismResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scanId: number | null;
}

export function PlagiarismResultDialog({
  open,
  onOpenChange,
  scanId,
}: PlagiarismResultDialogProps) {
  const { toast } = useToast();

  const {
    data: plagiarismResultData,
    isLoading: isLoadingPlagiarismResult,
    error: plagiarismResultError,
  } = usePlagiarismResultByScanIdQuery(scanId, {
    enabled: open && scanId != null,
  });

  // Hiển thị error khi cần
  useEffect(() => {
    if (plagiarismResultError && open) {
      toast({
        variant: "destructive",
        title: "Lỗi tải kết quả đạo văn",
        description: getErrorMessage(
          plagiarismResultError,
          "Không thể tải kết quả đạo văn. Vui lòng thử lại sau."
        ),
      });
    }
  }, [plagiarismResultError, open, toast]);

  // Map API response to PlagiarismResultData format
  const data = plagiarismResultData
    ? mapResponseToPlagiarismResultData(plagiarismResultData)
    : null;

  // Check if results and score exist before processing
  const hasValidData = data?.results?.score != null;
  const { scannedDocument, results, writingFeedback } =
    hasValidData && data
      ? data
      : { scannedDocument: null, results: null, writingFeedback: null };
  const aggregatedScore =
    hasValidData && results ? (results.score.aggregatedScore ?? 0) * 100 : 0;

  // Chart data for similarity breakdown (must be before early returns)
  const similarityChartData = useMemo(() => {
    if (!results?.score) return [];
    const total =
      (results.score.identicalWords ?? 0) +
      (results.score.minorChangedWords ?? 0) +
      (results.score.relatedMeaningWords ?? 0);

    if (total === 0) return [];

    return [
      {
        name: "Giống hệt",
        value: results.score.identicalWords ?? 0,
        fill: "#ef4444",
        percentage:
          total > 0 ? ((results.score.identicalWords ?? 0) / total) * 100 : 0,
      },
      {
        name: "Thay đổi nhỏ",
        value: results.score.minorChangedWords ?? 0,
        fill: "#f59e0b",
        percentage:
          total > 0
            ? ((results.score.minorChangedWords ?? 0) / total) * 100
            : 0,
      },
      {
        name: "Ý nghĩa tương tự",
        value: results.score.relatedMeaningWords ?? 0,
        fill: "#eab308",
        percentage:
          total > 0
            ? ((results.score.relatedMeaningWords ?? 0) / total) * 100
            : 0,
      },
    ].filter((item) => item.value > 0);
  }, [results?.score]);

  // Chart data for internet sources similarity
  const internetSourcesChartData = useMemo(() => {
    if (!results?.internet) return [];
    return results.internet
      .map((source) => {
        const similarity = (source.identicalWords / source.totalWords) * 100;
        return {
          name: source.title || source.url,
          similarity: Math.round(similarity * 10) / 10,
          matchedWords: source.matchedWords,
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10); // Top 10 sources
  }, [results?.internet]);

  // Chart data for writing feedback scores
  const writingFeedbackChartData = useMemo(() => {
    if (!writingFeedback) return [];

    return [
      {
        category: "Ngữ pháp",
        score: writingFeedback.score.grammarCorrectionsScore,
        fill: "#2563eb", // blue-600
      },
      {
        category: "Cơ học",
        score: writingFeedback.score.mechanicsCorrectionsScore,
        fill: "#9333ea", // purple-600
      },
      {
        category: "Cấu trúc câu",
        score: writingFeedback.score.sentenceStructureCorrectionsScore,
        fill: "#16a34a", // green-600
      },
      {
        category: "Lựa chọn từ",
        score: writingFeedback.score.wordChoiceCorrectionsScore,
        fill: "#ea580c", // orange-600
      },
    ];
  }, [writingFeedback]);

  // Hiển thị loading state
  if (isLoadingPlagiarismResult) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg animate-pulse">
                <FileText className="h-5 w-5" />
              </div>
              <span>Đang tải kết quả...</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
            <p className="text-muted-foreground font-medium">
              Đang xử lý và phân tích tài liệu...
            </p>
            <p className="text-sm text-muted-foreground">
              Vui lòng đợi trong giây lát
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!data || !hasValidData || !scannedDocument || !results) {
    if (!data) return null;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Lỗi dữ liệu
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground">
            <p>Không thể tải kết quả kiểm tra đạo văn.</p>
            <p className="text-sm mt-2">
              Dữ liệu không hợp lệ hoặc chưa sẵn sàng.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "destructive";
    if (score >= 50) return "default";
    if (score >= 30) return "secondary";
    return "outline";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Rất cao";
    if (score >= 50) return "Cao";
    if (score >= 30) return "Trung bình";
    return "Thấp";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-red-500 to-red-600";
    if (score >= 50) return "from-orange-500 to-orange-600";
    if (score >= 30) return "from-yellow-500 to-yellow-600";
    return "from-green-500 to-green-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-red-500/10 border-red-500/20";
    if (score >= 50) return "bg-orange-500/10 border-orange-500/20";
    if (score >= 30) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-green-500/10 border-green-500/20";
  };

  const similarityChartConfig = {
    identical: {
      label: "Giống hệt",
      color: "#ef4444",
    },
    minor: {
      label: "Thay đổi nhỏ",
      color: "#f59e0b",
    },
    related: {
      label: "Ý nghĩa tương tự",
      color: "#eab308",
    },
  };

  const sourcesChartConfig = {
    similarity: {
      label: "Độ tương đồng (%)",
      color: "hsl(var(--chart-1))",
    },
  };

  const writingChartConfig = {
    score: {
      label: "Điểm",
      color: "hsl(var(--chart-2))",
    },
    grammar: {
      label: "Ngữ pháp",
      color: "#2563eb",
    },
    mechanics: {
      label: "Cơ học",
      color: "#9333ea",
    },
    sentenceStructure: {
      label: "Cấu trúc câu",
      color: "#16a34a",
    },
    wordChoice: {
      label: "Lựa chọn từ",
      color: "#ea580c",
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <FileText className="h-5 w-5" />
              </div>
              <span>Kết quả kiểm tra đạo văn</span>
            </DialogTitle>
          </DialogHeader>
        </div>

        <Tabs
          defaultValue="overview"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-background"
              >
                Tổng quan
              </TabsTrigger>
              <TabsTrigger
                value="sources"
                className="data-[state=active]:bg-background"
              >
                Nguồn tương đồng
              </TabsTrigger>
              <TabsTrigger
                value="writing"
                className="data-[state=active]:bg-background"
              >
                Đánh giá viết
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6 py-4">
            <TabsContent value="overview" className="space-y-6 mt-0">
              {/* Document Info Card */}
              <Card className="shadow-sm border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
                      <FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    Thông tin tài liệu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        <FileText className="h-3 w-3" />
                        Tên file
                      </div>
                      <div className="font-semibold text-sm break-words">
                        {scannedDocument.metadata?.filename || "Không rõ"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        <User className="h-3 w-3" />
                        Tác giả
                      </div>
                      <div className="font-semibold text-sm">
                        {scannedDocument.metadata?.author || "—"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        <BarChart3 className="h-3 w-3" />
                        Tổng số từ
                      </div>
                      <div className="font-semibold text-sm">
                        {scannedDocument.totalWords.toLocaleString()} từ
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Từ đã loại trừ
                      </div>
                      <div className="font-semibold text-sm">
                        {scannedDocument.totalExcluded} từ
                      </div>
                    </div>
                    {scannedDocument.metadata?.creationDate && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          <Clock className="h-3 w-3" />
                          Ngày tạo
                        </div>
                        <div className="font-semibold text-sm">
                          {format(
                            new Date(scannedDocument.metadata.creationDate),
                            "dd/MM/yyyy",
                            { locale: vi }
                          )}
                        </div>
                      </div>
                    )}
                    {scannedDocument.detectedLanguage && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          <Languages className="h-3 w-3" />
                          Ngôn ngữ
                        </div>
                        <Badge variant="outline" className="font-semibold">
                          {scannedDocument.detectedLanguage.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Similarity Score Card */}
              <Card
                className={cn(
                  "shadow-lg border-2",
                  getScoreBgColor(aggregatedScore)
                )}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br",
                          getScoreGradient(aggregatedScore)
                        )}
                      >
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      Độ tương đồng tổng thể
                    </CardTitle>
                    <Badge
                      variant={getScoreColor(aggregatedScore)}
                      className="text-base px-4 py-1.5 font-bold"
                    >
                      {aggregatedScore.toFixed(1)}% -{" "}
                      {getScoreLabel(aggregatedScore)}
                    </Badge>
                  </div>
                  <CardDescription className="pt-2">
                    Tỷ lệ nội dung trùng lặp được phát hiện
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Chi tiết breakdown - chỉ hiển thị chart nếu có nhiều loại và dữ liệu đáng kể */}
                  {similarityChartData.length > 1 && (
                    <div className="mb-6">
                      <ChartContainer
                        config={similarityChartConfig}
                        className="h-[200px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <ChartTooltip
                              content={({ active, payload }) => {
                                if (!active || !payload?.[0]) return null;
                                const data = payload[0].payload;
                                return (
                                  <div className="rounded-lg border bg-background p-3 shadow-sm">
                                    <div className="grid gap-2">
                                      <div className="font-medium text-sm">
                                        {data.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {data.value} từ (
                                        {data.percentage.toFixed(1)}%)
                                      </div>
                                    </div>
                                  </div>
                                );
                              }}
                            />
                            <Pie
                              data={similarityChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ percentage }) =>
                                percentage > 10
                                  ? `${percentage.toFixed(0)}%`
                                  : ""
                              }
                              outerRadius={70}
                              innerRadius={35}
                              dataKey="value"
                              animationBegin={0}
                              animationDuration={600}
                            >
                              {similarityChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  )}

                  {/* Thông số chi tiết - hiển thị rõ ràng */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg border bg-background/50">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: "#ef4444" }}
                        />
                        <div className="text-xs font-medium text-muted-foreground uppercase">
                          Giống hệt
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                        {results.score.identicalWords ?? 0}
                      </div>
                      <div className="text-xs text-muted-foreground">từ</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border bg-background/50">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: "#f59e0b" }}
                        />
                        <div className="text-xs font-medium text-muted-foreground uppercase">
                          Thay đổi nhỏ
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                        {results.score.minorChangedWords ?? 0}
                      </div>
                      <div className="text-xs text-muted-foreground">từ</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border bg-background/50">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: "#eab308" }}
                        />
                        <div className="text-xs font-medium text-muted-foreground uppercase">
                          Ý nghĩa tương tự
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                        {results.score.relatedMeaningWords ?? 0}
                      </div>
                      <div className="text-xs text-muted-foreground">từ</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sources Count Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="shadow-sm hover:shadow-md transition-shadow border-2 hover:border-blue-300 dark:hover:border-blue-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">
                            Nguồn Internet
                          </span>
                        </div>
                        <div className="text-3xl font-bold">
                          {results.internet.length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow border-2 hover:border-purple-300 dark:hover:border-purple-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <Database className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">
                            Cơ sở dữ liệu
                          </span>
                        </div>
                        <div className="text-3xl font-bold">
                          {results.database.length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sources" className="space-y-6 mt-0">
              {results.internet.length > 0 && (
                <div className="space-y-4">
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        Nguồn từ Internet
                        <Badge variant="secondary" className="ml-2">
                          {results.internet.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Chart chỉ hiển thị khi có nhiều nguồn (>= 5) */}
                      {internetSourcesChartData.length >= 5 && (
                        <div className="mb-6 p-4 rounded-lg border bg-muted/30">
                          <div className="text-sm font-medium mb-3 text-muted-foreground">
                            Top {Math.min(internetSourcesChartData.length, 10)}{" "}
                            nguồn có độ tương đồng cao nhất
                          </div>
                          <ChartContainer
                            config={sourcesChartConfig}
                            className="h-[250px] w-full"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={internetSourcesChartData.slice(0, 10)}
                                margin={{
                                  top: 10,
                                  right: 20,
                                  left: 0,
                                  bottom: 50,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="hsl(var(--border))"
                                  opacity={0.2}
                                />
                                <XAxis
                                  dataKey="name"
                                  angle={-35}
                                  textAnchor="end"
                                  height={80}
                                  interval={0}
                                  tick={{ fontSize: 10 }}
                                  tickFormatter={(value: string) => {
                                    if (value.length > 20) {
                                      return value.substring(0, 17) + "...";
                                    }
                                    return value;
                                  }}
                                />
                                <YAxis
                                  tick={{ fontSize: 11 }}
                                  label={{
                                    value: "Độ tương đồng (%)",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: {
                                      textAnchor: "middle",
                                      fontSize: 11,
                                    },
                                  }}
                                />
                                <ChartTooltip
                                  content={({ active, payload }) => {
                                    if (!active || !payload?.[0]) return null;
                                    const data = payload[0].payload;
                                    return (
                                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                                        <div className="grid gap-2">
                                          <div className="font-medium text-sm">
                                            {data.name}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            Tương đồng:{" "}
                                            <span className="font-semibold text-foreground">
                                              {data.similarity}%
                                            </span>
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            Từ khớp: {data.matchedWords}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }}
                                />
                                <Bar
                                  dataKey="similarity"
                                  fill="hsl(var(--chart-1))"
                                  radius={[4, 4, 0, 0]}
                                  animationBegin={0}
                                  animationDuration={600}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      )}

                      {/* Source List */}
                      <div className="space-y-3">
                        {results.internet.map((source, index) => {
                          const similarity =
                            (source.identicalWords / source.totalWords) * 100;
                          return (
                            <Card
                              key={index}
                              className="border-2 hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-700"
                            >
                              <CardContent className="pt-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0 space-y-2">
                                    <a
                                      href={source.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-base font-semibold text-primary hover:underline flex items-center gap-2 group"
                                    >
                                      {source.title || source.url}
                                      <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {source.introduction}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                                      <span className="flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        Từ khớp: {source.matchedWords}
                                      </span>
                                      <span>
                                        Giống hệt: {source.identicalWords}
                                      </span>
                                      <span>Tổng từ: {source.totalWords}</span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1 shrink-0">
                                    <Badge
                                      variant={getScoreColor(similarity)}
                                      className="text-base px-3 py-1.5 font-bold"
                                    >
                                      {similarity.toFixed(1)}%
                                    </Badge>
                                    <div className="text-xs text-muted-foreground text-right">
                                      {source.matchedWords} từ khớp
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {results.database.length > 0 && (
                <Card className="border-2 mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <Database className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      Nguồn từ Cơ sở dữ liệu
                      <Badge variant="secondary" className="ml-2">
                        {results.database.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {results.database.map((source, index) => {
                      const dbSource = source as {
                        title?: string;
                        id?: string;
                        introduction?: string;
                      };
                      return (
                        <Card
                          key={index}
                          className="border hover:shadow-md transition-shadow"
                        >
                          <CardContent className="pt-4">
                            <div className="font-semibold text-base mb-1">
                              {dbSource.title || dbSource.id}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {dbSource.introduction}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {results.internet.length === 0 &&
                results.database.length === 0 && (
                  <Card className="border-2 border-dashed">
                    <CardContent className="py-12">
                      <div className="text-center space-y-3">
                        <div className="flex justify-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-lg">
                            Không tìm thấy nguồn tương đồng
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Tài liệu này có độ độc đáo cao
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
            </TabsContent>

            <TabsContent value="writing" className="space-y-6 mt-0">
              {writingFeedback ? (
                <>
                  {/* Overall Score Card */}
                  <Card className="shadow-lg border-2 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          Điểm tổng thể
                        </CardTitle>
                        <Badge
                          variant={
                            writingFeedback.score.overallScore >= 80
                              ? "default"
                              : "secondary"
                          }
                          className="text-base px-4 py-1.5 font-bold"
                        >
                          {writingFeedback.score.overallScore}/100
                        </Badge>
                      </div>
                      <CardDescription className="pt-2">
                        Đánh giá tổng quan về chất lượng viết
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Writing Scores Bar Chart */}
                      {writingFeedbackChartData.length > 0 && (
                        <div className="mb-6">
                          <ChartContainer
                            config={writingChartConfig}
                            className="h-[250px] w-full"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={writingFeedbackChartData}
                                margin={{
                                  top: 10,
                                  right: 20,
                                  left: 0,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="hsl(var(--border))"
                                  opacity={0.2}
                                />
                                <XAxis
                                  dataKey="category"
                                  tick={{ fontSize: 12 }}
                                  angle={-15}
                                  textAnchor="end"
                                  height={70}
                                />
                                <YAxis
                                  domain={[0, 100]}
                                  tick={{ fontSize: 11 }}
                                  label={{
                                    value: "Điểm",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: {
                                      textAnchor: "middle",
                                      fontSize: 11,
                                    },
                                  }}
                                />
                                <ChartTooltip
                                  content={({ active, payload }) => {
                                    if (!active || !payload?.[0]) return null;
                                    const data = payload[0].payload;
                                    return (
                                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                                        <div className="grid gap-2">
                                          <div className="font-medium text-sm">
                                            {data.category}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            Điểm:{" "}
                                            <span className="font-semibold text-foreground">
                                              {data.score}/100
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }}
                                />
                                <Bar
                                  dataKey="score"
                                  radius={[6, 6, 0, 0]}
                                  animationBegin={0}
                                  animationDuration={600}
                                >
                                  {writingFeedbackChartData.map(
                                    (entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={entry.fill}
                                      />
                                    )
                                  )}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <Card className="border-2">
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="text-sm font-semibold text-foreground">
                                Ngữ pháp
                              </div>
                              <div className="flex items-baseline gap-2">
                                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                  {
                                    writingFeedback.score
                                      .grammarCorrectionsScore
                                  }
                                </div>
                                <div className="text-lg text-muted-foreground">
                                  /100
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {writingFeedback.score.grammarCorrectionsCount}{" "}
                                lỗi được phát hiện
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border-2">
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="text-sm font-semibold text-foreground">
                                Cơ học
                              </div>
                              <div className="flex items-baseline gap-2">
                                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                                  {
                                    writingFeedback.score
                                      .mechanicsCorrectionsScore
                                  }
                                </div>
                                <div className="text-lg text-muted-foreground">
                                  /100
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {
                                  writingFeedback.score
                                    .mechanicsCorrectionsCount
                                }{" "}
                                lỗi được phát hiện
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border-2">
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="text-sm font-semibold text-foreground">
                                Cấu trúc câu
                              </div>
                              <div className="flex items-baseline gap-2">
                                <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                                  {
                                    writingFeedback.score
                                      .sentenceStructureCorrectionsScore
                                  }
                                </div>
                                <div className="text-lg text-muted-foreground">
                                  /100
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {
                                  writingFeedback.score
                                    .sentenceStructureCorrectionsCount
                                }{" "}
                                lỗi được phát hiện
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border-2">
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="text-sm font-semibold text-foreground">
                                Lựa chọn từ
                              </div>
                              <div className="flex items-baseline gap-2">
                                <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                                  {
                                    writingFeedback.score
                                      .wordChoiceCorrectionsScore
                                  }
                                </div>
                                <div className="text-lg text-muted-foreground">
                                  /100
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {
                                  writingFeedback.score
                                    .wordChoiceCorrectionsCount
                                }{" "}
                                lỗi được phát hiện
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Readability Card */}
                  <Card className="shadow-sm border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        Độ dễ đọc
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <span className="text-sm font-medium">Điểm</span>
                        <Badge
                          variant="outline"
                          className="text-base px-3 py-1"
                        >
                          {writingFeedback.readability.score}/100
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <span className="text-sm font-medium">Mức độ</span>
                        <span className="font-bold text-base">
                          {writingFeedback.readability.readabilityLevelText}
                        </span>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">
                          {
                            writingFeedback.readability
                              .readabilityLevelDescription
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Text Statistics Card */}
                  <Card className="shadow-sm border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                          <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        Thống kê văn bản
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg border bg-background/50 text-center">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Số câu
                          </div>
                          <div className="text-3xl font-bold">
                            {writingFeedback.textStatistics.sentenceCount}
                          </div>
                        </div>
                        <div className="p-4 rounded-lg border bg-background/50 text-center">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Độ dài từ trung bình
                          </div>
                          <div className="text-3xl font-bold">
                            {writingFeedback.textStatistics.averageWordLength.toFixed(
                              1
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            ký tự
                          </div>
                        </div>
                        <div className="p-4 rounded-lg border bg-background/50 text-center">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Độ dài câu trung bình
                          </div>
                          <div className="text-3xl font-bold">
                            {writingFeedback.textStatistics.averageSentenceLength.toFixed(
                              1
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            từ
                          </div>
                        </div>
                        <div className="p-4 rounded-lg border bg-background/50 text-center">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Thời gian đọc
                          </div>
                          <div className="text-3xl font-bold">
                            {Math.round(
                              writingFeedback.textStatistics.readingTimeSeconds
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            giây
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="border-2 border-dashed">
                  <CardContent className="py-12">
                    <div className="text-center space-y-3">
                      <div className="flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                          <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-lg">
                          Không có dữ liệu đánh giá viết
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Tính năng đánh giá viết chưa được kích hoạt cho tài
                          liệu này
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
