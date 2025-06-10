
/**
 * Service for handling OpenAI API interactions specifically for English conversation practice
 */

interface EnglishConversationOptions {
  apiKey: string;
  model?: string;
  temperature?: number;
}

export const processEnglishConversation = async (
  message: string, 
  options: EnglishConversationOptions
): Promise<string> => {
  const { apiKey, model = 'gpt-4-0125-preview', temperature = 0.7 } = options;
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are an English conversation practice assistant. Respond to the user in a way that helps them practice their English speaking skills. Provide constructive feedback on grammar or pronunciation if appropriate, but keep the conversation flowing naturally."
          },
          { role: "user", content: message }
        ],
        temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in English conversation:', error);
    throw error;
  }
};
