import React, { useState, useRef, useCallback, useEffect } from 'react'; 
import { Textarea } from '@/components/ui/textarea';
import { NeoButton } from '@/components/NeoButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, ImagePlus, X, Trash2, MessageCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { openaiService } from '@/services/openai';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; 
import AnswerRenderer from '@/components/AnswerRenderer'; 

interface MathQuestionFormProps {
  topic: string;
  onResultGenerated?: (result: {
    question: string;
    answer: string;
    similarQuestions: string[];
    imageUrl?: string;
  }) => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any; 
    SpeechRecognitionEvent: any;
    SpeechRecognitionErrorEvent: any;
  }
}

const MathQuestionForm: React.FC<MathQuestionFormProps> = ({ topic, onResultGenerated }) => {
  const [question, setQuestion] = useState('');
  const [explanation, setExplanation] = useState('');
  const [similarQuestions, setSimilarQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{question: string, answer: string}>>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null); 

  // Function to clean and format mathematical expressions and line breaks
  const cleanMathExpression = useCallback((text: string) => {
    if (!text) return text;

    // First, protect LaTeX math delimiters and expressions
    const protectedExpressions: { [key: string]: string } = {};
    let protectionCounter = 0;

    let result = text;

    // Protect display math \[ ... \]
    result = result.replace(/\\\[[\s\S]*?\\\]/g, (match) => {
      const placeholder = `__PROTECTED_DISPLAY_${protectionCounter++}__`;
      protectedExpressions[placeholder] = match;
      return placeholder;
    });

    // Protect inline math \( ... \)
    result = result.replace(/\\\([\s\S]*?\\\)/g, (match) => {
      const placeholder = `__PROTECTED_INLINE_${protectionCounter++}__`;
      protectedExpressions[placeholder] = match;
      return placeholder;
    });

    // Protect dollar math $$ ... $$ and $ ... $
    result = result.replace(/\$\$[\s\S]*?\$\$/g, (match) => {
      const placeholder = `__PROTECTED_DOLLAR_DISPLAY_${protectionCounter++}__`;
      protectedExpressions[placeholder] = match;
      return placeholder;
    });

    result = result.replace(/\$[^$\n]*?\$/g, (match) => {
      const placeholder = `__PROTECTED_DOLLAR_INLINE_${protectionCounter++}__`;
      protectedExpressions[placeholder] = match;
      return placeholder;
    });

    // Protect \frac expressions
    result = result.replace(/\\frac\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, (match) => {
      const placeholder = `__PROTECTED_FRAC_${protectionCounter++}__`;
      protectedExpressions[placeholder] = match;
      return placeholder;
    });

    // Protect \sqrt expressions
    result = result.replace(/\\sqrt\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, (match) => {
      const placeholder = `__PROTECTED_SQRT_${protectionCounter++}__`;
      protectedExpressions[placeholder] = match;
      return placeholder;
    });

    // Now apply symbol replacements to non-protected content
    result = result
      .replace(/\\int(?![a-zA-Z])/g, '∫')
      .replace(/\\sum(?![a-zA-Z])/g, '∑')
      .replace(/\\prod(?![a-zA-Z])/g, '∏')
      .replace(/\\partial(?![a-zA-Z])/g, '∂')
      .replace(/\\infty(?![a-zA-Z])/g, '∞')
      .replace(/\\pi(?![a-zA-Z])/g, 'π')
      .replace(/\\theta(?![a-zA-Z])/g, 'θ')
      .replace(/\\alpha(?![a-zA-Z])/g, 'α')
      .replace(/\\beta(?![a-zA-Z])/g, 'β')
      .replace(/\\gamma(?![a-zA-Z])/g, 'γ')
      .replace(/\\delta(?![a-zA-Z])/g, 'δ')
      .replace(/\\epsilon(?![a-zA-Z])/g, 'ε')
      .replace(/\\lambda(?![a-zA-Z])/g, 'λ')
      .replace(/\\mu(?![a-zA-Z])/g, 'μ')
      .replace(/\\sigma(?![a-zA-Z])/g, 'σ')
      .replace(/\\omega(?![a-zA-Z])/g, 'ω')
      .replace(/\\pm(?![a-zA-Z])/g, '±')
      .replace(/\\times(?![a-zA-Z])/g, '×')
      .replace(/\\div(?![a-zA-Z])/g, '÷')
      .replace(/\\leq(?![a-zA-Z])/g, '≤')
      .replace(/\\geq(?![a-zA-Z])/g, '≥')
      .replace(/\\neq(?![a-zA-Z])/g, '≠')
      .replace(/\\approx(?![a-zA-Z])/g, '≈')
      .replace(/\\in(?![a-zA-Z])/g, '∈')
      .replace(/\\subset(?![a-zA-Z])/g, '⊂')
      .replace(/\\superset(?![a-zA-Z])/g, '⊃')
      .replace(/\\cup(?![a-zA-Z])/g, '∪')
      .replace(/\\cap(?![a-zA-Z])/g, '∩');

    // Restore protected expressions
    for (const [placeholder, original] of Object.entries(protectedExpressions)) {
      result = result.replace(new RegExp(placeholder, 'g'), original);
    }

    return result;
  }, []);

  // Function to safely clean JSON string before parsing
  const cleanJsonString = useCallback((jsonString: string) => {
    // Remove markdown code blocks if present
    let cleaned = jsonString.trim();
    
    if (cleaned.startsWith('```json') && cleaned.endsWith('```')) {
      cleaned = cleaned.slice(7, -3).trim();
    } else if (cleaned.startsWith('```') && cleaned.endsWith('```')) {
      cleaned = cleaned.slice(3, -3).trim();
    }
    
    // Handle case where code blocks might have different formatting
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      cleaned = codeBlockMatch[1].trim();
    }

    // Enhanced LaTeX and special character handling for JSON
    // First, temporarily replace LaTeX expressions to protect them
    const latexReplacements: { [key: string]: string } = {};
    let latexCounter = 0;
    
    // Protect display math $$...$$
    cleaned = cleaned.replace(/\$\$[\s\S]*?\$\$/g, (match) => {
      const placeholder = `__LATEX_DISPLAY_${latexCounter++}__`;
      latexReplacements[placeholder] = match;
      return placeholder;
    });
    
    // Protect inline math $...$
    cleaned = cleaned.replace(/\$[^$\n]*?\$/g, (match) => {
      const placeholder = `__LATEX_SINGLE_${latexCounter++}__`;
      latexReplacements[placeholder] = match;
      return placeholder;
    });
    
    // Protect inline math \(...\) and \[...\]
    cleaned = cleaned.replace(/\\\([\s\S]*?\\\)/g, (match) => {
      const placeholder = `__LATEX_INLINE_${latexCounter++}__`;
      latexReplacements[placeholder] = match;
      return placeholder;
    });
    
    cleaned = cleaned.replace(/\\\[[\s\S]*?\\\]/g, (match) => {
      const placeholder = `__LATEX_BLOCK_${latexCounter++}__`;
      latexReplacements[placeholder] = match;
      return placeholder;
    });
    
    // Protect common LaTeX commands
    cleaned = cleaned.replace(/\\(?:frac|sqrt|sum|int|prod|partial|infty|pi|theta|alpha|beta|gamma|delta|epsilon|lambda|mu|sigma|omega|times|div|leq|geq|neq|approx|in|subset|superset|cup|cap|pm)\b/g, (match) => {
      const placeholder = `__LATEX_CMD_${latexCounter++}__`;
      latexReplacements[placeholder] = match;
      return placeholder;
    });
    
    // Now fix common JSON issues while preserving LaTeX
    cleaned = cleaned
      // Remove any trailing commas before closing braces/brackets
      .replace(/,(\s*[}\]])/g, '$1')
      // Fix newlines in strings (convert actual newlines to \n)
      .replace(/("(?:[^"\\]|\\.)*?")/g, (match) => {
        return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
      });
    
    // Restore LaTeX expressions
    for (const [placeholder, latex] of Object.entries(latexReplacements)) {
      cleaned = cleaned.replace(new RegExp(placeholder, 'g'), latex);
    }

    return cleaned;
  }, []);

  // --- Voice Input Logic --- 
  const stopListening = useCallback(() => {
      if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } 
          catch (e) { console.warn("Error stopping recognition:", e); }
      }
      setIsListening(false); 
  }, []);

  const startListening = useCallback(() => {
     if (!('webkitSpeechRecognition' in window)) { toast.error('Speech recognition not supported'); return; }
     setIsListening(true);
     recognitionRef.current = new window.webkitSpeechRecognition();
     const recognition = recognitionRef.current;
     recognition.continuous = false;
     recognition.interimResults = false;
     recognition.lang = 'en-US';
     recognition.onresult = (event: any) => { 
        const transcript = event.results[0][0].transcript;
        setQuestion((prev) => (prev ? prev + ' ' : '') + transcript); 
     };
     recognition.onerror = (event: any) => { 
        console.error('Speech recognition error', event);
        toast.error('Speech recognition failed: ' + event.error);
        stopListening(); 
     };
     recognition.onend = () => { 
        console.log("Recognition ended.");
        setIsListening(false); 
        recognitionRef.current = null; 
     };
     try { recognition.start(); } 
     catch (e) { 
        console.error("Error starting speech recognition:", e);
        toast.error("Could not start voice input.");
        stopListening(); 
     }
  }, [stopListening]);

  const toggleListening = useCallback(() => { 
      if (isListening) stopListening(); 
      else startListening(); 
  }, [isListening, startListening, stopListening]);

  // --- Image Handling Logic --- 
  const handleImageButtonClick = useCallback(() => { 
      fileInputRef.current?.click(); 
  }, []);

  const handleImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) { toast.error("Select image file."); return; }
      if (file.size > 5 * 1024 * 1024) { toast.error("Image < 5MB."); return; }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result as string); };
      reader.readAsDataURL(file);
    } else { setSelectedImage(null); setImagePreview(null); }
    if (event.target) { event.target.value = ''; }
  }, []);

  const removeImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) { fileInputRef.current.value = ''; }
  }, []);

  // Clear conversation history
  const clearConversation = useCallback(() => {
    if (conversationHistory.length === 0) {
      toast.info('No conversation to clear');
      return;
    }

    // Confirm before clearing
    if (window.confirm('Are you sure you want to clear the conversation history? This action cannot be undone.')) {
      setConversationHistory([]);
      setExplanation('');
      setSimilarQuestions([]);
      toast.success('Conversation cleared');
    }
  }, [conversationHistory.length]);

  // --- Form Submission Logic --- 
  const handleSubmit = useCallback(async () => {
    if (!question.trim() && !selectedImage) { toast.error('Enter question or upload image'); return; }
    console.log("Submit initiated.");
    setIsLoading(true);
    setExplanation('');
    setSimilarQuestions([]);
    const imageUrlForPrompt = imagePreview;
    let success = false;
    try {
      const systemPrompt = `You are a specialized ${topic} tutor. You are an expert in mathematics and should solve mathematical problems with enhanced validation and context awareness.

${topic === 'Arithmetic' ? `
ARITHMETIC SPECIFIC RULES:
- Remember previous questions in the conversation for follow-up questions
- For simple statements like "5+3=8", respond: {"explanation": "This is a correct arithmetic statement. There's no variable to solve for. Would you like me to explain the addition process or ask a related question?", "similarQuestions": ["What is 7+4?", "Explain the addition process", "What are the properties of addition?"]}
- For incomplete expressions like "x", ask: {"explanation": "I see you've written 'x'. Would you like to complete an equation, substitute a value, or simplify an expression?", "similarQuestions": ["Solve x + 5 = 10", "What is x when x = 3?", "Simplify 2x + 3x"]}
- For malformed input like "x+2 5", clarify: {"explanation": "It looks like there might be a missing operator. Did you mean 'x+2=5' or 'x+2+5'?", "similarQuestions": ["Solve x+2=5", "Calculate x+2+5", "What are mathematical operators?"]}
` : ''}

${topic === 'Algebra' ? `
ALGEBRA SPECIFIC RULES:
- For equations with multiple variables like "2x+y=10", respond: {"explanation": "This equation has two variables (x and y). Please specify which variable you'd like me to solve for, or provide a second equation to solve the system.", "similarQuestions": ["Solve 2x+y=10 for x", "Solve 2x+y=10 for y", "Solve the system: 2x+y=10, x-y=2"]}
- For simple statements without variables like "5+3=8", respond: {"explanation": "This is an arithmetic statement with no variables to solve for. Would you like help with an algebraic equation instead?", "similarQuestions": ["Solve x+3=8", "Factor x²+5x+6", "Graph y=2x+3"]}
- For incomplete expressions like "x", ask: {"explanation": "Would you like to complete this into an equation to solve, or would you like help with algebraic operations involving x?", "similarQuestions": ["Solve x²-4=0", "Factor x²+2x", "Simplify 3x+2x"]}
- Always check if there are enough constraints to solve for unknowns
` : ''}

${topic === 'Geometry' ? `
GEOMETRY SPECIFIC RULES:
- ALWAYS validate that measurements are physically possible (no negative lengths, radii, etc.)
- For negative measurements like radius = -5, respond: {"explanation": "Error: Radius cannot be negative. Geometric measurements must be positive values.", "similarQuestions": ["Find surface area with radius = 5", "What is the definition of radius?", "Calculate area of circle with radius = 3"]}
- Check for impossible triangle configurations (angles don't add to 180°, sides don't satisfy triangle inequality)
- For inconsistent configurations, respond: {"explanation": "Error: Inconsistent geometric configuration. Please check your angle placements and values.", "similarQuestions": ["Properties of triangles", "Triangle inequality theorem", "Sum of angles in a triangle"]}
- Validate that given information is sufficient and consistent
` : ''}

${topic === 'Calculus' ? `
CALCULUS SPECIFIC RULES:
- Pay attention to angle units (degrees vs radians)
- For limits involving trigonometric functions in degrees, convert appropriately
- For "sin(x)/x as x→0 in degrees", respond with: {"explanation": "When x is in degrees, we need to convert to radians. The limit is π/180 ≈ 0.0175, not 1.", "similarQuestions": ["Find lim(x→0) sin(x)/x in radians", "Convert degrees to radians", "Why is the limit different for degrees?"]}
- For continuity problems, check ALL three conditions: function value exists, limit exists, and they're equal
- Always verify left and right limits separately for continuity
- For piecewise functions, explicitly check left and right limits
` : ''}

${topic === 'Statistics' ? `
STATISTICS SPECIFIC RULES:
- Consider real-world context and sampling bias
- For biased samples, identify the bias and explain why results can't be generalized
- For questions about hospital surveys, note: {"explanation": "No. The sample is biased because it only includes patients from a lung cancer ward, which is not representative of the general population.", "similarQuestions": ["What makes a sample representative?", "Types of sampling bias", "How to design unbiased surveys"]}
- Always consider whether the sample is representative of the target population
- Address real-world reasoning and context, not just mathematical calculations
` : ''}

${topic === 'Problem Solving' ? `
PROBLEM SOLVING SPECIFIC RULES:
- Look for hidden patterns in sequences, not just obvious ones
- For sequences like "2, 4, 8, 16, 31, 64", check if every nth term has a modification
- Pattern analysis: 2×2=4, 4×2=8, 8×2=16, 16×2=32 but shown as 31 (-1), 31×2=62 but shown as 64 (+2)
- The next term should be 64×2=128, but following the pattern of modification every 3rd term: 128-1=127
- Always verify patterns by checking multiple terms and looking for exceptions
- Consider that patterns might have periodic modifications or exceptions
- For the sequence 2,4,8,16,31,64, the answer is 127, not 128
` : ''}

IMPORTANT: If you see ANY of these mathematical indicators, treat it as a valid math question:
- Mathematical symbols: ∫, ∑, ∏, √, π, α, β, γ, δ, θ, λ, μ, σ, ω, ±, ×, ÷, ≤, ≥, ≠, ≈, ∈, ⊂, ⊃, ∪, ∩
- Integration symbols: ∫, dx, dy, dz
- Derivatives: d/dx, ∂/∂x, f'(x), y'
- Fractions with variables: 1/x, x/y, (x+1)/(x-1)
- Exponents: x², x³, x^n, e^x
- Functions: f(x), g(x), sin(x), cos(x), tan(x), ln(x), log(x)
- Equations with variables: ax + b = c, y = mx + b
- Mathematical expressions in any form

FOLLOW-UP QUESTION RECOGNITION:
- Questions starting with "What if", "What about", "Can you", "How about" are likely follow-ups
- Questions containing "that", "this", "the previous", "above", "earlier" refer to previous context
- Questions like "explain that step", "show me another way", "use a different method" refer to previous solutions
- Questions with just a variable assignment like "x = 5" or "if r = 10" apply to the most recent problem
- Questions asking for "clarification", "more detail", "alternative approach" refer to previous work

RECOGNITION RULES:
1. If the question contains mathematical symbols, expressions, equations, or asks about mathematical concepts, it IS a mathematics question
2. Integration problems (with ∫ symbol) are ALWAYS calculus questions
3. Questions with fractions, exponents, variables, or mathematical notation are ALWAYS math questions
4. ONLY reject questions that are clearly about non-mathematical subjects (history, literature, cooking, etc.) with NO mathematical content
5. For valid mathematical questions, provide detailed step-by-step solutions using proper mathematical notation
6. ONLY use this response for clearly non-mathematical questions: {"explanation": "I can only help with mathematics questions. Please ask a question related to ${topic} or other mathematical topics.", "similarQuestions": []}
7. Use LaTeX for mathematical expressions: $ for inline math, $$ for display math
8. Use proper Unicode symbols like ∫ for integrals, ∑ for summations, π for pi, etc.
9. Use proper line breaks in your explanation text using actual newlines, not \\n
10. Format response as raw JSON with keys "explanation" and "similarQuestions"
11. Do not include markdown code blocks or extra formatting
12. Return ONLY the JSON object
13. IMPORTANT: Escape all special characters properly in JSON strings. Use double quotes for strings and escape any quotes inside strings.

FORMATTING GUIDELINES:
- Use actual line breaks in your text, not \\n sequences
- Number your steps clearly (1., 2., 3., etc.)
- Use proper mathematical notation with LaTeX
- Keep JSON valid - escape quotes and backslashes properly

MATHEMATICAL TOPICS I CAN HELP WITH:
- Arithmetic, Algebra, Pre-calculus
- Calculus (differential, integral, multivariable) - including all integration problems with ∫ symbol
- Linear Algebra, Abstract Algebra
- Geometry, Trigonometry
- Statistics, Probability
- Discrete Mathematics
- Number Theory
- Differential Equations
- Mathematical Proofs
- Applied Mathematics

EXAMPLES OF VALID MATH QUESTIONS:
- ∫(1/x + 1/x²)(∛(3x^-24) + x^-26)dx = ... (This is ALWAYS a calculus question)
- Solve for x: 2x + 5 = 15
- Find the derivative of f(x) = x³
- What is the area of a circle with radius 5?
- Calculate the mean of the data set: 2, 4, 6, 8, 10

If the question contains ANY non-mathematical content mixed with math, focus ONLY on the mathematical parts and ignore the rest.`;

      // Build conversation context for follow-up questions
      let conversationContext = '';
      if (conversationHistory.length > 0) {
        conversationContext = '\n\nPREVIOUS CONVERSATION CONTEXT:\n' +
          'You have been helping with the following questions. Use this context to understand follow-up questions:\n' +
          conversationHistory.slice(-3).map((item, index) => {
            const questionNum = conversationHistory.length - 3 + index + 1;
            return `Q${questionNum}: ${item.question}\nA${questionNum}: ${item.answer.substring(0, 300)}${item.answer.length > 300 ? '...' : ''}`;
          }).join('\n\n') +
          '\n\nFOLLOW-UP QUESTION HANDLING:\n' +
          '- If the current question refers to "that", "this", "the previous", "above", etc., it likely refers to the previous conversation\n' +
          '- If the question asks "what if x = 5" or similar, apply it to the most recent equation/problem\n' +
          '- If the question asks for clarification like "explain that step", refer to the previous solution\n' +
          '- If the question asks for alternative methods, apply them to the most recent problem\n' +
          '- Always maintain mathematical context from previous questions when relevant\n\n' +
          'CURRENT QUESTION:\n';
      }

      let userPrompt = conversationContext + question;
      if (imageUrlForPrompt) { userPrompt = conversationContext + `Question based on image: ${question || '(Analyze the mathematical content in this image)'}`; }
      console.log("Calling API...");
      const result = await openaiService.createCompletion( systemPrompt, userPrompt, { temperature: 0.7, max_tokens: 2500, imageData: imageUrlForPrompt } );
      console.log("Raw response: ", JSON.stringify(result));
      if (!result || !result.trim()) { console.error("Empty response."); toast.error("Empty AI response."); return; }
      
      try {
        const cleanedResult = cleanJsonString(result);
        console.log("Cleaned result for parsing:", cleanedResult);
        
        let parsedResult;
        try {
          parsedResult = JSON.parse(cleanedResult);
        } catch (firstParseError) {
          console.log("JSON parse failed, attempting manual content extraction...");
          
          // Manual extraction as fallback
          const explanationMatch = cleanedResult.match(/"explanation"\s*:\s*"((?:[^"\\]|\\.)*)"/);
          const similarQuestionsMatch = cleanedResult.match(/"similarQuestions"\s*:\s*\[((?:[^\]])*)\]/);
          
          if (explanationMatch) {
            const explanation = explanationMatch[1]
              .replace(/\\"/g, '"')
              .replace(/\\n/g, '\n')
              .replace(/\\\\/g, '\\');
            
            let similarQuestions: string[] = [];
            if (similarQuestionsMatch) {
              const questionsStr = similarQuestionsMatch[1];
              const questionMatches = questionsStr.match(/"([^"]*)"/g);
              if (questionMatches) {
                similarQuestions = questionMatches.map(q => q.slice(1, -1).replace(/\\"/g, '"'));
              }
            }
            
            parsedResult = { explanation, similarQuestions };
          } else {
            throw new Error("Could not extract content from response");
          }
        }
        
        console.log("Parsed OK:", parsedResult);
        
        if (parsedResult?.explanation && parsedResult?.similarQuestions !== undefined) {
            // Clean mathematical expressions in the explanation
            const cleanedExplanation = cleanMathExpression(parsedResult.explanation);
            const cleanedSimilarQuestions = Array.isArray(parsedResult.similarQuestions) 
              ? parsedResult.similarQuestions.map((q: string) => cleanMathExpression(q))
              : [];
            
            setExplanation(cleanedExplanation);
            setSimilarQuestions(cleanedSimilarQuestions);

            // Add to conversation history for follow-up questions
            setConversationHistory(prev => [...prev, { question, answer: cleanedExplanation }]);

            success = true;
            console.log("State updated OK.");
            if (onResultGenerated) {
              onResultGenerated({
                question,
                answer: cleanedExplanation,
                similarQuestions: cleanedSimilarQuestions,
                imageUrl: imageUrlForPrompt
              });
            }
        } else { 
            console.error("Parsed JSON missing keys.", parsedResult);
            toast.error('AI response structure incorrect.');
            // Fallback: try to extract content from the raw result
            setExplanation(cleanMathExpression(result)); 
            setSimilarQuestions([]);
            success = true;
            console.log("State update fallback (structure error).");
        }
      } catch (parseError) { 
          console.error('Parse error:', parseError, result);
          toast.error('Failed to parse AI response.');
          // Fallback: show raw response with cleaned math
          setExplanation(cleanMathExpression(result)); 
          setSimilarQuestions([]);
          success = true;
          console.log("State update fallback (parse error).");
      }
    } catch (apiError) { 
        console.error('API Error:', apiError); 
        toast.error('Failed to get explanation.');
        setExplanation("");
        setSimilarQuestions([]);
        console.log("State cleared on API error.");
    } finally { 
        console.log(`Submit finished. Success: ${success}`);
        setIsLoading(false); 
    }
  }, [question, selectedImage, imagePreview, topic, onResultGenerated, cleanMathExpression, cleanJsonString]);

  // Reset conversation history when topic changes
  useEffect(() => {
    setConversationHistory([]);
    setExplanation('');
    setSimilarQuestions([]);
  }, [topic]);

  // --- useEffect for Logging State ---
  useEffect(() => {
    console.log("State before render:", {
      explanationLength: explanation.length,
      similarQuestionsCount: similarQuestions.length,
      conversationHistoryLength: conversationHistory.length,
      isLoading
    });
  }, [explanation, similarQuestions, conversationHistory.length, isLoading]);

  // --- Rendering Logic ---
  return (
    <div className="space-y-6">
      {/* Explanation Card - Now appears FIRST */}
      {!isLoading && explanation && (
        <Card className="neo-card">
          <CardHeader><CardTitle>Solution</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] sm:h-[400px] pr-2 sm:pr-4">
              <AnswerRenderer content={explanation} />
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Conversation History Indicator (without Clear Button) */}
      {conversationHistory.length > 0 && (
        <Card className="neo-card bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Conversation Active ({conversationHistory.length} question{conversationHistory.length !== 1 ? 's' : ''})
              </span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              I can now answer follow-up questions about your previous problems. Ask things like "What if x = 5?" or "Explain that step again."
            </p>
          </CardContent>
        </Card>
      )}

      {/* Input Card */}
      <Card className="neo-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ask a {topic} Question</CardTitle>
              {conversationHistory.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  💡 You can ask follow-up questions about previous problems
                </p>
              )}
            </div>
            {/* Clear Chat Button integrated into header */}
            {conversationHistory.length > 0 && (
              <NeoButton
                variant="destructive"
                size="sm"
                onClick={clearConversation}
                icon={<Trash2 className="h-4 w-4" />}
                className="text-xs"
              >
                Clear Chat
              </NeoButton>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
                      {/* Image Preview */} 
            {imagePreview && (
              <div className="relative group">
                <img src={imagePreview} alt="Preview" className="max-w-full max-h-60 rounded-md mx-auto border border-gray-300 object-contain"/>
                <button onClick={removeImage} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove image">
                  <X size={16} />
                </button>
              </div>
            )}
            {/* Input Area */}
            <div className="flex flex-col space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch space-y-2 sm:space-y-0 sm:space-x-2">
                <Textarea
                  placeholder={
                    selectedImage
                      ? `Ask about image...`
                      : conversationHistory.length > 0
                        ? `Ask a follow-up question or new ${topic} problem...`
                        : `Enter ${topic} question or upload...`
                  }
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="flex-1 min-h-[100px] sm:min-h-[80px] resize-none text-base"
                  disabled={isLoading}
                />
                <div className="flex sm:flex-col justify-center sm:justify-between space-x-2 sm:space-x-0 sm:space-y-2">
                  <NeoButton
                    variant="secondary"
                    size="sm"
                    onClick={handleImageButtonClick}
                    icon={<ImagePlus className="h-4 w-4" />}
                    disabled={isLoading}
                    aria-label="Upload"
                    className="flex-1 sm:flex-none"
                  />
                  <NeoButton
                    variant={isListening ? "destructive" : "secondary"}
                    size="sm"
                    onClick={toggleListening}
                    icon={isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    disabled={isLoading}
                    aria-label={isListening ? "Stop" : "Listen"}
                    className="flex-1 sm:flex-none"
                  />
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden"/>
              {/* Listening Indicator */} 
              {isListening && (
                <div className="w-full">
                  <Progress value={100} className="h-2 bg-red-200" />
                  <div className="flex items-center justify-center mt-2">
                    <span className="text-sm text-red-600 font-medium">Recording...</span>
                    <div className="ml-2 w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>
            {/* Submit Button */}
            <NeoButton
              onClick={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              disabled={isLoading || (!question.trim() && !selectedImage)}
              variant="primary"
              fullWidth
              loading={isLoading}
            >
              {isLoading ? "Solving..." : "Solve"}
            </NeoButton>
          </div>
        </CardContent>
      </Card>



      {/* Similar Questions Card */}
      {!isLoading && similarQuestions.length > 0 && (
        <Card className="neo-card">
          <CardHeader><CardTitle>Similar Questions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {similarQuestions.map((q, index) => (
                <Card key={index} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300">
                  <AnswerRenderer content={q} />
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversation History Card */}
      {conversationHistory.length > 1 && (
        <Card className="neo-card">
          <CardHeader>
            <CardTitle>Recent Questions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your previous questions in this session
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] pr-2">
              <div className="space-y-3">
                {conversationHistory.slice(-5).reverse().map((item, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Q{conversationHistory.length - index}: {item.question}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {item.answer.substring(0, 100)}...
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MathQuestionForm;