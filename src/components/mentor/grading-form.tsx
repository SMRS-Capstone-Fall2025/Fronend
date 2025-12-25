import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { GradeSubmission, GradingRubric } from "@/services/types";
import { DEFAULT_GRADING_RUBRIC } from "@/services/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Award, FileText } from "lucide-react";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

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
  readOnly?: boolean;
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
  readOnly = false,
}: GradingFormProps) {
  const rubric: GradingRubric = DEFAULT_GRADING_RUBRIC;

  const gradingSchema = useMemo(() => {
    const scoresSchema: Record<string, z.ZodNumber> = {};
    rubric.criteria.forEach((criterion) => {
      scoresSchema[`score_${criterion.id}`] = z
        .number()
        .min(0, `Điểm không được nhỏ hơn 0`)
        .max(
          criterion.maxScore,
          `Điểm không được vượt quá ${criterion.maxScore}`
        );
    });

    return z.object({
      ...scoresSchema,
      feedback: z.string().optional(),
    });
  }, [rubric]);

  type GradingFormValues = z.infer<typeof gradingSchema>;

  const defaultValues = useMemo(() => {
    const values: Record<string, number | string> = {
      feedback: existingGrade?.feedback ?? "",
    };
    rubric.criteria.forEach((criterion) => {
      const existing = existingGrade?.scores.find(
        (s) => s.criterionId === criterion.id
      );
      values[`score_${criterion.id}`] = existing?.score ?? 0;
    });
    return values as GradingFormValues;
  }, [rubric, existingGrade]);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<GradingFormValues>({
    resolver: zodResolver(gradingSchema),
    defaultValues,
    disabled: readOnly,
  });

  const watchedValues = watch();
  const totalScore = useMemo(() => {
    return rubric.criteria.reduce((sum, criterion) => {
      const key = `score_${criterion.id}` as keyof typeof watchedValues;
      const rawScore = watchedValues?.[key];
      const score =
        typeof rawScore === "number" ? rawScore : Number(rawScore) || 0;
      return sum + score;
    }, 0);
  }, [watchedValues, rubric]);

  const getGradeLevel = (score: number) => {
    if (score >= 90) return { label: "Xuất sắc", color: "bg-green-500" };
    if (score >= 80) return { label: "Tốt", color: "bg-blue-500" };
    if (score >= 70) return { label: "Khá", color: "bg-yellow-500" };
    if (score >= 60) return { label: "Trung bình", color: "bg-orange-500" };
    return { label: "Không đạt", color: "bg-red-500" };
  };

  const gradeLevel = getGradeLevel(totalScore);

  const onSubmitForm = handleSubmit((data) => {
    const gradeData: GradeSubmission = {
      milestoneId,
      scores: rubric.criteria.map((criterion) => ({
        criterionId: criterion.id,
        score:
          Number((data as Record<string, unknown>)[`score_${criterion.id}`]) ||
          0,
      })),
      totalScore,
      feedback:
        typeof data.feedback === "string" ? data.feedback.trim() || null : null,
      gradedAt: new Date().toISOString(),
    };

    onSubmit(gradeData);
  });

  return (
    <form onSubmit={onSubmitForm} className="space-y-6">
      <div className="text-center space-y-2 border-b pb-4">
        <h2 className="text-xl font-bold mt-4">PHIẾU ĐÁNH GIÁ</h2>
        <h3 className="text-lg font-semibold">
          ĐỀ TÀI NGHIÊN CỨU KHOA HỌC CỦA SINH VIÊN
        </h3>
      </div>

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
                      <Controller
                        name={
                          `score_${criterion.id}` as keyof GradingFormValues
                        }
                        control={control}
                        render={({ field }) => (
                          <div>
                            <Input
                              type="number"
                              min={0}
                              max={criterion.maxScore}
                              step={0.5}
                              {...field}
                              value={field.value ?? 0}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                const clampedValue = Math.max(
                                  0,
                                  Math.min(value, criterion.maxScore)
                                );
                                field.onChange(clampedValue);
                              }}
                              className="text-center font-medium"
                              disabled={readOnly || isSubmitting}
                              readOnly={readOnly}
                            />
                            {errors[`score_${criterion.id}` as keyof typeof errors] && (
                              <p className="text-xs text-destructive mt-1">
                                {String(
                                  errors[`score_${criterion.id}` as keyof typeof errors]
                                    ?.message ?? ""
                                )}
                              </p>
                            )}
                          </div>
                        )}
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

          <div className="mt-4 flex items-center justify-center gap-3">
            <Award className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Xếp loại:</span>
            <Badge className={`${gradeLevel.color} text-white px-4 py-1`}>
              {gradeLevel.label}
            </Badge>
          </div>

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

      <div className="space-y-2">
        <Label htmlFor="feedback" className="text-sm font-medium">
          7. Ý kiến khác:
        </Label>
        <Textarea
          id="feedback"
          {...register("feedback")}
          placeholder="Nhập ý kiến đánh giá, nhận xét về đề tài..."
          className="min-h-[120px]"
          disabled={readOnly || isSubmitting}
          readOnly={readOnly}
        />
        {errors.feedback && (
          <p className="text-xs text-destructive">{errors.feedback.message}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant={readOnly ? "default" : "outline"}
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {readOnly ? "Đóng" : "Hủy"}
        </Button>
        {!readOnly && (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Đang lưu..."
              : existingGrade
              ? "Cập nhật điểm"
              : "Lưu điểm"}
          </Button>
        )}
      </div>
    </form>
  );
}
