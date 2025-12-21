import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Award, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { GradingRubric, GradeSubmission } from "@/services/types";
import { DEFAULT_GRADING_RUBRIC } from "@/services/types";

interface GradingFormProps {
  milestoneId: number;
  studentName?: string;
  projectName?: string;
  reportUrl?: string | null;
  reportComment?: string | null;
  onSubmit: (data: GradeSubmission) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  existingGrade?: {
    scores: Array<{ criterionId: number; score: number }>;
    totalScore: number;
    feedback?: string | null;
  } | null;
}

export function GradingForm({
  milestoneId,
  studentName,
  projectName,
  reportUrl,
  reportComment,
  onSubmit,
  onCancel,
  isSubmitting = false,
  existingGrade,
}: GradingFormProps) {
  const rubric: GradingRubric = DEFAULT_GRADING_RUBRIC;

  // Initialize scores from existing grade or zeros
  const [scores, setScores] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    rubric.criteria.forEach((criterion) => {
      const existing = existingGrade?.scores.find(
        (s) => s.criterionId === criterion.id
      );
      initial[criterion.id] = existing?.score ?? 0;
    });
    return initial;
  });

  const [feedback, setFeedback] = useState(existingGrade?.feedback ?? "");

  // Calculate total score
  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0
  );

  // Determine grade level
  const getGradeLevel = (score: number) => {
    if (score >= 90) return { label: "Xuất sắc", color: "bg-green-500" };
    if (score >= 80) return { label: "Tốt", color: "bg-blue-500" };
    if (score >= 70) return { label: "Khá", color: "bg-yellow-500" };
    if (score >= 60) return { label: "Trung bình", color: "bg-orange-500" };
    return { label: "Không đạt", color: "bg-red-500" };
  };

  const gradeLevel = getGradeLevel(totalScore);

  const handleScoreChange = (criterionId: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    const criterion = rubric.criteria.find((c) => c.id === criterionId);
    if (!criterion) return;

    // Clamp value between 0 and maxScore
    const clampedValue = Math.max(0, Math.min(numValue, criterion.maxScore));
    setScores((prev) => ({ ...prev, [criterionId]: clampedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const gradeData: GradeSubmission = {
      milestoneId,
      scores: Object.entries(scores).map(([criterionId, score]) => ({
        criterionId: parseInt(criterionId),
        score,
      })),
      totalScore,
      feedback: feedback.trim() || null,
      gradedAt: new Date().toISOString(),
    };

    onSubmit(gradeData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 border-b pb-4">
        <h2 className="text-xl font-bold mt-4">PHIẾU ĐÁNH GIÁ</h2>
        <h3 className="text-lg font-semibold">
          ĐỀ TÀI NGHIÊN CỨU KHOA HỌC CỦA SINH VIÊN
        </h3>
      </div>

      {/* Student Info */}
      <div className="space-y-3 text-sm">
        {studentName && (
          <div className="flex gap-2">
            <span className="font-medium min-w-[200px]">
              1. Họ tên thành viên hội đồng:
            </span>
            <span className="flex-1 border-b border-dotted">{studentName}</span>
          </div>
        )}
        {projectName && (
          <div className="flex gap-2">
            <span className="font-medium min-w-[200px]">3. Tên đề tài:</span>
            <span className="flex-1 border-b border-dotted">{projectName}</span>
          </div>
        )}
      </div>

      {/* Report Preview */}
      {(reportUrl || reportComment) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Báo cáo đã nộp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reportComment && (
              <div className="text-sm">
                <p className="font-medium mb-1">Nhận xét:</p>
                <p className="text-muted-foreground">{reportComment}</p>
              </div>
            )}
            {reportUrl && (
              <div>
                <a
                  href={reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Xem tài liệu đính kèm →
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Grading Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            6. Đánh giá của thành viên hội đồng:
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border border-border p-2 text-sm font-semibold w-16">
                    TT
                  </th>
                  <th className="border border-border p-2 text-sm font-semibold">
                    Nội dung đánh giá
                  </th>
                  <th className="border border-border p-2 text-sm font-semibold w-24">
                    Điểm tối đa
                  </th>
                  <th className="border border-border p-2 text-sm font-semibold w-32">
                    Điểm đánh giá
                  </th>
                </tr>
              </thead>
              <tbody>
                {rubric.criteria.map((criterion, index) => (
                  <tr key={criterion.id} className="hover:bg-muted/30">
                    <td className="border border-border p-2 text-center text-sm">
                      {index + 1}
                    </td>
                    <td className="border border-border p-2 text-sm">
                      <div>
                        <div className="font-medium">{criterion.name}</div>
                        {criterion.description && (
                          <div className="text-xs text-muted-foreground mt-1 italic">
                            {criterion.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="border border-border p-2 text-center text-sm font-medium">
                      {criterion.maxScore}
                    </td>
                    <td className="border border-border p-2">
                      <Input
                        type="number"
                        min={0}
                        max={criterion.maxScore}
                        step={0.5}
                        value={scores[criterion.id] || 0}
                        onChange={(e) =>
                          handleScoreChange(criterion.id, e.target.value)
                        }
                        className="text-center font-medium"
                        required
                      />
                    </td>
                  </tr>
                ))}
                <tr className="bg-primary/5 font-bold">
                  <td
                    colSpan={2}
                    className="border border-border p-2 text-sm text-right"
                  >
                    Cộng
                  </td>
                  <td className="border border-border p-2 text-center text-sm">
                    {rubric.totalScore}
                  </td>
                  <td className="border border-border p-2 text-center text-lg">
                    {totalScore.toFixed(1)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grade Level Indicator */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <Award className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Xếp loại:</span>
            <Badge className={`${gradeLevel.color} text-white px-4 py-1`}>
              {gradeLevel.label}
            </Badge>
          </div>

          {/* Grading Note */}
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Ghi chú:</strong> Đề tài được xếp loại (theo điểm trung
              bình cuối cùng) ở mức xuất sắc: từ 90 điểm trở lên; mức tốt: từ 80
              điểm đến dưới 90 điểm; mức khá: từ 70 điểm đến dưới 80 điểm; mức
              không đạt dưới 70 điểm.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Feedback */}
      <div className="space-y-2">
        <Label htmlFor="feedback" className="text-sm font-medium">
          7. Ý kiến khác:
        </Label>
        <Textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Nhập ý kiến đánh giá, nhận xét về đề tài..."
          className="min-h-[120px]"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Đang lưu..."
            : existingGrade
            ? "Cập nhật điểm"
            : "Lưu điểm"}
        </Button>
      </div>
    </form>
  );
}
