import React, { useEffect, useMemo, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { books } from './ChapterSelector'; // Use the main books array

export const classOptions = [{ value: "8", label: "Class 8" }];

interface SocialScienceChapterSelectorProps {
  selectedClass: string;
  setSelectedClass: (value: string) => void;
  selectedBook: string;
  setSelectedBook: (value: string) => void;
  selectedChapter: string;
  setSelectedChapter: (value: string) => void;
}

const SocialScienceChapterSelector: React.FC<SocialScienceChapterSelectorProps> = ({
  selectedClass,
  setSelectedClass,
  selectedBook,
  setSelectedBook,
  selectedChapter,
  setSelectedChapter
}) => {
  // Memoize availableBooks to prevent unnecessary re-renders
  const availableBooks = useMemo(() => {
    return books.filter(book => book.class === selectedClass && book.subject === 'socialscience');
  }, [selectedClass]);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleClassChange = useCallback((value: string) => {
    console.log('[SocialScienceChapterSelector] Class dropdown changed to:', value);
    setSelectedClass(value);
  }, [setSelectedClass]);

  const handleBookChange = useCallback((value: string) => {
    console.log('[SocialScienceChapterSelector] Book dropdown changed to:', value);
    setSelectedBook(value);
  }, [setSelectedBook]);

  const handleChapterChange = useCallback((value: string) => {
    console.log('[SocialScienceChapterSelector] Chapter dropdown changed to:', value);
    setSelectedChapter(value);
  }, [setSelectedChapter]);

  // Optimize class change effect - only run when class actually changes
  useEffect(() => {
    const currentBookIsValidForClass = availableBooks.some(book => book.id === selectedBook);
    if (!currentBookIsValidForClass && availableBooks.length > 0) {
      console.log('[SocialScienceChapterSelector] Current book not valid for new class. Resetting book and chapter.');
      setSelectedBook(availableBooks[0].id);
      setSelectedChapter("");
    } else if (!currentBookIsValidForClass && availableBooks.length === 0) {
      console.log('[SocialScienceChapterSelector] No books for new class. Resetting book and chapter.');
      setSelectedBook("");
      setSelectedChapter("");
    }
  }, [selectedClass]); // Only depend on selectedClass, not availableBooks

  // Optimize book change effect - only run when book actually changes
  useEffect(() => {
    if (selectedBook) {
      const currentBookDetails = availableBooks.find(b => b.id === selectedBook);
      const chapterIsValidForBook = currentBookDetails?.chapters.some(chap => chap.id === selectedChapter);
      if (selectedChapter && !chapterIsValidForBook) {
        console.log('[SocialScienceChapterSelector] Current chapter not valid for new book. Resetting chapter.');
        setSelectedChapter("");
      }
    } else {
      setSelectedChapter("");
    }
  }, [selectedBook]); // Only depend on selectedBook, not availableBooks or selectedChapter

  return (
    <div className="space-y-4">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Chapter Selection</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="class-select" className="text-sm sm:text-base font-medium">Select Class</Label>
          <Select value={selectedClass} onValueChange={handleClassChange}>
            <SelectTrigger id="class-select" className="neo-input min-h-[48px]">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent className="border-3 border-border">
              {classOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="book-select" className="text-sm sm:text-base font-medium">Select Book</Label>
          <Select value={selectedBook} onValueChange={handleBookChange}>
            <SelectTrigger id="book-select" className="neo-input min-h-[48px]" disabled={!selectedClass || availableBooks.length === 0}>
              <SelectValue placeholder="Select Book" />
            </SelectTrigger>
            <SelectContent className="border-3 border-border">
              {availableBooks.map(book => (
                <SelectItem key={book.id} value={book.id}>
                  {book.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <Label htmlFor="chapter-select" className="text-sm sm:text-base font-medium">Select Chapter</Label>
          <Select
            value={selectedChapter}
            onValueChange={handleChapterChange}
            disabled={!selectedBook}
          >
            <SelectTrigger id="chapter-select" className="neo-input min-h-[48px]">
              <SelectValue placeholder="Select Chapter" />
            </SelectTrigger>
            <SelectContent className="border-3 border-border">
              {availableBooks.find(b => b.id === selectedBook)?.chapters.map(chapter => (
                <SelectItem key={chapter.id} value={chapter.id}>
                  {chapter.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SocialScienceChapterSelector;
