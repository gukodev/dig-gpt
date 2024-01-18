import 'dotenv/config'
import OpenAI from 'openai'
import cfg from './../../config.json'
import { chooseRandomItems } from './common'
import { ParsedEmoji, parseEmojis } from './emoji'
import log from './log'

const API_KEY = process.env.OPENAI_API_KEY
if (!API_KEY) {
    log.error('OPENAI_API_KEY is required')
    process.exit(1)
}

const BASE_URL = process.env.OPENAI_BASE_URL
if (!BASE_URL) {
    log.error('OPENAI_BASE_URL is required')
    process.exit(1)
}

const MAX_TOKENS = cfg?.gpt?.maxTokens || 24

const openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: 'http://127.0.0.1:8080/v1',
})

const examples = [
    '"👩🌻🔬" -> a woman examining a sunflower under a microscope',
    '"😃👘✌" -> a Japanese girl wearing a traditional kimono. She\'s smiling and making a V sign with her hands',
    '"🧚🦷🌃" -> a tooth fairy flying through a starry night sky',
    '"🧜‍♂️🏰🚀" -> a merman exploring a futuristic castle in space',
    '"🚀👾🍕" -> an alien enjoying a pizza on a rocket in outer space',
    '"🎭🐘🎪" -> a circus performer wearing a mask and riding on an elephant',
    '"🦸‍♂️🚴‍♀️🍩" -> a superhero riding a bicycle and enjoying a donut',
    '"🌈🏰🦄" -> a rainbow-colored castle with a unicorn in front of it',
    '"🕵️‍♂️🌲🔍" -> a detective investigating a mystery in a dense forest',
    '"👻🏚️🎹" -> a ghost playing the piano in an abandoned house',
    '"🧜‍♀️🎤🏖️" -> a mermaid singing on the beach',
]

const prompt = `
As an emoji-based drawing idea generator, I will create unique and imaginative drawing concepts based on the emojis you provide. These ideas will establish a connection between the emojis and form a coherent scene or character. The beauty of this exercise lies in its ability to produce unexpected and creative results. I will reply in a kind, friendly and funny way.

Examples (input -> output):
{EXAMPLES}
`.trim()

function getPrompt() {
    const items = chooseRandomItems(examples, 4)
    return prompt.replace('{EXAMPLES}', items.join('\n'))
}

function getUserPrompt(emojis: ParsedEmoji[]) {
    return emojis.map((emoji) => `${emoji.emoji} (${emoji.codepoint}) - ${emoji.name}`).join('\n')
}

export async function interpretEmojis(emojis: string) {
    const parsedEmojis = parseEmojis(emojis)
    const userPrompt = getUserPrompt(parsedEmojis)

    return openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            {
                role: 'assistant',
                content: getPrompt(),
            },
            {
                role: 'user',
                content: userPrompt,
            },
        ],
        max_tokens: MAX_TOKENS,
        stream: true,
    })
}
