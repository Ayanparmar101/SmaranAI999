import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, Plus, Trash2, Edit3 } from 'lucide-react';
import { Flashcard } from '@/types/flashcard';
import { v4 as uuidv4 } from 'uuid';

interface FlashcardEditorProps {
  flashcards: Flashcard[];
  onUpdateFlashcards: (flashcards: Flashcard[]) => void;
  onSaveSet: (title: string, description?: string) => void;
}

const FlashcardEditor: React.FC<FlashcardEditorProps> = ({
  flashcards,
  onUpdateFlashcards,
  onSaveSet
}) => {
  const [setTitle, setSetTitle] = useState('');
  const [setDescription, setSetDescription] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const updateFlashcard = (index: number, updates: Partial<Flashcard>) => {
    const updatedFlashcards = [...flashcards];
    updatedFlashcards[index] = { ...updatedFlashcards[index], ...updates };
    onUpdateFlashcards(updatedFlashcards);
  };

  const addFlashcard = () => {
    const newFlashcard: Flashcard = {
      id: uuidv4(),
      question: '',
      answer: '',
      difficulty: 'medium',
      createdAt: new Date(),
      reviewCount: 0,
      correctCount: 0
    };
    onUpdateFlashcards([...flashcards, newFlashcard]);
    setEditingIndex(flashcards.length);
  };

  const removeFlashcard = (index: number) => {
    const updatedFlashcards = flashcards.filter((_, i) => i !== index);
    onUpdateFlashcards(updatedFlashcards);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleSaveSet = async () => {
    if (!setTitle.trim()) {
      return;
    }
    
    setIsSaving(true);
    try {
      await onSaveSet(setTitle.trim(), setDescription.trim() || undefined);
      setSetTitle('');
      setSetDescription('');
    } finally {
      setIsSaving(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-600';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Save Set Section */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Save Flashcard Set</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="set-title" className="text-sm sm:text-base">Set Title *</Label>
            <Input
              id="set-title"
              placeholder="Enter flashcard set title"
              value={setTitle}
              onChange={(e) => setSetTitle(e.target.value)}
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="set-description" className="text-sm sm:text-base">Description (Optional)</Label>
            <Input
              id="set-description"
              placeholder="Brief description of the set"
              value={setDescription}
              onChange={(e) => setSetDescription(e.target.value)}
              className="min-h-[44px]"
            />
          </div>
        </div>
        <Button
          onClick={handleSaveSet}
          disabled={!setTitle.trim() || flashcards.length === 0 || isSaving}
          className="mt-4 w-full min-h-[48px]"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Flashcard Set'}
        </Button>
      </Card>

      {/* Flashcards List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-base sm:text-lg font-semibold">
            Flashcards ({flashcards.length})
          </h3>
          <Button onClick={addFlashcard} variant="outline" className="w-full sm:w-auto min-h-[44px]">
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </Button>
        </div>

        {flashcards.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No flashcards yet. Add some cards to get started!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {flashcards.map((card, index) => (
              <Card key={card.id} className="p-3 sm:p-4">
                <div className="space-y-3 sm:space-y-4">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">Card {index + 1}</span>
                      <Badge className={getDifficultyColor(card.difficulty)}>
                        {card.difficulty}
                      </Badge>
                      {card.category && (
                        <Badge variant="outline">{card.category}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                        className="flex-1 sm:flex-none min-h-[40px]"
                      >
                        <Edit3 className="w-4 h-4 mr-1 sm:mr-0" />
                        <span className="sm:hidden">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFlashcard(index)}
                        className="flex-1 sm:flex-none min-h-[40px] text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-1 sm:mr-0" />
                        <span className="sm:hidden">Delete</span>
                      </Button>
                    </div>
                  </div>

                  {editingIndex === index ? (
                    /* Edit Mode */
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Question</Label>
                          <Textarea
                            value={card.question}
                            onChange={(e) => updateFlashcard(index, { question: e.target.value })}
                            placeholder="Enter the question"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Answer</Label>
                          <Textarea
                            value={card.answer}
                            onChange={(e) => updateFlashcard(index, { answer: e.target.value })}
                            placeholder="Enter the answer"
                            rows={3}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Difficulty</Label>
                          <Select
                            value={card.difficulty}
                            onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                              updateFlashcard(index, { difficulty: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Input
                            value={card.category || ''}
                            onChange={(e) => updateFlashcard(index, { category: e.target.value })}
                            placeholder="Category (optional)"
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <Button
                            onClick={() => setEditingIndex(null)}
                            className="w-full"
                          >
                            Done Editing
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-2">Question</div>
                        <p className="text-sm">{card.question || 'No question yet'}</p>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-2">Answer</div>
                        <p className="text-sm">{card.answer || 'No answer yet'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardEditor;
