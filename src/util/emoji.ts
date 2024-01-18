import cfg from './../../config.json'
import UNICODE_NAMES from './../data/unicode_names.json'
import { EmojiParseError } from './errors'

export interface ParsedEmoji {
    emoji: string
    codepoint: string
    name: string
}

const CODEPOINTS = Object.keys(UNICODE_NAMES)

export function getEmojiName(codepoint: string) {
    codepoint = codepoint.toUpperCase()
    if (!codepoint) return null
    if (!CODEPOINTS.includes(codepoint)) return null
    return UNICODE_NAMES[codepoint as keyof typeof UNICODE_NAMES]
}

export function parseEmojis(input: string): ParsedEmoji[] {
    const emojiRegex =
        /(?:[\p{Emoji_Presentation}\p{Emoji}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}][\u{200D}\u{FE0F}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]*)/gu
    const emojiList = Array.from(input.matchAll(emojiRegex), (match) => match[0])

    const MIN = cfg?.emojiCount?.min || 2
    const MAX = cfg?.emojiCount?.max || 5

    if (!emojiList || !emojiList.length) throw new EmojiParseError(`no emojis found in input`)
    if (emojiList.length < MIN || emojiList.length > MAX)
        throw new EmojiParseError(`emoji count must be between ${MIN} and ${MAX}`)

    const res = emojiList
        .map((emoji) => {
            if (!emoji.codePointAt(0)) throw new EmojiParseError('invalid emoji found')
            const codepoint = emoji.codePointAt(0)!.toString(16)
            const name = getEmojiName(codepoint)
            if (!name) return 'unknown'
            return {
                emoji,
                codepoint,
                name,
            }
        })
        .filter((emoji) => emoji !== null) as ParsedEmoji[]

    return res
}
