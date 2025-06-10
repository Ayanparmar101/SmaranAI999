
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

const formSchema = z.object({
  message: z.string().min(1, {
    message: 'Message cannot be empty.',
  }),
});

interface MessageInputProps {
  loading: boolean;
  onSubmit: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ loading, onSubmit }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const message = values.message.trim();
    if (!message) return;
    
    onSubmit(message);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex space-x-2 items-end">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  placeholder="Type your message..."
                  {...field}
                  disabled={loading}
                  className="rounded-full bg-muted text-foreground text-base sm:text-sm min-h-[44px]"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading}
          className="rounded-full bg-kid-purple hover:bg-purple-700 min-h-[44px] min-w-[44px] flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
};

export default MessageInput;
