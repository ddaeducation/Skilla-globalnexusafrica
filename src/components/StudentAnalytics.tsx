import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Flame, Award, BookOpen } from "lucide-react";

interface StudentAnalyticsProps {
  enrolledCourses: any[];
  progress: any[];
  quizAttempts: any[];
  totalTimeSpent: number;
}

const StudentAnalytics = ({ enrolledCourses, progress, quizAttempts, totalTimeSpent }: StudentAnalyticsProps) => {
  const analytics = useMemo(() => {
    const completedLessons = progress.filter((p) => p.completed).length;
    const totalLessons = progress.length;
    const overallCompletion = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Quiz performance
    const completedQuizzes = quizAttempts.filter((a) => a.completed_at);
    const passedQuizzes = completedQuizzes.filter((a) => a.passed);
    const avgQuizScore =
      completedQuizzes.length > 0
        ? Math.round(
            completedQuizzes.reduce((sum, a) => sum + (a.max_score > 0 ? (a.score / a.max_score) * 100 : 0), 0) /
              completedQuizzes.length
          )
        : 0;

    // Streak calculation (consecutive days with activity)
    const activityDates = progress
      .filter((p) => p.completed && p.completed_at)
      .map((p) => new Date(p.completed_at).toDateString());
    const uniqueDates = [...new Set(activityDates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < uniqueDates.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (uniqueDates[i] === expected.toDateString()) {
        streak++;
      } else break;
    }

    // Per-course progress
    const courseProgress = enrolledCourses.map((course) => {
      const courseItems = progress.filter((p) => p.courses?.title === course.title || p.course_id === course.id);
      const completed = courseItems.filter((p) => p.completed).length;
      const total = courseItems.length;
      return {
        id: course.id,
        title: course.title,
        completed,
        total,
        pct: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    return {
      overallCompletion,
      completedLessons,
      totalLessons,
      avgQuizScore,
      passedQuizzes: passedQuizzes.length,
      totalQuizzes: completedQuizzes.length,
      streak,
      courseProgress,
    };
  }, [enrolledCourses, progress, quizAttempts]);

  if (enrolledCourses.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        Learning Analytics
      </h2>

      {/* Quick stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.overallCompletion}%</p>
                <p className="text-xs text-muted-foreground">Overall Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-orange-500/10">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.streak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-green-500/10">
                <Award className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.avgQuizScore}%</p>
                <p className="text-xs text-muted-foreground">Avg Quiz Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-blue-500/10">
                <BookOpen className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {analytics.completedLessons}/{analytics.totalLessons}
                </p>
                <p className="text-xs text-muted-foreground">Lessons Done</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-course progress */}
      {analytics.courseProgress.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Course Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.courseProgress.map((cp) => (
              <div key={cp.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground truncate mr-2">{cp.title}</span>
                  <Badge variant={cp.pct === 100 ? "default" : "secondary"} className="shrink-0">
                    {cp.pct}%
                  </Badge>
                </div>
                <Progress value={cp.pct} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {cp.completed} of {cp.total} items completed
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentAnalytics;
