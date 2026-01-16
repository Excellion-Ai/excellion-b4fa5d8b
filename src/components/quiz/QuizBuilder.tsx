import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, GripVertical, HelpCircle } from 'lucide-react';

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false';
  options: string[];
  correct_index: number;
  explanation: string;
}

interface QuizBuilderProps {
  questions: QuizQuestion[];
  passingScore: number;
  onQuestionsChange: (questions: QuizQuestion[]) => void;
  onPassingScoreChange: (score: number) => void;
}

const generateId = () => `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function QuizBuilder({
  questions,
  passingScore,
  onQuestionsChange,
  onPassingScoreChange,
}: QuizBuilderProps) {
  const handleAddQuestion = useCallback(() => {
    const newQuestion: QuizQuestion = {
      id: generateId(),
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_index: 0,
      explanation: '',
    };
    onQuestionsChange([...questions, newQuestion]);
  }, [questions, onQuestionsChange]);

  const handleRemoveQuestion = useCallback((questionId: string) => {
    onQuestionsChange(questions.filter(q => q.id !== questionId));
  }, [questions, onQuestionsChange]);

  const handleQuestionChange = useCallback((questionId: string, field: keyof QuizQuestion, value: unknown) => {
    onQuestionsChange(questions.map(q => {
      if (q.id !== questionId) return q;
      
      if (field === 'type' && value === 'true_false') {
        return { ...q, [field]: value, options: ['True', 'False'], correct_index: 0 };
      }
      if (field === 'type' && value === 'multiple_choice') {
        return { ...q, [field]: value, options: ['', '', '', ''], correct_index: 0 };
      }
      
      return { ...q, [field]: value };
    }));
  }, [questions, onQuestionsChange]);

  const handleOptionChange = useCallback((questionId: string, optionIndex: number, value: string) => {
    onQuestionsChange(questions.map(q => {
      if (q.id !== questionId) return q;
      const newOptions = [...q.options];
      newOptions[optionIndex] = value;
      return { ...q, options: newOptions };
    }));
  }, [questions, onQuestionsChange]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label htmlFor="passingScore" className="text-sm font-medium text-foreground">
            Passing Score (%)
          </Label>
          <Input
            id="passingScore"
            type="number"
            min={0}
            max={100}
            value={passingScore}
            onChange={(e) => onPassingScoreChange(parseInt(e.target.value) || 70)}
            className="mt-1 w-32 bg-background border-border"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {questions.length} question{questions.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary" />
          Questions
        </h3>

        {questions.map((question, index) => (
          <Card key={question.id} className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  Question {index + 1}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveQuestion(question.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Question</Label>
                <Textarea
                  value={question.question}
                  onChange={(e) => handleQuestionChange(question.id, 'question', e.target.value)}
                  placeholder="Enter your question..."
                  className="mt-1 bg-background border-border"
                />
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Answer Type</Label>
                <Select
                  value={question.type}
                  onValueChange={(value) => handleQuestionChange(question.id, 'type', value)}
                >
                  <SelectTrigger className="mt-1 w-48 bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Answers (select correct answer)
                </Label>
                <RadioGroup
                  value={question.correct_index.toString()}
                  onValueChange={(value) => handleQuestionChange(question.id, 'correct_index', parseInt(value))}
                  className="space-y-2"
                >
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-3">
                      <RadioGroupItem
                        value={optionIndex.toString()}
                        id={`${question.id}-option-${optionIndex}`}
                        className="border-primary text-primary"
                      />
                      {question.type === 'true_false' ? (
                        <Label
                          htmlFor={`${question.id}-option-${optionIndex}`}
                          className="text-sm text-foreground cursor-pointer"
                        >
                          {option}
                        </Label>
                      ) : (
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(question.id, optionIndex, e.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                          className="flex-1 bg-background border-border"
                        />
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">
                  Explanation (shown after answer)
                </Label>
                <Textarea
                  value={question.explanation}
                  onChange={(e) => handleQuestionChange(question.id, 'explanation', e.target.value)}
                  placeholder="Explain why this is the correct answer..."
                  className="mt-1 bg-background border-border"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={handleAddQuestion}
        className="w-full border-primary/30 text-primary hover:bg-primary/10"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Question
      </Button>
    </div>
  );
}
