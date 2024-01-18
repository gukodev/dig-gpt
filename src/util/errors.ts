export class EmojiParseError extends Error {
    constructor(msg?: string) {
        super()
        this.name = 'EmojiParseError'
        this.message = msg || 'invalid emoji input'
    }
}
