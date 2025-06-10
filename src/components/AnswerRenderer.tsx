import React from 'react';

interface AnswerRendererProps {
  content: string;
}

const AnswerRenderer: React.FC<AnswerRendererProps> = ({ content }) => {
  
  // Format mathematical formulas for better readability
  const formatFormula = (formula: string) => {
    let result = formula;
    
    // Handle nested braces in fractions more carefully - prefer fraction notation
    result = result.replace(/\\frac\{([^{}]+(?:\{[^{}]*\}[^{}]*)*)\}\{([^{}]+(?:\{[^{}]*\}[^{}]*)*)\}/g, '($1)/($2)');
    
    // Handle square roots with complex expressions  
    result = result.replace(/\\sqrt\{([^{}]+(?:\{[^{}]*\}[^{}]*)*)\}/g, '√($1)');
    
    // Handle text with nested content
    result = result.replace(/\\text\{([^}]+)\}/g, '$1');
    
    // Handle subscripts and superscripts with braces
    result = result.replace(/([a-zA-Z])_\{([^}]+)\}/g, '$1₍$2₎');
    result = result.replace(/([a-zA-Z])\^\{([^}]+)\}/g, '$1^($2)');
    
    // Simple subscripts and superscripts  
    result = result.replace(/([a-zA-Z])_([a-zA-Z0-9]+)/g, '$1₍$2₎');
    result = result.replace(/([a-zA-Z])\^([a-zA-Z0-9]+)/g, '$1^$2');
      return result
      .replace(/\\times/g, ' × ') // Replace times symbol
      .replace(/\\div/g, ' ÷ ') // Replace division symbol
      .replace(/\\pm/g, ' ± ') // Replace plus-minus
      .replace(/\\mp/g, ' ∓ ') // Replace minus-plus
      .replace(/\\left\(/g, '(').replace(/\\right\)/g, ')') // Remove \left and \right
      .replace(/\\left\[/g, '[').replace(/\\right\]/g, ']') // Remove \left and \right for brackets
      .replace(/\\left\|/g, '|').replace(/\\right\|/g, '|') // Remove \left and \right for absolute value
      .replace(/\\cdot/g, ' · ') // Replace cdot with middle dot
      .replace(/\\bullet/g, ' • ') // Replace bullet
      .replace(/\\neq/g, ' ≠ ') // Not equal
      .replace(/\\leq/g, ' ≤ ') // Less than or equal
      .replace(/\\geq/g, ' ≥ ') // Greater than or equal
      .replace(/\\le/g, ' ≤ ') // Less than or equal (short form)
      .replace(/\\ge/g, ' ≥ ') // Greater than or equal (short form)
      .replace(/\\ll/g, ' ≪ ') // Much less than
      .replace(/\\gg/g, ' ≫ ') // Much greater than
      .replace(/\\approx/g, ' ≈ ') // Approximately equal
      .replace(/\\equiv/g, ' ≡ ') // Equivalent
      .replace(/\\propto/g, ' ∝ ') // Proportional to
      .replace(/\\sum/g, '∑') // Summation
      .replace(/\\prod/g, '∏') // Product
      .replace(/\\int/g, '∫') // Integral
      .replace(/\\partial/g, '∂') // Partial derivative
      .replace(/\\infty/g, '∞') // Infinity
      .replace(/\\alpha/g, 'α').replace(/\\beta/g, 'β').replace(/\\gamma/g, 'γ').replace(/\\delta/g, 'δ') // Greek letters
      .replace(/\\epsilon/g, 'ε').replace(/\\zeta/g, 'ζ').replace(/\\eta/g, 'η').replace(/\\theta/g, 'θ')
      .replace(/\\lambda/g, 'λ').replace(/\\mu/g, 'μ').replace(/\\nu/g, 'ν').replace(/\\pi/g, 'π')
      .replace(/\\rho/g, 'ρ').replace(/\\sigma/g, 'σ').replace(/\\tau/g, 'τ').replace(/\\phi/g, 'φ')
      .replace(/\\chi/g, 'χ').replace(/\\psi/g, 'ψ').replace(/\\omega/g, 'ω')
      .replace(/\\Gamma/g, 'Γ').replace(/\\Delta/g, 'Δ').replace(/\\Theta/g, 'Θ').replace(/\\Lambda/g, 'Λ')
      .replace(/\\Sigma/g, 'Σ').replace(/\\Phi/g, 'Φ').replace(/\\Psi/g, 'Ψ').replace(/\\Omega/g, 'Ω')
      .replace(/\^(\d+)/g, (match, num) => {
        const superscripts = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
        return num.split('').map(digit => superscripts[parseInt(digit)] || `^${digit}`).join('');
      }) // Convert numeric superscripts
      .replace(/\^2/g, '²') // Superscript 2
      .replace(/\^3/g, '³') // Superscript 3
      .replace(/_(\d+)/g, (match, num) => {
        const subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
        return num.split('').map(digit => subscripts[parseInt(digit)] || `_${digit}`).join('');
      }) // Convert numeric subscripts
      .replace(/\{/g, '').replace(/\}/g, '') // Remove remaining braces
      .replace(/\\\\/g, '').replace(/\\/g, ''); // Remove backslashes
  };

  // Format inline text with emphasis and special formatting
  const formatInlineText = (text: string) => {
    // Handle bold text
    let parts = text.split(/(\*\*[^*]+\*\*)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-blue-800 dark:text-blue-400">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Handle mathematical expressions with common symbols
      if (/[÷×±≠≤≥√²³%]/.test(part) || /\d+\s*[\/\*\+\-]\s*\d+/.test(part)) {
        return (
          <code key={index} className="bg-blue-100 dark:bg-blue-950/30 px-2 py-1 rounded text-sm font-mono border text-blue-800 dark:text-blue-400">
            {part}
          </code>
        );
      }
      
      // Handle percentage expressions
      if (/\d+%|\d+\s*percent/i.test(part)) {
        return (
          <span key={index} className="font-semibold text-green-700 bg-green-100 px-1 rounded">
            {part}
          </span>
        );
      }
      
      return <span key={index}>{part}</span>;
    });
  };  // Render content that may contain both text and LaTeX formulas
  const renderContentWithFormulas = (content: string) => {
    if (!content) return null;

    // Step 1: Process display math \[ ... \] first
    let processedContent = content;

    // Handle display math patterns with robust regex
    if (processedContent.includes('\\[') && processedContent.includes('\\]')) {
      const displayMathRegex = /(\\\[[\s\S]*?\\\])/g;
      const parts = processedContent.split(displayMathRegex);

      const components = parts.map((part, index) => {
        if (part.startsWith('\\[') && part.endsWith('\\]')) {
          const formula = part.slice(2, -2).trim();
          return (
            <div key={`display-${index}`} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-300 dark:border-blue-700 p-4 rounded-lg my-3 shadow-md">
              <div className="font-mono text-lg text-center text-blue-900 dark:text-blue-300 font-semibold">
                {formatFormula(formula)}
              </div>
            </div>
          );
        }
        return <span key={`text-${index}`}>{renderContentWithFormulas(part)}</span>;
      });

      return <div>{components}</div>;
    }
    
    // Step 2: Handle inline math \( ... \)
    if (processedContent.includes('\\(') && processedContent.includes('\\)')) {
      const inlineMathRegex = /(\\\([\s\S]*?\\\))/g;
      const parts = processedContent.split(inlineMathRegex);

      const components = parts.map((part, index) => {
        if (part.startsWith('\\(') && part.endsWith('\\)')) {
          const formula = part.slice(2, -2).trim();
          return (
            <code key={`inline-${index}`} className="bg-blue-100 dark:bg-blue-950/30 px-2 py-1 rounded text-sm font-mono border text-blue-800 dark:text-blue-400 mx-1">
              {formatFormula(formula)}
            </code>
          );
        }
        return <span key={`text-${index}`}>{renderContentWithFormulas(part)}</span>;
      });

      return <span>{components}</span>;
    }
    
    // Step 3: Handle dollar signs $$ ... $$ and $ ... $
    if (processedContent.includes('$')) {
      
      // First handle display math $$ ... $$
      if (processedContent.includes('$$')) {
        const displayDollarRegex = /(\$\$[\s\S]*?\$\$)/g;
        const parts = processedContent.split(displayDollarRegex);
        
        const components = parts.map((part, index) => {
          if (part.startsWith('$$') && part.endsWith('$$')) {
            const formula = part.slice(2, -2).trim();
            return (
              <div key={`dollar-display-${index}`} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-300 dark:border-blue-700 p-4 rounded-lg my-3 shadow-md">
                <div className="font-mono text-lg text-center text-blue-900 dark:text-blue-300 font-semibold">
                  {formatFormula(formula)}
                </div>
              </div>
            );
          }
          return <span key={`text-${index}`}>{renderContentWithFormulas(part)}</span>;
        });

        return <div>{components}</div>;
      } else {
        // Handle inline math $ ... $
        const inlineDollarRegex = /(\$[^$\n]*?\$)/g;
        const parts = processedContent.split(inlineDollarRegex);

        const components = parts.map((part, index) => {
          if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
            const formula = part.slice(1, -1).trim();
            return (
              <code key={`dollar-inline-${index}`} className="bg-blue-100 dark:bg-blue-950/30 px-2 py-1 rounded text-sm font-mono border text-blue-800 dark:text-blue-400 mx-1">
                {formatFormula(formula)}
              </code>
            );
          }
          return <span key={`text-${index}`}>{renderContentWithFormulas(part)}</span>;
        });

        return <span>{components}</span>;
      }
    }
    
    // Step 4: No LaTeX patterns found, just format as normal text
    return <span>{formatInlineText(processedContent)}</span>
  };

  // Render numbered lists with better formatting - SIMPLIFIED VERSION
  const renderNumberedList = (text: string, sectionIndex: number) => {
    const lines = text.split('\n').filter(line => line.trim());
    
    // Group lines into numbered items and their content
    const groupedItems: Array<{number: string, title: string, content: string[]}> = [];
    let currentItem: {number: string, title: string, content: string[]} | null = null;
    
    lines.forEach((line, index) => {
      // Clean line by removing DEBUG: prefix if present
      const cleanLine = line.replace(/^DEBUG:\s*/, '');
      
      // Check if this is a numbered item start
      const match = cleanLine.match(/^(\d+)\.\s*\*\*(.*?)\*\*$|^(\d+)\.\s*(.*)/);
      if (match) {
        // Save previous item if exists
        if (currentItem) {
          groupedItems.push(currentItem);
        }
        
        // Start new item
        const number = match[1] || match[3];
        const title = match[2] || match[4];
        currentItem = {
          number,
          title: title.trim(),
          content: []
        };
      } else if (currentItem && cleanLine.trim()) {
        // Add content to current item
        currentItem.content.push(cleanLine);
      }
    });
    
    // Add the last item
    if (currentItem) {
      groupedItems.push(currentItem);
    }
    
    return (
      <div key={sectionIndex} className="mb-6">
        <ol className="space-y-4">
          {groupedItems.map((item, itemIndex) => (
            <li key={itemIndex} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
              <div className="font-bold text-blue-700 mb-3">
                {item.number}. {item.title}
              </div>
              {item.content.length > 0 && (
                <div className="text-gray-700 ml-4 space-y-2">
                  {item.content.map((contentLine, contentIndex) => (
                    <div key={contentIndex}>
                      {renderContentWithFormulas(contentLine)}
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    );
  };

  // Function to parse and format the content
  const parseContent = (text: string) => {
    if (!text) return null;

    // Improve readability by adding more spacing for long solutions
    let processedText = text
      .replace(/(\d+\.\s)/g, '\n\n$1') // Add spacing before numbered steps
      .replace(/Therefore,/g, '\n\nTherefore,') // Add spacing before conclusions
      .replace(/Thus,/g, '\n\nThus,') // Add spacing before conclusions
      .replace(/So,/g, '\n\nSo,') // Add spacing before conclusions
      .replace(/(\w+:)/g, '\n\n$1') // Add spacing before labels like "Solution:"
      .replace(/\n{3,}/g, '\n\n'); // Normalize multiple newlines

    // Split content into sections
    const sections = processedText.split('\n\n').filter(section => section.trim());
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      
      // Handle numbered lists (1. 2. 3. etc.) - including those with colons
      if (/^\d+\.\s/.test(trimmedSection) || trimmedSection.includes('\n1.') || trimmedSection.includes('\n2.') || trimmedSection.includes('\n3.')) {
        return renderNumberedList(trimmedSection, index);
      }
      
      // Handle headings (content with **bold** markers or containing "Key" or "Chapter")
      if (trimmedSection.includes('**') || 
          trimmedSection.toLowerCase().includes('key formulas') ||
          trimmedSection.toLowerCase().includes('chapter') ||
          trimmedSection.toLowerCase().includes('measures of central tendency')) {
        return (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-2">
              {trimmedSection.replace(/\*\*/g, '')}
            </h3>
          </div>
        );
      }
      
      // Handle regular paragraphs
      return (
        <div key={index} className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {renderContentWithFormulas(trimmedSection)}
          </p>
        </div>
      );
    });
  };

  return (
    <div className="prose prose-lg max-w-none">
      <div className="space-y-4">
        {parseContent(content)}
      </div>
    </div>
  );
};

export default AnswerRenderer;
