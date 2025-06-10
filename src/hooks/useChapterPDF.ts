import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PDFService } from '@/services/pdfService';
import { storage } from '@/integrations/firebase/client';
import { ref, getDownloadURL } from 'firebase/storage';
import { books } from '@/pages/teacher/ChapterSelector';
import { optimizedFirebaseService } from '@/services/optimizedFirebaseService';
import { requestCache } from '@/utils/requestCache';

// Global cache to prevent duplicate success messages for the same PDF
const loadedPDFCache = new Set<string>();

// PDF metadata cache for faster loading
const pdfMetadataCache = new Map<string, {
  url: string;
  size: number;
  lastModified: number;
  textContent?: string;
}>();

// OCR operation tracking to prevent concurrent operations
const ocrOperations = new Map<string, Promise<string>>();

// Define interface for chapter with optional URL
interface Chapter {
  id: string;
  name: string;
  url?: string;
}

export function useChapterPDF(selectedBook: string, selectedChapter: string, subject?: string, selectedClass?: string) {
  const [chapterContent, setChapterContent] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 [useChapterPDF] useEffect triggered');
    console.log('📖 [useChapterPDF] selectedBook:', selectedBook);
    console.log('📝 [useChapterPDF] selectedChapter:', selectedChapter);
    console.log('📚 [useChapterPDF] subject:', subject);
    console.log('🎓 [useChapterPDF] selectedClass:', selectedClass);

    const loadChapterContent = async () => {
      console.log('🚀 [useChapterPDF] loadChapterContent called, resetting state');
      setChapterContent("");
      setPdfUrl(null);

      // Clear cache for previous chapter to allow fresh messages
      const prevCacheKey = `${subject}-${selectedClass}-${selectedBook}-${selectedChapter}`;
      loadedPDFCache.delete(prevCacheKey);

      if (!selectedChapter || !selectedBook) {
        console.log('❌ [useChapterPDF] No selected chapter or book, setting default message');
        setChapterContent("Please select a chapter to load its content.");
        return;
      }

      const chapterId = `${selectedBook}-${selectedChapter}`;
      console.log('[useChapterPDF] chapterId:', chapterId);

      const bookData = books.find(b => b.id === selectedBook);
      const chapterData = bookData?.chapters.find(c => c.id === selectedChapter) as Chapter | undefined;
      console.log('[useChapterPDF] chapterData:', chapterData);

      // Handle explicit URL first (for external PDFs)
      if (chapterData && chapterData.url) {
        console.log('[useChapterPDF] Explicit URL found:', chapterData.url);
        setPdfUrl(chapterData.url);
        toast.info(`Attempting to load PDF from: ${chapterData.url}`);
        try {
          const response = await fetch(chapterData.url);
          if (!response.ok) {
            let errorText = response.statusText || `HTTP Error ${response.status}`;
            if (response.status === 0) { 
              errorText = "Network error or CORS issue accessing the PDF URL. Check browser console for details.";
            }
            throw new Error(`Failed to fetch PDF from external URL: ${errorText} (Status: ${response.status})`);
          }
          const blob = await response.blob();
          const file = new File([blob], `${chapterData.name || chapterId}.pdf`, { type: 'application/pdf' });
          const content = await PDFService.extractTextFromPDF(file);
          setChapterContent(content);
          toast.success(`Successfully loaded PDF from URL.`);
          return; 
        } catch (urlError: any) {
          console.error('Error loading chapter content from external URL:', urlError);
          toast.error(`Failed to load PDF from URL. See console for CORS/network details.`);
          setChapterContent(`Error loading chapter content from the provided URL. Details: ${urlError.message}`);
          setPdfUrl(chapterData.url); // Keep attempted URL for context if viewer can handle errors
          return; 
        }
      }

      // Load from Firebase Storage using new syllabus structure
      console.log('🔥 [useChapterPDF] Loading from Firebase Storage syllabus structure.');
      try {
        const standard = bookData?.class || selectedClass || '8';
        const mappedSubject = bookData?.subject || subject || 'english';

        console.log('🎯 [useChapterPDF] Mapped subject:', mappedSubject, 'Standard:', standard);
        console.log('📁 [useChapterPDF] Book data:', bookData);

        // Create optimized cache key for this PDF (now that variables are defined)
        const pdfCacheKey = `pdf:${mappedSubject}:${standard}:${selectedBook}:${selectedChapter}`;

        // Check if we have cached metadata first
        const cachedMetadata = pdfMetadataCache.get(pdfCacheKey);
        if (cachedMetadata) {
          console.log('📋 [useChapterPDF] Using cached PDF metadata');
          setPdfUrl(cachedMetadata.url);
          if (cachedMetadata.textContent) {
            setChapterContent(cachedMetadata.textContent);
            return;
          }
        }
        
        const firebasePath = PDFService.constructSyllabusPath(mappedSubject, standard, selectedBook, selectedChapter);
        console.log('📍 [useChapterPDF] Constructed Firebase path:', firebasePath);
        
        console.log('⏳ [useChapterPDF] About to call PDFService.getPDFFromSyllabus...');
        let pdfBlob: Blob | null = null;
        try {
            pdfBlob = await PDFService.getPDFFromSyllabus(mappedSubject, standard, selectedBook, selectedChapter);
            console.log('✅ [useChapterPDF] PDFService.getPDFFromSyllabus call completed.');
            console.log('📦 [useChapterPDF] Raw pdfBlob received:', pdfBlob);
            if (pdfBlob instanceof Blob) {
                console.log(`📦 [useChapterPDF] pdfBlob is a Blob. Size: ${pdfBlob.size}, Type: ${pdfBlob.type}`);
            } else if (pdfBlob === null) {
                console.log('📦 [useChapterPDF] pdfBlob is null.');
            } else {
                console.log('⚠️ [useChapterPDF] pdfBlob is NOT a Blob and not null. Value:', pdfBlob);
            }
        } catch (serviceError: any) {
            console.error('❌ [useChapterPDF] Error DURING PDFService.getPDFFromSyllabus call:', serviceError);
            toast.error(`Error calling PDF service: ${serviceError.message}. Check console.`);
            setChapterContent(`Failed to retrieve PDF data due to a service error: ${serviceError.message}. Please check the console for more details.`);
            setPdfUrl(null);
            return; 
        }
        
        if (pdfBlob) { 
          console.log('👍 [useChapterPDF] PDF blob is truthy, proceeding to process.');
          
          // Get the Firebase download URL for PDF viewer (common for both paths)
          const fileRef = ref(storage, firebasePath);
          let publicUrl: string;

          try {
            publicUrl = await getDownloadURL(fileRef);
            console.log('🔗 [useChapterPDF] Got Firebase download URL:', publicUrl);
            setPdfUrl(publicUrl);
          } catch (urlError: any) {
            console.error('❌ Error getting Firebase download URL:', urlError);
            toast.error('Failed to get PDF download URL for viewing.');
            return;
          }

          // Create cache key for this specific PDF
          const cacheKey = `${mappedSubject}-${standard}-${selectedBook}-${selectedChapter}`;

          // Check if this is our marker blob indicating PDF exists
          if (pdfBlob.size === 10 && pdfBlob.type === 'text/plain') {
            console.log('🎯 [useChapterPDF] Detected marker blob - PDF exists, attempting OCR extraction');

            // Define ocrKey outside try block for proper scope
            const ocrKey = `${mappedSubject}:${standard}:${selectedBook}:${selectedChapter}`;

            try {
              // Check if OCR operation is already in progress for this PDF
              if (ocrOperations.has(ocrKey)) {
                console.log('🔄 [useChapterPDF] OCR operation already in progress, waiting for completion...');
                setChapterContent("OCR extraction already in progress... Please wait.");

                try {
                  const extractedText = await ocrOperations.get(ocrKey)!;
                  if (extractedText && extractedText.length > 100 &&
                      !extractedText.includes('Error extracting text')) {
                    setChapterContent(extractedText);
                    toast.success('PDF text extracted successfully using OCR.');
                  } else {
                    throw new Error('OCR operation failed or yielded minimal content');
                  }
                  return;
                } catch (waitError) {
                  console.error('❌ [useChapterPDF] Error waiting for OCR operation:', waitError);
                  // Continue with new OCR attempt
                }
              }

              // Start new OCR operation
              console.log('📖 [useChapterPDF] Starting OCR text extraction from Firebase PDF URL...');
              setChapterContent("Extracting text from PDF using OCR... This may take a moment.");

              // Create OCR operation promise and store it
              const ocrPromise = PDFService.extractTextFromFirebasePDFUrl(
                publicUrl,
                selectedChapter
              );

              ocrOperations.set(ocrKey, ocrPromise);

              const extractedText = await ocrPromise;

              if (extractedText && extractedText.length > 100) {
                console.log('✅ [useChapterPDF] Content extraction completed, length:', extractedText.length);
                setChapterContent(extractedText);

                // Cache the extracted text
                pdfMetadataCache.set(pdfCacheKey, {
                  url: publicUrl,
                  size: pdfBlob.size,
                  lastModified: Date.now(),
                  textContent: extractedText
                });

                // Check if this is a CORS fallback message or actual extracted text
                if (extractedText.includes('CORS policy') || extractedText.includes('browser security restrictions')) {
                  toast.info('PDF loaded for viewing. I can help with questions based on curriculum knowledge.');
                } else {
                  toast.success('PDF text extracted successfully.');
                }
              } else {
                console.log('⚠️ [useChapterPDF] Content extraction yielded minimal content');
                const fallbackText = "PDF found and ready for viewing. I can help answer questions about this chapter based on my knowledge of the NCERT curriculum.";
                setChapterContent(fallbackText);

                // Cache the fallback
                pdfMetadataCache.set(pdfCacheKey, {
                  url: publicUrl,
                  size: pdfBlob.size,
                  lastModified: Date.now(),
                  textContent: fallbackText
                });

                toast.info('PDF loaded for viewing. I can help with curriculum-based questions.');
              }
            } catch (ocrError) {
              console.error('❌ [useChapterPDF] OCR extraction error:', ocrError);
              const errorText = "PDF found and ready for viewing. Text extraction failed due to technical limitations.";
              setChapterContent(errorText);

              // Cache the error state
              pdfMetadataCache.set(pdfCacheKey, {
                url: publicUrl,
                size: pdfBlob.size,
                lastModified: Date.now(),
                textContent: errorText
              });

              toast.warning('PDF loaded for viewing. Text extraction encountered issues.');
            } finally {
              // Clean up OCR operation tracking
              ocrOperations.delete(ocrKey);
            }

            // Only show success message if not already shown for this PDF
            if (!loadedPDFCache.has(cacheKey)) {
              loadedPDFCache.add(cacheKey);
            }
          } else {
            console.log('📄 [useChapterPDF] Regular PDF blob, extracting text...');
            const file = new File([pdfBlob], `${chapterId}.pdf`, { type: 'application/pdf' });
            const content = await PDFService.extractTextFromPDF(file);
            setChapterContent(content);

            // Cache the metadata with extracted text
            pdfMetadataCache.set(pdfCacheKey, {
              url: publicUrl,
              size: pdfBlob.size,
              lastModified: Date.now(),
              textContent: content
            });

            // Only show success message if not already shown for this PDF
            if (!loadedPDFCache.has(cacheKey)) {
              toast.success('PDF loaded and text extracted successfully.');
              loadedPDFCache.add(cacheKey);
            }
          }
        } else {
          console.log('📭 [useChapterPDF] PDF blob is falsy (likely null). PDF not found or error in service.');
          setChapterContent(`No PDF available for this chapter in Firebase Storage.

Expected location: ${firebasePath}

This could mean:
1. The PDF file has not been uploaded to Firebase Storage yet
2. The file path or name is different than expected  
3. Firebase Storage rules are preventing access (though unlikely with current rules)
4. There was an issue fetching the file data from the service.

Please check the browser console for more detailed error information from the PDF service.`);
          setPdfUrl(null);
          toast.error('PDF not found or error in PDF service. Check console for details.');
        }
      } catch (error: any) {
        console.error('❌ [useChapterPDF] Outer catch: Error loading chapter content from Firebase:', error);
        toast.error('Failed to load chapter content from Firebase Storage.');
        setChapterContent("Error loading chapter content. Please try again.");
        setPdfUrl(null);
      }
    };

    loadChapterContent();
  }, [selectedChapter, selectedBook, subject, selectedClass]);

  return { chapterContent, pdfUrl };
}
