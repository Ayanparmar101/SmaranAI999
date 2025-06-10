
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Key, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { globalState } from '@/utils/globalState';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  onApiKeySubmit
}) => {
  const [apiKey, setApiKey] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (envApiKey && envApiKey.trim() !== '') {
      // If environment variable is set, use it and don't show dialog
      onApiKeySubmit(envApiKey);

      // Only show the message once globally to prevent spam
      if (!globalState.hasShownEnvironmentMessage()) {
        toast.success('Using OpenAI API key from environment variables');
        globalState.markEnvironmentMessageShown();
      }
      // Don't show the dialog at all when env key is present
      setOpen(false);
    } else {
      // Check localStorage as fallback (try both possible keys)
      const savedApiKey = localStorage.getItem('openai-api-key') || localStorage.getItem('openaiApiKey');
      if (savedApiKey) {
        onApiKeySubmit(savedApiKey);
        setOpen(false);
      } else {
        // No key found anywhere, show input dialog
        setOpen(true);
      }
    }
  }, [onApiKeySubmit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error('Please enter your API key.');
      return;
    }

    // Validate API key format - support both standard and project API keys
    if (!(apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-')) || apiKey.length < 20) {
      toast.error('Please enter a valid OpenAI API key starting with "sk-" or "sk-proj-"');
      return;
    }

    localStorage.setItem('openai-api-key', apiKey);
    onApiKeySubmit(apiKey);
    setOpen(false);
    
    if (apiKey.startsWith('sk-proj-')) {
      toast.success('Project API key saved successfully!');
    } else {
      toast.success('API key saved successfully!');
    }
  };

  // Don't render anything if environment variable is set
  const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (envApiKey && envApiKey.trim() !== '') {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter your OpenAI API Key</DialogTitle>
            <DialogDescription>
              Your API key is stored locally on your device and is never sent to our servers.
              You can get an API key from the{" "}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-blue-500 underline">
                OpenAI dashboard
              </a>.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive" className="my-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              For production use, we recommend setting the VITE_OPENAI_API_KEY environment variable
              instead of using this form. Create a .env file at the root of your project with:
              <code className="block bg-muted p-2 mt-2 rounded text-sm">
                VITE_OPENAI_API_KEY=your_api_key_here
              </code>
            </AlertDescription>
          </Alert>

          <Alert className="my-4 bg-blue-50">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription>
              Both standard API keys (starting with <code className="bg-muted p-1 rounded text-sm">sk-</code>) and
              project API keys (starting with <code className="bg-muted p-1 rounded text-sm">sk-proj-</code>) are supported.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  id="apiKey"
                  placeholder="sk-... or sk-proj-..."
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Save API Key</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApiKeyInput;
