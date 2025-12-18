import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LoadingAnimation,
  ShieldScanningAnimation,
  SuccessAnimation,
} from "@/components/ui/lottie";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  useCheckPlagiarismMutation,
  useSubmitPlagiarismUrlMutation,
} from "@/services/plagiarism/hooks";
import type { PlagiarismCheckResult } from "@/services/types/plagiarism";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";

interface PlagiarismCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: number;
  reportFilePath: string | null;
  projectName?: string;
  onResultReady?: (resultData: unknown) => void;
}

export function PlagiarismCheckDialog({
  open,
  onOpenChange,
  reportId,
  reportFilePath,
  projectName,
  onResultReady,
}: PlagiarismCheckDialogProps) {
  const [result, setResult] = useState<PlagiarismCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [processingDialogOpen, setProcessingDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const { toast } = useToast();
  const submitUrlMutation = useSubmitPlagiarismUrlMutation();
  const checkPlagiarismMutation = useCheckPlagiarismMutation();

  useEffect(() => {
    if (!open) {
      setResult(null);
      setProcessingDialogOpen(false);
      setSuccessDialogOpen(false);
      setIsChecking(false);
    }
  }, [open]);

  const handleCheck = async () => {
    if (!reportFilePath) {
      toast({
        title: "Thiếu file",
        description: "Không tìm thấy file báo cáo. Vui lòng kiểm tra lại.",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    try {
      // Call BE API to check plagiarism
      const checkResult = await checkPlagiarismMutation.mutateAsync({
        reportId,
        reportFilePath: reportFilePath,
      });
      setResult(checkResult);

      // Submit plagiarism report to backend (only if reportFilePath exists and scanId is available)
      if (reportFilePath && checkResult?.scanId) {
        try {
          await submitUrlMutation.mutateAsync({
            scanId: checkResult.scanId,
            url: reportFilePath,
          });
        } catch (error) {
          console.error("Failed to submit plagiarism report:", error);
          // Don't show error toast here, just log it
        }
      }

      // Show success dialog
      setSuccessDialogOpen(true);
      setProcessingDialogOpen(false);

      if (checkResult.status === "completed" && onResultReady) {
        const mockData = {
          scannedDocument: {
            scanId: checkResult.scanId,
            totalWords: 1367,
            totalExcluded: 3,
            credits: 0,
            expectedCredits: 6,
            creationTime: new Date().toISOString(),
            metadata: {
              creationDate: "2016-03-19T06:18:44Z",
              lastModificationDate: "2016-03-19T06:18:44Z",
              author: "Philip Hutchison",
              filename: reportFilePath.split("/").pop() || "report.pdf",
            },
            detectedLanguage: "vi",
          },
          results: {
            score: {
              identicalWords: checkResult.identical,
              minorChangedWords: checkResult.minorChanges,
              relatedMeaningWords: checkResult.relatedMeaning,
              aggregatedScore: checkResult.overallSimilarity / 100,
            },
            internet: checkResult.sources
              .filter((s: { type: string }) => s.type === "internet")
              .map(
                (s: {
                  url: string;
                  title: string;
                  introduction: string;
                  matchedWords: number;
                  identicalWords: number;
                }) => ({
                  url: s.url,
                  id: s.url.split("/").pop() || "",
                  title: s.title,
                  introduction: s.introduction,
                  matchedWords: s.matchedWords,
                  identicalWords: s.identicalWords,
                  similarWords: 0,
                  paraphrasedWords: 0,
                  totalWords: s.matchedWords + 10,
                })
              ),
            database: checkResult.sources
              .filter((s: { type: string }) => s.type === "database")
              .map(
                (s: {
                  url: string;
                  title: string;
                  introduction: string;
                  matchedWords: number;
                  identicalWords: number;
                }) => ({
                  url: s.url,
                  id: s.url,
                  title: s.title,
                  introduction: s.introduction,
                  matchedWords: s.matchedWords,
                  identicalWords: s.identicalWords,
                })
              ),
            batch: [],
            repositories: [],
          },
          writingFeedback: {
            textStatistics: {
              sentenceCount: 45,
              averageWordLength: 4.7,
              averageSentenceLength: 12.8,
              readingTimeSeconds: 21.0,
              speakingTimeSeconds: 29.5,
            },
            score: {
              grammarCorrectionsCount: 1,
              grammarCorrectionsScore: 93,
              mechanicsCorrectionsCount: 1,
              mechanicsCorrectionsScore: 93,
              sentenceStructureCorrectionsCount: 1,
              sentenceStructureCorrectionsScore: 93,
              wordChoiceCorrectionsCount: 0,
              wordChoiceCorrectionsScore: 100,
              overallScore: 94,
            },
            readability: {
              score: 95,
              readabilityLevel: 1,
              readabilityLevelText: "5th Grader",
              readabilityLevelDescription: "Very easy to read",
            },
          },
          status: 0,
        };
        onResultReady(mockData);
      }
    } catch (error) {
      console.error("Failed to check plagiarism:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể kiểm tra đạo văn. Vui lòng thử lại.";

      toast({
        title: "Lỗi kiểm tra đạo văn",
        description: errorMessage,
        variant: "destructive",
        duration: 10000,
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 80) return "Rất cao";
    if (similarity >= 50) return "Cao";
    if (similarity >= 30) return "Trung bình";
    return "Thấp";
  };

  const getSimilarityVariant = (
    similarity: number
  ): "destructive" | "default" | "secondary" => {
    if (similarity >= 80) return "destructive";
    if (similarity >= 50) return "default";
    return "secondary";
  };

  return (
    <>
      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Kiểm tra đạo văn thành công
            </DialogTitle>
            <DialogDescription>
              {projectName && `Báo cáo: ${projectName}`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-6 py-8">
            <SuccessAnimation />
            <div className="text-center space-y-3">
              <p className="text-lg font-semibold text-green-600">
                Đã gửi yêu cầu kiểm tra đạo văn thành công!
              </p>
              <p className="text-sm text-muted-foreground">
                Hệ thống đang xử lý báo cáo của bạn. Bạn có thể xem kết quả sau
                khi quá trình kiểm tra hoàn tất.
              </p>
            </div>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setSuccessDialogOpen(false);
                  onOpenChange(false);
                }}
                className="flex-1"
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  setSuccessDialogOpen(false);
                  setProcessingDialogOpen(true);
                }}
                className="flex-1"
              >
                Xem trạng thái
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Processing Dialog */}
      <Dialog
        open={processingDialogOpen}
        onOpenChange={setProcessingDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Đang xử lý kiểm tra đạo văn
            </DialogTitle>
            <DialogDescription>
              {projectName && `Báo cáo: ${projectName}`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-6 py-8">
            <ShieldScanningAnimation />
            <div className="text-center space-y-3">
              <p className="text-sm font-medium">
                Đang chờ xử lý kiểm tra đạo văn
              </p>
              <p className="text-xs text-muted-foreground">
                Hệ thống đang xử lý báo cáo của bạn. Thời gian ước tính: khoảng
                3 phút
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setProcessingDialogOpen(false);
                onOpenChange(false);
              }}
              className="w-full"
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Check Dialog */}
      <Dialog
        open={open && !successDialogOpen && !processingDialogOpen}
        onOpenChange={onOpenChange}
      >
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Kiểm tra đạo văn
            </DialogTitle>
            <DialogDescription>
              {projectName && `Báo cáo: ${projectName}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!result && !isChecking && (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Hệ thống sẽ kiểm tra báo cáo của bạn với các nguồn trên
                    internet và cơ sở dữ liệu nội bộ để phát hiện nội dung đạo
                    văn. File báo cáo sẽ được lấy từ hệ thống.
                  </AlertDescription>
                </Alert>

                {reportFilePath && (
                  <div className="flex items-center gap-2 rounded-lg border p-3 bg-muted/50">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        File báo cáo đã sẵn sàng
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {reportFilePath.split("/").pop() || "report.pdf"}
                      </p>
                    </div>
                  </div>
                )}

                {!reportFilePath && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Không tìm thấy file báo cáo. Vui lòng kiểm tra lại.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleCheck}
                  disabled={isChecking || !reportFilePath}
                  className="w-full"
                  size="lg"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang kiểm tra...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Bắt đầu kiểm tra đạo văn
                    </>
                  )}
                </Button>
              </div>
            )}

            {isChecking && !result && (
              <div className="space-y-6 py-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <LoadingAnimation />
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium">
                      Đang xử lý và phân tích báo cáo...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Quá trình này có thể mất vài phút. Vui lòng đợi...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {result?.status === "completed" && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold text-lg">
                        Độ tương đồng tổng thể
                      </span>
                    </div>
                    <Badge
                      variant={getSimilarityVariant(result.overallSimilarity)}
                      className="text-lg px-3 py-1"
                    >
                      {result.overallSimilarity.toFixed(1)}% -{" "}
                      {getSimilarityLabel(result.overallSimilarity)}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Giống hệt</div>
                      <div className="font-semibold text-lg">
                        {result.identical} từ
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Thay đổi nhỏ</div>
                      <div className="font-semibold text-lg">
                        {result.minorChanges} từ
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        Ý nghĩa tương tự
                      </div>
                      <div className="font-semibold text-lg">
                        {result.relatedMeaning} từ
                      </div>
                    </div>
                  </div>

                  {result.aiScore !== undefined && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Khả năng được tạo bởi AI
                        </span>
                        <Badge
                          variant={
                            result.aiScore >= 80 ? "destructive" : "default"
                          }
                        >
                          {result.aiScore.toFixed(1)}%
                        </Badge>
                      </div>
                    </>
                  )}
                </div>

                {result.overallSimilarity >= 70 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Cảnh báo:</strong> Báo cáo có độ tương đồng cao (
                      {result.overallSimilarity.toFixed(1)}%). Vui lòng kiểm tra
                      lại các nguồn tham khảo và đảm bảo trích dẫn đúng cách.
                    </AlertDescription>
                  </Alert>
                )}

                {result.overallSimilarity < 70 &&
                  result.overallSimilarity >= 30 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Báo cáo có độ tương đồng ở mức trung bình. Vui lòng xem
                        xét các nguồn được liệt kê bên dưới.
                      </AlertDescription>
                    </Alert>
                  )}

                {result.overallSimilarity < 30 && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Báo cáo có độ tương đồng thấp. Đây là dấu hiệu tốt về tính
                      độc đáo của nội dung.
                    </AlertDescription>
                  </Alert>
                )}

                {result.sources.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <ExternalLink className="h-5 w-5" />
                      Các nguồn tương đồng ({result.sources.length})
                    </h4>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {result.sources.map((source, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-primary hover:underline flex items-center gap-1 group"
                              >
                                {source.title || source.url}
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {source.introduction}
                              </p>
                            </div>
                            <Badge
                              variant={getSimilarityVariant(source.similarity)}
                              className="shrink-0"
                            >
                              {source.similarity.toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              Từ khớp: {source.matchedWords.toLocaleString()}
                            </span>
                            <span>
                              Giống hệt:{" "}
                              {source.identicalWords.toLocaleString()}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {source.type === "internet"
                                ? "Internet"
                                : "Database"}
                            </Badge>
                          </div>
                          {source.comparisonReport && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() =>
                                window.open(source.comparisonReport, "_blank")
                              }
                            >
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Xem báo cáo so sánh chi tiết
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.sources.length === 0 && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Không tìm thấy nguồn tương đồng đáng kể. Báo cáo có vẻ độc
                      đáo.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="flex-1"
                  >
                    Đóng
                  </Button>

                  <Button
                    onClick={handleCheck}
                    disabled={isChecking}
                    className="flex-1"
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang kiểm tra lại...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Kiểm tra lại
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {result?.status === "failed" && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Lỗi:</strong>{" "}
                    {result.error ||
                      "Kiểm tra đạo văn thất bại. Vui lòng thử lại."}
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={handleCheck}
                  disabled={isChecking}
                  className="w-full"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang thử lại...
                    </>
                  ) : (
                    "Thử lại"
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
