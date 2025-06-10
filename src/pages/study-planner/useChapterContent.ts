
import { useState, useEffect, useCallback } from 'react';
import { PDFService } from '@/services/pdfService';
import { storage } from '@/integrations/firebase/client'; 
import { ref, getDownloadURL } from 'firebase/storage'; 
import { toast } from 'sonner';
import { books } from '@/pages/teacher/ChapterSelector'; // Import books data for mapping

export const useChapterContent = (
  selectedChapter: string, 
  selectedBook: string,
  setIsPdfProcessing?: (isProcessing: boolean) => void
) => {
  const [chapterContent, setChapterContent] = useState<string>("PDF preview will appear here."); 
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfUrlCache, setPdfUrlCache] = useState<Record<string, string | null>>({});

  const loadPdfUrl = useCallback(async () => {
    if (!selectedChapter || !selectedBook) {
      setChapterContent("Please select a chapter to view its PDF.");
      setPdfUrl(null);
      if (setIsPdfProcessing) setIsPdfProcessing(false);
      return;
    }

    const chapterId = `${selectedBook}-${selectedChapter}`;
    console.log('[useChapterContent] useCallback: Loading PDF URL for chapterId:', chapterId);

    if (pdfUrlCache.hasOwnProperty(chapterId)) {
      console.log('[useChapterContent] Found PDF URL in local cache (pdfUrlCache).');
      setPdfUrl(pdfUrlCache[chapterId]);
      setChapterContent(pdfUrlCache[chapterId] ? "PDF preview loaded." : "PDF not found or URL couldn't be retrieved.");
      if (setIsPdfProcessing) setIsPdfProcessing(false);
      return;
    }

    try {
      if (setIsPdfProcessing) setIsPdfProcessing(true);
      setChapterContent("Loading PDF..."); 
      setPdfUrl(null);    
      
      // Get subject and standard from book data
      const bookData = books.find(b => b.id === selectedBook);
      const standard = bookData?.class || '8';
      const subject = bookData?.subject || 'english';
      
      console.log('[useChapterContent] Mapped subject:', subject, 'Standard:', standard);
      
      // Get the correct Firebase path for the PDF
      const firebasePath = PDFService.constructSyllabusPath(subject, standard, selectedBook, selectedChapter);
      console.log('[useChapterContent] Firebase path:', firebasePath);
      
      const fileRef = ref(storage, firebasePath);
      let publicUrl: string | null = null;

      try {
        publicUrl = await getDownloadURL(fileRef);
        console.log('[useChapterContent] Firebase download URL obtained:', publicUrl);
        setPdfUrl(publicUrl);
        setChapterContent("PDF preview loaded successfully.");
        setPdfUrlCache(prev => ({ ...prev, [chapterId]: publicUrl }));
      } catch (urlError: any) {
        console.error('[useChapterContent] Error getting Firebase download URL:', urlError);
        if (urlError.code === 'storage/object-not-found') {
          toast.error('PDF not found for this chapter in Firebase Storage.');
          setChapterContent("PDF not found for this chapter. Please ensure it's uploaded to the correct Firebase Storage location.");
          setPdfUrl(null);
          setPdfUrlCache(prev => ({ ...prev, [chapterId]: null }));
        } else {
          toast.error('Could not get PDF URL for viewing.');
          setChapterContent("Could not load PDF for viewing. Please try again.");
          setPdfUrl(null);
          setPdfUrlCache(prev => ({ ...prev, [chapterId]: null }));
        }
      }
    } catch (error) {
      console.error('Error in loadPdfUrl:', error);
      toast.error('Failed to load PDF information.');
      setChapterContent("Error loading PDF information. Please try again.");
      setPdfUrl(null);
    } finally {
      if (setIsPdfProcessing) setIsPdfProcessing(false);
    }
  }, [selectedChapter, selectedBook, setIsPdfProcessing, pdfUrlCache]); 

  useEffect(() => {
    console.log('[useChapterContent] useEffect triggered due to selectedChapter/Book change.');
    loadPdfUrl();
  }, [loadPdfUrl]); 

  // handleFileUpload function is removed.

  return { chapterContent, pdfUrl }; // Removed handleFileUpload from returned object
};
