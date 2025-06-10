import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const books = [
  // Class 8 English Books - Maps to syllabus/standard8/english/honeydew/ and syllabus/standard8/english/it_so_happened/
  {
    id: "ncert-honeydew",
    name: "Honeydew",
    class: "8",
    subject: "english",
    bookFolder: "honeydew",
    chapters: [
      { id: "ch01", name: "Chapter 1. The Best Christmas Present in the World" },
      { id: "ch02", name: "Chapter 2. The Tsunami" },
      { id: "ch03", name: "Chapter 3. Glimpses of the Past" },
      { id: "ch04", name: "Chapter 4. Bepin Choudhury's Lapse of Memory" },
      { id: "ch05", name: "Chapter 5. The Summit Within" },
      { id: "ch06", name: "Chapter 6. This is Jody's Faun" },
      { id: "ch07", name: "Chapter 7. A Visit to Cambridge" },
      { id: "ch08", name: "Chapter 8. A Short Monsoon Diary" }
    ]
  },
  {
    id: "ncert-it-so-happened",
    name: "It So Happened",
    class: "8",
    subject: "english",
    bookFolder: "it_so_happened",
    chapters: [
      { id: "ch01", name: "Chapter 1. How the Camel got his hump" },
      { id: "ch02", name: "Chapter 2. Children at work" },
      { id: "ch03", name: "Chapter 3. The Selfish Giant" },
      { id: "ch04", name: "Chapter 4. The Treasure within" },
      { id: "ch05", name: "Chapter 5. Princess September" },
      { id: "ch06", name: "Chapter 6. The Fight" },
      { id: "ch07", name: "Chapter 7. Jalebis" },
      { id: "ch08", name: "Chapter 8. Ancient Education System of India" }
    ]
  },
  // Class 8 Gujarati - Maps to syllabus/standard8/gujarati/
  {
    id: "ncert-gujarati",
    name: "Gujarati Class 8",
    class: "8",
    subject: "gujarati",
    chapters: [
      { id: "ch01", name: "Chapter 1. બજારમાં" },
      { id: "ch02", name: "Chapter 2. એક જ દે ચિનગારી" },
      { id: "ch03", name: "Chapter 3. મારું સ્વપ્ન" },
      { id: "ch04", name: "Chapter 4. બાળપણની વાતો" },
      { id: "ch05", name: "Chapter 5. મારા પિતાજી" },
      { id: "ch06", name: "Chapter 6. પ્રેમ અને દયા" },
      { id: "ch07", name: "Chapter 7. જ્ઞાનની શોધ" },
      { id: "ch08", name: "Chapter 8. સાચું મિત્રતા" },
      { id: "ch09", name: "Chapter 9. કિસાન અને ખેતી" },
      { id: "ch10", name: "Chapter 10. પ્રકૃતિનો પ્રેમ" },
      { id: "ch11", name: "Chapter 11. ગુજરાતના તહેવારો" },
      { id: "ch12", name: "Chapter 12. મહાપુરુષોની જીવનીઓ" },
      { id: "ch13", name: "Chapter 13. વિજ્ઞાન અને ટેકનોલોજી" },
      { id: "ch14", name: "Chapter 14. પર્યાવરણ સંરક્ષણ" },
      { id: "ch15", name: "Chapter 15. ગુજરાતની સંસ્કૃતિ" },
      { id: "ch16", name: "Chapter 16. આરોગ્ય અને વ્યાયામ" },
      { id: "ch17", name: "Chapter 17. શિક્ષણનું મહત્વ" },
      { id: "ch18", name: "Chapter 18. સમાજસેવા" },
      { id: "ch19", name: "Chapter 19. સ્વતંત્રતા સંગ્રામ" },
      { id: "ch20", name: "Chapter 20. ભારતની એકતા" },
      { id: "ch21", name: "Chapter 21. બાળકોના અધિકારો" },
      { id: "ch22", name: "Chapter 22. ભવિષ્યની આશા" }
    ]
  },
  // Class 8 Hindi - Maps to syllabus/standard8/hindi/
  {
    id: "ncert-hindi",
    name: "NCERT Hindi (Vasant) Class 8",
    class: "8",
    subject: "hindi",
    bookFolder: "hindi",
    chapters: [
      { id: "ch01", name: "Chapter 1. लाख की चूड़ियाँ (कहानी)" },
      { id: "ch02", name: "Chapter 2. बस की यात्रा (व्यंग्य)" },
      { id: "ch03", name: "Chapter 3. दीवानों की हस्ती (कविता)" },
      { id: "ch04", name: "Chapter 4. भगवान के डाकिए (कविता)" },
      { id: "ch05", name: "Chapter 4.1. कदम मिलाकर चलना होगा (कविता) [केवल पढ़ने के लिए]" },
      { id: "ch06", name: "Chapter 5. क्या निराश हुआ जाए (निबंध)" },
      { id: "ch07", name: "Chapter 6. यह सबसे कठिन समय नहीं (कविता)" },
      { id: "ch08", name: "Chapter 6.1. पहाड़ से ऊँचा आदमी (जीवनी) [केवल पढ़ने के लिए]" },
      { id: "ch09", name: "Chapter 7. कबीर की साखियाँ" },
      { id: "ch10", name: "Chapter 8. सुदामा चरित (कविता)" },
      { id: "ch11", name: "Chapter 9. जहाँ पहिया है (रिपोर्ताज)" },
      { id: "ch12", name: "Chapter 10. पिता के बाद (कविता) [केवल पढ़ने के लिए]" },
      { id: "ch13", name: "Chapter 11. अकबरी लोटा (कहानी)" },
      { id: "ch14", name: "Chapter 12. सूरदास के पद (कविता)" },
      { id: "ch15", name: "Chapter 12.1. हम पृथ्वी की संतान (आलेख) [केवल पढ़ने के लिए]" },
      { id: "ch16", name: "Chapter 13. बाज और साँप (कहानी)" }
    ]
  },
  // Class 8 Mathematics - Maps to syllabus/standard8/mathematics/
  {
    id: "ncert-mathematics",
    name: "NCERT Mathematics Class 8",
    class: "8",
    subject: "mathematics",
    bookFolder: "mathematics",
    chapters: [
      { id: "ch01", name: "Chapter 1. Rational Numbers" },
      { id: "ch02", name: "Chapter 2. Linear Equations in One Variable" },
      { id: "ch03", name: "Chapter 3. Understanding Quadrilaterals" },
      { id: "ch04", name: "Chapter 4. Data Handling" },
      { id: "ch05", name: "Chapter 5. Squares and Square Roots" },
      { id: "ch06", name: "Chapter 6. Cubes and Cube Roots" },
      { id: "ch07", name: "Chapter 7. Comparing Quantities" },
      { id: "ch08", name: "Chapter 8. Algebraic Expressions and Identities" },
      { id: "ch09", name: "Chapter 9. Mensuration" },
      { id: "ch10", name: "Chapter 10. Exponents and Powers" },
      { id: "ch11", name: "Chapter 11. Direct and Inverse Proportions" },
      { id: "ch12", name: "Chapter 12. Factorisation" },
      { id: "ch13", name: "Chapter 13. Introduction to Graphs" }
    ]
  },
  // Class 8 Science - Maps to syllabus/standard8/science/
  {
    id: "ncert-science",
    name: "NCERT Science Class 8",
    class: "8",
    subject: "science",
    bookFolder: "science",
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
  { "id": "answers", "name": "Answers" }
]

  },
  // Class 8 Social Science - Maps to syllabus/standard8/socialscience/
  {
    id: "ncert-socialscience",
    name: "Social Science",
    class: "8",
    subject: "socialscience",
    chapters: [
      { id: "ch01", name: "Chapter 1. How, When and Where" },
      { id: "ch02", name: "Chapter 2. From Trade to Territory" },
      { id: "ch03", name: "Chapter 3. Ruling the Countryside" },
      { id: "ch04", name: "Chapter 4. Tribals, Dikus and the Vision of a Golden Age" },
      { id: "ch05", name: "Chapter 5. When People Rebel" },
      { id: "ch06", name: "Chapter 6. Weavers, Iron Smelters and Factory Owners" },
      { id: "ch07", name: "Chapter 7. Civilising the \"Native\", Educating the Nation" },
      { id: "ch08", name: "Chapter 8. Women, Caste and Reform" },
      { id: "ch09", name: "Chapter 9. The Making of the National Movement: 1870s–1947" },
      { id: "ch10", name: "Chapter 10. India After Independence" },
      { id: "ch11", name: "Chapter 11. Resources" },
      { id: "ch12", name: "Chapter 12. Land, Soil, Water, Natural Vegetation and Wildlife Resources" },
      { id: "ch13", name: "Chapter 13. Mineral and Power Resources" },
      { id: "ch14", name: "Chapter 14. Agriculture" },
      { id: "ch15", name: "Chapter 15. Industries" },
      { id: "ch16", name: "Chapter 16. Human Resources" }
    ]
  },
  // Legacy Class 7 Books (keeping for backward compatibility)
  {
    id: "ncert-honeycomb",
    name: "Honeycomb",
    class: "7",
    subject: "english",
    chapters: [
      { id: "ch01", name: "Chapter 1. Three Questions, The Squirrel" },
      { id: "ch02", name: "Chapter 2. A Gift of Chappals, The Rebel" },
      { id: "ch03", name: "Chapter 3. Gopal and the Hilsa Fish, The Shed" },
      { id: "ch04", name: "Chapter 4. The Ashes That Made Trees Bloom, Chivvy" },
      { id: "ch05", name: "Chapter 5. Quality, Trees" },
      { id: "ch06", name: "Chapter 6. Expert Detectives, Mystery of the Talking Fan" },
      { id: "ch07", name: "Chapter 7. The Invention of Vita-Wonk, Dad and the Cat and the Tree, Garden Snake" },
      { id: "ch08", name: "Chapter 8. A Homage to our Brave Soldiers, Meadow Surprises" }
    ]
  },
  {
    id: "ncert-alien-hand",
    name: "An Alien Hand",
    class: "7",
    subject: "english",
    chapters: [
      { id: "ch01", name: "Chapter 1. The Tiny Teacher" },
      { id: "ch02", name: "Chapter 2. Bringing up Kari" },
      { id: "ch03", name: "Chapter 3. Golu Grows a Nose" },
      { id: "ch04", name: "Chapter 4. Chandni" },
      { id: "ch05", name: "Chapter 5. The Bear Story" },
      { id: "ch06", name: "Chapter 6. A Tiger in the House" },
      { id: "ch07", name: "Chapter 7. An Alien Hand" }
    ]
  }
];

