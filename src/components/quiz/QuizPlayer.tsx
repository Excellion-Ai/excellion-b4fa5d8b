import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check, X, RotateCcw, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizQuestion } from './QuizBuilder';

interface QuizPlayerProps {
  lessonTitle: string;
  questions: QuizQuestion[];
  passingScore: number;
  onComplete: (score: number, passed: boolean, answers: Record<string, number>) => void;
  onContinue?: () => void;
  previousAttempt?: {
    score_percent: number;
    passed: boolean;
    answers: Record<string, number>;
  } | null;
}

type QuizState = 'taking' | 'results' | 'review';

export function QuizPlayer({
  lessonTitle,
  questions,
  passingScore,
  onComplete,
  onContinue,
  previousAttempt,
}: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizState, setQuizState] = useState<QuizState>(previousAttempt?.passed ? 'results' : 'taking');
  const [score, setScore] = useState(previousAttempt?.score_percent || 0);
  const [passed, setPassed] = useState(previousAttempt?.passed || false);

  const currentQuestion = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const selectedAnswer = userAnswers[currentQuestion?.id];

  const handleSelectAnswer = useCallback((optionIndex: number) => {
    if (quizState !== 'taking') return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  }, [currentQuestion?.id, quizState]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, questions.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleSubmit = useCallback(() => {
    let correct = 0;
    for (const question of questions) {
      if (userAnswers[question.id] === question.correct_index) {
        correct++;
      }
    }
    const scorePercent = Math.round((correct / questions.length) * 100);
    const hasPassed = scorePercent >= passingScore;
    
    setScore(scorePercent);
    setPassed(hasPassed);
    setQuizState('results');
    onComplete(scorePercent, hasPassed, userAnswers);
  }, [questions, userAnswers, passingScore, onComplete]);

  const handleRetake = useCallback(() => {
    setUserAnswers({});
    setCurrentIndex(0);
    setQuizState('taking');
    setScore(0);
    setPassed(false);
  }, []);

  const handleReview = useCallback(() => {
    setCurrentIndex(0);
    setQuizState('review');
  }, []);

  const answeredCount = Object.keys(userAnswers).length;
  const canSubmit = answeredCount === questions.length;

  if (quizState === 'results') {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="bg-card border-border text-center p-8">
          <CardContent className="space-y-6 pt-6">
            <div className={cn(
              "w-24 h-24 rounded-full mx-auto flex items-center justify-center",
              passed ? "bg-green-500/20" : "bg-destructive/20"
            )}>
              {passed ? (
                <Check className="w-12 h-12 text-green-500" />
              ) : (
                <X className="w-12 h-12 text-destructive" />
              )}
            </div>

            <div>
              <h2 className={cn(
                "text-2xl font-bold",
                passed ? "text-green-500" : "text-destructive"
              )}>
                {passed ? 'You Passed!' : 'Try Again'}
              </h2>
              <p className="text-4xl font-bold text-foreground mt-2">
                {score}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Passing score: {passingScore}%
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {passed && onContinue && (
                <Button 
                  onClick={onContinue}
                  className="bg-primary hover:bg-primary/90 w-full"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
              
              {!passed && (
                <Button 
                  onClick={handleRetake}
                  className="bg-primary hover:bg-primary/90 w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Quiz
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={handleReview}
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                Review Answers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-foreground">{lessonTitle}</h2>
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6 sm:p-8">
          <p className="text-xl font-medium text-foreground mb-6">
            {currentQuestion?.question}
          </p>

          <div className="space-y-3">
            {currentQuestion?.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = currentQuestion.correct_index === index;
              const showCorrect = quizState === 'review';
              const wasUserAnswer = quizState === 'review' && userAnswers[currentQuestion.id] === index;

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={quizState === 'review'}
                  className={cn(
                    "w-full p-4 rounded-lg border text-left transition-all",
                    quizState === 'taking' && !isSelected && "bg-muted/30 border-border/50 hover:border-primary/50 hover:bg-muted/50",
                    quizState === 'taking' && isSelected && "bg-primary/20 border-primary",
                    quizState === 'review' && isCorrect && "bg-green-500/20 border-green-500",
                    quizState === 'review' && wasUserAnswer && !isCorrect && "bg-destructive/20 border-destructive",
                    quizState === 'review' && !isCorrect && !wasUserAnswer && "bg-muted/30 border-border/50 opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">{option}</span>
                    {showCorrect && isCorrect && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                    {showCorrect && wasUserAnswer && !isCorrect && (
                      <X className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {quizState === 'review' && currentQuestion?.explanation && (
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm font-medium text-foreground mb-1">Explanation:</p>
              <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        {currentIndex === questions.length - 1 ? (
          quizState === 'taking' ? (
            <Button 
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-primary hover:bg-primary/90"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={() => setQuizState('results')}
            >
              View Results
            </Button>
          )
        ) : (
          <Button
            variant="outline"
            onClick={handleNext}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      {quizState === 'taking' && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          {answeredCount} of {questions.length} answered
        </p>
      )}
    </div>
  );
}
