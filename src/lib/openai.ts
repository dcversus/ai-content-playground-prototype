import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})

export async function llmRequest(
  message: string,
  prompt: string,
  systemContext?: string
): Promise<string> {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'user', content: message },
      { role: 'system', content: `${BASE_PROMPT}\n${prompt}` },
      systemContext ? { role: 'assistant', content: systemContext } : undefined,
    ].filter(Boolean) as ChatCompletionMessageParam[],
    model: 'gpt-4-turbo-preview',
  })

  return (
    completion.choices[0].message.content || 'Ooops... something went wrong, please reset progress.'
  )
}

export async function llmSystemRequest<T>(
  prompt: string,
  schema: T,
  systemContext: string
): Promise<T> {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'user', content: prompt },
      { role: 'system', content: `${RESPONSE_SCHEMA_PROMPT}\nschema: ${JSON.stringify(schema)}` },
      { role: 'assistant', content: systemContext },
    ],
    model: 'gpt-4-turbo-preview',
  })

  const textResponse = completion.choices[0].message.content
  const filteredResponse = textResponse?.replace(/```json\n([\s\S]*)\n```/g, '$1')
  return JSON.parse(filteredResponse || '{}') as T
}

export async function generateImage(prompt: string): Promise<string> {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: `${BASE_IMAGE_PROMPT}\n${prompt}`,
    n: 1,
    size: '1024x1024',
  })

  return response.data[0].url || ''
}

const BASE_PROMPT = `
Use context for generating response, dont repeat yourself and strictly follow next instructions:
`

export const BASE_HISTORY_PROMPT = `
You are an AI assistant that always provides a concise JSON summary of the conversation what i will provide you instead user request.
For each interaction:
1. Summarize user requests with the key points as brief as possible.
2. Summarize your responses with their core suggestions, answers, or actions.
3. Maintain a chronological structure of interactions for full traceability.
4. use JSON format to return history of the conversation.
Additional Rules:
- Prioritize clarity, brevity, and accuracy.
- Do not skip any interaction.
- In user request i put your last response. Keep it in mind and answer with new history of iteractions.
- if its second same interaction, also left make point about it.

Next content what will be shown to user is:
`

const BASE_IMAGE_PROMPT = `

`

const RESPONSE_SCHEMA_PROMPT = `
You need to generate a response based on the schema.
Response should be parsed by JSON.parse() as is.
In user request will be a question, what you need fulfill with the schema.
Schema can be just a number or a string or an object. Follow it strictly.
`

export const NEXT_NODE_DECISION_PROMPT = `
I will provide you a list of nodes, where user can go next. With brief details included nodes dificulty.
Also current user level with a number from 1 to 10. Level 1 best to dificult 1 etc. But you should use it as a hint. Focus on the user aswers.
I will provide you a user context what can be helpful to make a decision.
Try to quess what we should show next to user.
You need to return only a number of the nodeIndex that user should go to.
Details:
`

export const SYSTEM_TEXT_PROMPT = `
You are a helpful assistant that generate text for education curse lesson or material based on a prompt.
Use all the markdown features.
Highlight important parts of the response with bold or italic like in nintendo games
Split pieces of the text into separate logicaly organized paragraphs. Try to avoid long paragraphs.
You are also given a context of the previous messages and you need to generate a text based on that context.
`

export const SYSTEM_QUIZ_PROMPT = `
Build a briefly quiz description based on a prompt:
`

export const SYSTEM_INPUT_PROMPT = `
You asking student about something. Provide a little help to him, but dont bore and just concentate to waiting his answer. Prompt for asking:
`

export const SYSTEM_CARDS_PROMPT = `
We asking student about something. Create brief question based on a prompt:
`

export const SYSTEM_FINISH_COURSE_PROMPT = `
Student has finished the course. Since then, doesnt include context about course to another contexts, just briefly summarize previus interactions and prepare for the next course
`
