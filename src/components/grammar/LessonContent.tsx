
import React from 'react';

interface LessonContentProps {
  title: string;
  level: string;
  content: string;
  examples: string[];
}

// Sanitize HTML content to prevent XSS attacks
const sanitizeContent = (content: string): string => {
  // Remove any script tags and dangerous HTML
  const sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<link\b[^<]*>/gi, '')
    .replace(/<meta\b[^<]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers

  return sanitized;
};

const LessonContent: React.FC<LessonContentProps> = ({ title, level, content, examples }) => {
  // Sanitize the content before rendering
  const sanitizedContent = sanitizeContent(content);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left">{title}</h2>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border-2 border-black ${
          level === 'Easy' ? 'bg-green-100 text-green-800' :
          level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {level}
        </span>
      </div>

      <div className="prose max-w-none mb-8">
        <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
          <div className="flex-1">
            <div dangerouslySetInnerHTML={{ __html: sanitizedContent.replace(/\n/g, '<br />') }} />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center sm:text-left">Examples:</h3>
        <ul className="space-y-2">
          {examples.map((example, index) => (
            <li key={index} className="flex items-start">
              <span className="bg-kid-yellow text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 border-2 border-black">
                {index + 1}
              </span>
              <div className="flex items-start gap-3 flex-1">
                <span className="flex-1">{example}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default LessonContent;
