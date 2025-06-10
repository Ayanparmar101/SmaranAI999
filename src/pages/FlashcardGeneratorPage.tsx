import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Flashcard, FlashcardSet } from '@/types/flashcard';
import { flashcardService } from '@/services/flashcardService';
import PDFUpload from '@/components/flashcards/PDFUpload';
import FlashcardViewer from '@/components/flashcards/FlashcardViewer';
import FlashcardEditor from '@/components/flashcards/FlashcardEditor';

import ExamHistoryViewer from '@/components/flashcards/ExamHistoryViewer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, Upload, Edit, Play, Library, Trash2, ExternalLink, Save, BarChart3 } from 'lucide-react';

const FlashcardGeneratorPage: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [savedSets, setSavedSets] = useState<FlashcardSet[]>([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [sourceFileName, setSourceFileName] = useState<string>('');
  const [isLoadingSets, setIsLoadingSets] = useState(false);
  const [currentFlashcardSet, setCurrentFlashcardSet] = useState<{ id: string; title: string } | null>(null);
  // Load saved flashcard sets when component mounts or user changes
  useEffect(() => {
    console.log('[FlashcardGeneratorPage] useEffect triggered - user:', user?.uid, 'isAuthenticated:', isAuthenticated, 'loading:', loading);
    if (!loading && isAuthenticated && user) {
      console.log('[FlashcardGeneratorPage] User is authenticated and loaded, calling loadSavedSets');
      loadSavedSets();
    } else if (!loading && !isAuthenticated) {
      console.log('[FlashcardGeneratorPage] User not authenticated, clearing saved sets');
      setSavedSets([]);
    } else {
      console.log('[FlashcardGeneratorPage] Still loading auth state or user not ready');
    }
  }, [user, isAuthenticated, loading]);

  // Additional useEffect to log when savedSets changes
  useEffect(() => {
    console.log('[FlashcardGeneratorPage] savedSets changed:', savedSets);
  }, [savedSets]);  const loadSavedSets = async () => {
    if (!user) {
      console.log('[FlashcardGeneratorPage] loadSavedSets called but no user available');
      return;
    }
    
    console.log('[FlashcardGeneratorPage] Starting to load saved sets for user:', user.uid);
    setIsLoadingSets(true);
    try {
      const sets = await flashcardService.loadFlashcardSets(user.uid);
      console.log('[FlashcardGeneratorPage] Successfully loaded sets:', sets);
      console.log('[FlashcardGeneratorPage] Number of sets loaded:', sets.length);
      setSavedSets(sets);
      
      if (sets.length === 0) {
        console.log('[FlashcardGeneratorPage] No sets found for user');
      }
    } catch (error) {
      console.error('[FlashcardGeneratorPage] Error loading saved sets:', error);
      console.error('[FlashcardGeneratorPage] Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        name: (error as Error).name
      });
      toast.error('Failed to load saved flashcard sets: ' + (error as Error).message);
    } finally {
      setIsLoadingSets(false);
      console.log('[FlashcardGeneratorPage] Finished loading saved sets');
    }
  };
  const handleFlashcardsGenerated = (newFlashcards: Flashcard[], fileName: string) => {
    setFlashcards(newFlashcards);
    setSourceFileName(fileName);
    setCurrentFlashcardSet(null); // Clear any previously loaded set context
    setActiveTab('preview');
    toast.success(`${newFlashcards.length} flashcards generated from ${fileName}`);
  };

  const handleUpdateFlashcards = (updatedFlashcards: Flashcard[]) => {
    setFlashcards(updatedFlashcards);
  };

  const handleUpdateFlashcard = (updatedFlashcard: Flashcard) => {
    setFlashcards(prev => 
      prev.map(card => 
        card.id === updatedFlashcard.id ? updatedFlashcard : card
      )
    );
  };  const handleSaveSet = async (title: string, description?: string) => {
    console.log('[FlashcardGeneratorPage] handleSaveSet called with:', { title, description });
    try {
      if (!user) {
        console.log('[FlashcardGeneratorPage] No user available for save operation');
        toast.error('Please sign in to save flashcard sets');
        return;
      }

      console.log('[FlashcardGeneratorPage] Saving flashcard set:', { 
        title, 
        description, 
        userId: user.uid, 
        flashcardsCount: flashcards.length,
        sourceFileName 
      });

      const savedSet = await flashcardService.saveFlashcardSet(
        flashcards, 
        title, 
        user.uid, 
        sourceFileName,
        description
      );
      
      console.log('[FlashcardGeneratorPage] Save operation completed, savedSet:', savedSet);
      toast.success('Flashcard set saved successfully!');
      
      // Reload saved sets to show the new one
      console.log('[FlashcardGeneratorPage] Reloading saved sets after save...');
      await loadSavedSets();
      console.log('[FlashcardGeneratorPage] Reload completed, switching to library tab');
      
      // Switch to the library tab to show the saved set
      setActiveTab('library');
      console.log('[FlashcardGeneratorPage] Switched to library tab');
      
    } catch (error: any) {
      console.error('[FlashcardGeneratorPage] Error in handleSaveSet:', error);
      console.error('[FlashcardGeneratorPage] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast.error('Failed to save flashcard set: ' + error.message);
    }
  };
  const handleLoadSet = (set: FlashcardSet) => {
    setFlashcards(set.flashcards);
    setSourceFileName(set.sourceFile || set.title);
    setCurrentFlashcardSet({ id: set.id, title: set.title }); // Store the set context for exam results
    setActiveTab('preview');
    toast.success(`Loaded "${set.title}" with ${set.totalCards} cards`);
  };

  const handleDeleteSet = async (setId: string, setTitle: string) => {
    try {
      await flashcardService.deleteFlashcardSet(setId);
      toast.success(`Deleted "${setTitle}"`);
      await loadSavedSets();
    } catch (error) {
      console.error('Error deleting set:', error);
      toast.error('Failed to delete flashcard set');
    }
  };
  const resetSession = () => {
    setFlashcards([]);
    setSourceFileName('');
    setCurrentFlashcardSet(null); // Clear set context when resetting
    setActiveTab('upload');
  };

  const handleQuickSave = async () => {
    if (!user) {
      toast.error('Please sign in to save flashcard sets');
      return;
    }
    
    if (flashcards.length === 0) {
      toast.error('No flashcards to save');
      return;
    }

    // Generate a default title based on source file and timestamp
    const defaultTitle = sourceFileName 
      ? `${sourceFileName.replace('.pdf', '')} - ${new Date().toLocaleDateString()}`
      : `Flashcard Set - ${new Date().toLocaleDateString()}`;

    try {
      await handleSaveSet(defaultTitle, `Generated from ${sourceFileName || 'uploaded PDF'}`);
    } catch (error) {
      console.error('Quick save failed:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full text-white">
              <Brain className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold mb-4">AI Flashcard Generator</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload any PDF document and let AI create intelligent flashcards to help you study more effectively
            </p>
          </div>

          {/* Quick Actions */}
          {flashcards.length > 0 && (
            <div className="flex justify-center gap-4 mb-6">
              <Button
                variant="outline"
                onClick={() => setActiveTab('preview')}
                className={activeTab === 'preview' ? 'bg-primary text-primary-foreground' : ''}
              >
                <Play className="w-4 h-4 mr-2" />
                Study Cards
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab('edit')}
                className={activeTab === 'edit' ? 'bg-primary text-primary-foreground' : ''}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Cards
              </Button>
              <Button
                variant="outline"
                onClick={resetSession}
              >
                <Upload className="w-4 h-4 mr-2" />
                New Upload
              </Button>
            </div>
          )}

          {/* Main Content */}          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 h-auto p-1">
              <TabsTrigger value="upload" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm min-h-[44px] px-2 sm:px-4">
                <Upload className="w-4 h-4 flex-shrink-0" />
                <span className="hidden xs:inline">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm min-h-[44px] px-2 sm:px-4">
                <Library className="w-4 h-4 flex-shrink-0" />
                <span className="hidden xs:inline">My Sets</span>
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                disabled={flashcards.length === 0}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm min-h-[44px] px-2 sm:px-4 col-span-2 sm:col-span-1"
              >
                <BookOpen className="w-4 h-4 flex-shrink-0" />
                <span className="hidden xs:inline">Study</span>
              </TabsTrigger>
              <TabsTrigger
                value="edit"
                disabled={flashcards.length === 0}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm min-h-[44px] px-2 sm:px-4"
              >
                <Edit className="w-4 h-4 flex-shrink-0" />
                <span className="hidden xs:inline">Edit</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm min-h-[44px] px-2 sm:px-4">
                <BarChart3 className="w-4 h-4 flex-shrink-0" />
                <span className="hidden xs:inline">History</span>
              </TabsTrigger>
            </TabsList>            <TabsContent value="upload" className="space-y-6">
              <PDFUpload onFlashcardsGenerated={handleFlashcardsGenerated} />
              

              
              {/* Features Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <Card className="p-6 text-center dark:bg-card dark:border-border">
                  <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 dark:border-blue-700 rounded-full flex items-center justify-center border">
                    <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold mb-2 dark:text-foreground">Smart PDF Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI extracts key concepts and creates targeted study questions
                  </p>
                </Card>

                <Card className="p-6 text-center dark:bg-card dark:border-border">
                  <div className="w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 dark:border-green-700 rounded-full flex items-center justify-center border">
                    <Brain className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold mb-2 dark:text-foreground">Adaptive Difficulty</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose from easy, medium, or hard difficulty levels for optimal learning
                  </p>
                </Card>

                <Card className="p-6 text-center dark:bg-card dark:border-border">
                  <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/30 dark:border-purple-700 rounded-full flex items-center justify-center border">
                    <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold mb-2 dark:text-foreground">Interactive Study</h3>
                  <p className="text-sm text-muted-foreground">
                    Study with interactive flashcards and track your progress over time
                  </p>
                </Card>
              </div>            </TabsContent>

            <TabsContent value="library" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">My Flashcard Sets</h2>
                <Button onClick={loadSavedSets} disabled={isLoadingSets}>
                  {isLoadingSets ? 'Loading...' : 'Refresh'}
                </Button>
              </div>

              {isLoadingSets ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : savedSets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedSets.map((set) => (
                    <Card key={set.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{set.title}</h3>
                          {set.description && (
                            <p className="text-sm text-muted-foreground mb-2">{set.description}</p>
                          )}
                          <div className="text-sm text-muted-foreground">
                            <p>{set.totalCards} cards</p>
                            <p>Created: {new Date(set.createdAt).toLocaleDateString()}</p>
                            {set.sourceFile && (
                              <p className="truncate">From: {set.sourceFile}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSet(set.id, set.title)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleLoadSet(set)}
                          className="flex-1"
                          size="sm"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Study
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (                <Card className="p-8 text-center">
                  <Library className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Saved Sets</h3>
                  <p className="text-muted-foreground mb-4">
                    {flashcards.length > 0 
                      ? "You have generated flashcards! Save them to see them here."
                      : "Create your first flashcard set by uploading a PDF!"
                    }
                  </p>
                  {flashcards.length > 0 ? (
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button onClick={handleQuickSave} className="w-full sm:w-auto min-h-[48px]">
                        <Save className="w-4 h-4 mr-2" />
                        Save Current Flashcards
                      </Button>
                      <Button onClick={() => setActiveTab('edit')} variant="outline" className="w-full sm:w-auto min-h-[48px]">
                        <Edit className="w-4 h-4 mr-2" />
                        Save with Custom Title
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setActiveTab('upload')} className="w-full sm:w-auto min-h-[48px]">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload PDF
                    </Button>
                  )}
                </Card>
              )}
            </TabsContent>            <TabsContent value="preview" className="space-y-6">
              {flashcards.length > 0 ? (
                <div>
                  {sourceFileName && (
                    <div className="text-center mb-6">
                      <p className="text-muted-foreground">
                        Flashcards generated from: <span className="font-medium">{sourceFileName}</span>
                      </p>                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-700 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                          💡 <strong>Don't forget to save your flashcards!</strong> Save them now to access later in "My Sets".
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                          <Button
                            onClick={handleQuickSave}
                            size="sm"
                            className="w-full sm:w-auto min-h-[44px] bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                          >
                            Quick Save
                          </Button>
                          <Button
                            onClick={() => setActiveTab('edit')}
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto min-h-[44px]"
                          >
                            Custom Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}                  <FlashcardViewer 
                    flashcards={flashcards}
                    onUpdateFlashcard={handleUpdateFlashcard}
                    flashcardSetId={currentFlashcardSet?.id}
                    flashcardSetTitle={currentFlashcardSet?.title}
                  />
                </div>
              ) : (
                <Card className="p-8 text-center">                  <p className="text-muted-foreground">
                    No flashcards available. Upload a PDF or load a saved set to get started!
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="edit" className="space-y-6">
              {flashcards.length > 0 ? (
                <FlashcardEditor
                  flashcards={flashcards}
                  onUpdateFlashcards={handleUpdateFlashcards}
                  onSaveSet={handleSaveSet}
                />
              ) : (                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No flashcards to edit. Upload a PDF or load a saved set to get started!
                  </p>
                </Card>
              )}            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <ExamHistoryViewer 
                flashcardSetId={currentFlashcardSet?.id}
                flashcardSetTitle={currentFlashcardSet?.title}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default FlashcardGeneratorPage;