export const classOptions = Array.from({ length: 8 }, (_, i) => ({ value: (i + 1).toString(), label: `Class ${i + 1}` }));

interface ChapterSelectorProps {
  selectedClass: string;
  setSelectedClass: (value: string) => void;
  selectedBook: string;
  setSelectedBook: (value: string) => void;
  selectedChapter: string;
  setSelectedChapter: (value: string) => void;
  subject?: string; // Optional subject filter
}

const ChapterSelector: React.FC<ChapterSelectorProps> = ({
  selectedClass,
  setSelectedClass,
  selectedBook,
  setSelectedBook,
  selectedChapter,
  setSelectedChapter,
  subject // New prop
}) => {
  // Filter books by class and optionally by subject
  const availableBooks = books.filter(book => {
    const matchesClass = book.class === selectedClass;
    const matchesSubject = subject ? book.subject === subject : true;
    return matchesClass && matchesSubject;
  });

  useEffect(() => {
    const currentBookIsValidForClass = availableBooks.some(book => book.id === selectedBook);
    if (!currentBookIsValidForClass && availableBooks.length > 0) {
      setSelectedBook(availableBooks[0].id);
      setSelectedChapter(""); 
    } else if (!currentBookIsValidForClass && availableBooks.length === 0) {
      setSelectedBook("");
      setSelectedChapter("");
    }
  }, [selectedClass]); // Only depend on selectedClass

  useEffect(() => {
    if (selectedBook) {
      const currentBookDetails = availableBooks.find(b => b.id === selectedBook);
      const chapterIsValidForBook = currentBookDetails?.chapters.some(chap => chap.id === selectedChapter);
      if (selectedChapter && !chapterIsValidForBook) {
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

export default ChapterSelector;
