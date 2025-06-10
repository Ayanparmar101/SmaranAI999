import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import EnglishTTSButton from './EnglishTTSButton';
import ApiKeyInput from '@/components/ApiKeyInput';
import { useEnglishTTS } from '@/hooks/useEnglishTTS';

const EnglishTTSDemo: React.FC = () => {
  const [customText, setCustomText] = useState('');
  const [wordInput, setWordInput] = useState('');
  const [definitionInput, setDefinitionInput] = useState('');
  const { hasApiKey, setApiKey } = useEnglishTTS();

  // Sample content for demonstration
  const sampleWords = [
    { word: 'pronunciation', definition: 'the way in which a word is pronounced' },
    { word: 'vocabulary', definition: 'a set of words known to a person' },
    { word: 'grammar', definition: 'the rules of a language' },
    { word: 'literature', definition: 'written works with artistic value' }
  ];

  const sampleSentences = [
    "The quick brown fox jumps over the lazy dog.",
    "Learning English is an exciting journey of discovery.",
    "Practice makes perfect when studying a new language.",
    "Reading books helps improve your vocabulary and comprehension."
  ];

  const sampleParagraph = `English is a fascinating language with a rich history and diverse vocabulary. It has become the global lingua franca, connecting people from different cultures and countries. Learning English opens doors to countless opportunities in education, business, and personal growth. Through consistent practice and dedication, students can master this beautiful language and express themselves with confidence and clarity.`;

  const samplePoem = `Roses are red,
Violets are blue,
Learning English is fun,
And rewarding too!`;

  const grammarExplanations = [
    "A noun is a word that names a person, place, thing, or idea. For example: cat, school, happiness.",
    "A verb is an action word that tells us what someone or something does. For example: run, think, exist.",
    "An adjective describes or modifies a noun. It tells us more about the noun. For example: big, beautiful, interesting.",
    "A sentence must have a subject and a predicate. The subject is who or what the sentence is about, and the predicate tells us what the subject does."
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">English Text-to-Speech Demo</h1>
        <p className="text-muted-foreground mb-4">
          Experience AI-powered English pronunciation and reading with natural, educational voice synthesis
        </p>
        
        {!hasApiKey && !import.meta.env.VITE_OPENAI_API_KEY && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">API Key Required</CardTitle>
              <CardDescription className="text-center">
                Please enter your OpenAI API key to use the TTS features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApiKeyInput onApiKeySubmit={setApiKey} />
            </CardContent>
          </Card>
        )}
      </div>

      {hasApiKey && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Word Pronunciation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📚 Word Pronunciation
                <Badge variant="secondary">Vocabulary</Badge>
              </CardTitle>
              <CardDescription>
                Practice pronouncing English words with definitions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Sample Words:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {sampleWords.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <span className="font-medium">{item.word}</span>
                        <p className="text-sm text-muted-foreground">{item.definition}</p>
                      </div>
                      <EnglishTTSButton 
                        text={item.word}
                        type="word"
                        definition={item.definition}
                        iconOnly
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-semibold">Try Your Own Word:</h4>
                <Input
                  placeholder="Enter a word..."
                  value={wordInput}
                  onChange={(e) => setWordInput(e.target.value)}
                />
                <Input
                  placeholder="Enter definition (optional)..."
                  value={definitionInput}
                  onChange={(e) => setDefinitionInput(e.target.value)}
                />
                <EnglishTTSButton 
                  text={wordInput}
                  type="word"
                  definition={definitionInput}
                  disabled={!wordInput.trim()}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sentence Reading */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📝 Sentence Reading
                <Badge variant="secondary">Practice</Badge>
              </CardTitle>
              <CardDescription>
                Listen to proper sentence pronunciation and intonation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Sample Sentences:</h4>
                <div className="space-y-2">
                  {sampleSentences.map((sentence, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm">{sentence}</p>
                      </div>
                      <EnglishTTSButton 
                        text={sentence}
                        type="sentence"
                        iconOnly
                        className="shrink-0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paragraph Reading */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📖 Paragraph Reading
                <Badge variant="secondary">Comprehension</Badge>
              </CardTitle>
              <CardDescription>
                Listen to longer texts with natural flow and pacing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm leading-relaxed mb-3">{sampleParagraph}</p>
                <EnglishTTSButton 
                  text={sampleParagraph}
                  type="paragraph"
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Poetry Reading */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎭 Poetry Reading
                <Badge variant="secondary">Literature</Badge>
              </CardTitle>
              <CardDescription>
                Experience expressive reading with proper rhythm and emotion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <pre className="text-sm leading-relaxed mb-3 font-mono whitespace-pre-wrap">{samplePoem}</pre>
                <EnglishTTSButton 
                  text={samplePoem}
                  type="poem"
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Grammar Explanations */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📚 Grammar Explanations
                <Badge variant="secondary">Education</Badge>
              </CardTitle>
              <CardDescription>
                Clear explanations of English grammar concepts with educational tone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {grammarExplanations.map((explanation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm">{explanation}</p>
                    </div>
                    <EnglishTTSButton 
                      text={explanation}
                      type="grammar"
                      iconOnly
                      className="shrink-0"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Text Input */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✍️ Custom Text
                <Badge variant="secondary">Freestyle</Badge>
              </CardTitle>
              <CardDescription>
                Enter your own text to hear it spoken with perfect English pronunciation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter any English text you want to hear spoken..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2 flex-wrap">
                <EnglishTTSButton 
                  text={customText}
                  type="sentence"
                  disabled={!customText.trim()}
                >
                  Read as Sentence
                </EnglishTTSButton>
                <EnglishTTSButton 
                  text={customText}
                  type="paragraph"
                  disabled={!customText.trim()}
                >
                  Read as Paragraph
                </EnglishTTSButton>
                <EnglishTTSButton 
                  text={customText}
                  type="story"
                  disabled={!customText.trim()}
                >
                  Read as Story
                </EnglishTTSButton>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnglishTTSDemo;
