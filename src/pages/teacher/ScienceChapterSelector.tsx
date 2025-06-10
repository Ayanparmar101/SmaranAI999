import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const scienceBooks = [
  {
    id: "ncert-science",
    name: "NCERT Science Class 8",
    class: "8",
    chapters: [
  { "id": "ch01", "name": "Chapter 1. Matter in Our Surroundings" },
  { "id": "ch02", "name": "Chapter 2. Is Matter Around Us Pure?" },
  { "id": "ch03", "name": "Chapter 3. Atoms and Molecules" },
  { "id": "ch04", "name": "Chapter 4. Structure of the Atom" },
  { "id": "ch05", "name": "Chapter 5. The Fundamental Unit of Life" },
  { "id": "ch06", "name": "Chapter 6. Tissues" },
  { "id": "ch07", "name": "Chapter 7. Motion" },
  { "id": "ch08", "name": "Chapter 8. Force and Laws of Motion" },
  { "id": "ch09", "name": "Chapter 9. Gravitation" },
  { "id": "ch10", "name": "Chapter 10. Work and Energy" },
  { "id": "ch11", "name": "Chapter 11. Sound" },
  { "id": "ch12", "name": "Chapter 12. Improvement in Food Resources" },
]
  }
];

export const classOptions = [{ value: "8", label: "Class 8" }];

interface ScienceChapterSelectorProps {
  selectedClass: string;
  setSelectedClass: (value: string) => void;
  selectedBook: string;
  setSelectedBook: (value: string) => void;
  selectedChapter: string;
  setSelectedChapter: (value: string) => void;
}

const ScienceChapterSelector: React.FC<ScienceChapterSelectorProps> = ({
  selectedClass,
  setSelectedClass,
  selectedBook,
  setSelectedBook,
  selectedChapter,
  setSelectedChapter
}) => {
  const availableBooks = scienceBooks.filter(book => book.class === selectedClass);

  useEffect(() => {
    console.log('[ScienceChapterSelector] Class changed or availableBooks updated.');
    const currentBookIsValidForClass = availableBooks.some(book => book.id === selectedBook);
    if (!currentBookIsValidForClass && availableBooks.length > 0) {
      console.log('[ScienceChapterSelector] Current book not valid for new class. Resetting book and chapter.');
      setSelectedBook(availableBooks[0].id);
      setSelectedChapter(""); 
    } else if (!currentBookIsValidForClass && availableBooks.length === 0) {
      console.log('[ScienceChapterSelector] No books for new class. Resetting book and chapter.');
      setSelectedBook("");
      setSelectedChapter("");
    }
  }, [selectedClass, availableBooks, selectedBook, setSelectedBook, setSelectedChapter]);

  useEffect(() => {
    console.log('[ScienceChapterSelector] Book changed. Verifying chapter.');
    if (selectedBook) {
      const currentBookDetails = availableBooks.find(b => b.id === selectedBook);
      const chapterIsValidForBook = currentBookDetails?.chapters.some(chap => chap.id === selectedChapter);
      if (selectedChapter && !chapterIsValidForBook) {
        console.log('[ScienceChapterSelector] Current chapter not valid for new book. Resetting chapter.');
        setSelectedChapter("");
      }
    } else {
      setSelectedChapter("");
    }
  }, [selectedBook, selectedChapter, availableBooks, setSelectedChapter]); 

  return (
    <div className="space-y-4">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Chapter Selection</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="class-select" className="text-sm sm:text-base font-medium">Select Class</Label>
          <Select value={selectedClass} onValueChange={(value) => {
            console.log('[ScienceChapterSelector] Class dropdown changed to:', value);
            setSelectedClass(value);
          }}>
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
          <Select value={selectedBook} onValueChange={(value) => {
            console.log('[ScienceChapterSelector] Book dropdown changed to:', value);
            setSelectedBook(value);
          }}>
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
            onValueChange={(value) => {
              console.log('[ScienceChapterSelector] Chapter dropdown changed to:', value);
              setSelectedChapter(value);
            }}
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

export default ScienceChapterSelector;
