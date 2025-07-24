export async function draftLegalDocument(prompt: string): Promise<string> {
  const apiKey = (import.meta as any).env.VITE_OPENAI_API_KEY;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful legal assistant that drafts professional legal documents.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1024,
      temperature: 0.2,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to generate document.');
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
} 