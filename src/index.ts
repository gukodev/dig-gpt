import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import morgan from 'morgan'
import { nanoid } from 'nanoid'
import path from 'path'
import { Server } from 'socket.io'
import cfg from './../config.json'
import { EmojiParseError } from './util/errors'
import { interpretEmojis } from './util/gpt'
import log from './util/log'

const PORT = process.env.PORT || 3000
const WEB_UI = cfg.webUI === true

const app = express()
const server = createServer(app)
const io = new Server(server)

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

if (WEB_UI) {
    log.info('web ui enabled')
    app.get('/', (req, res) => {
        return res.status(200).sendFile(path.join(__dirname, './views/index.html'))
    })
}

app.get('/api/status', (req, res) => {
    return res.status(200).json({ status: 'ok' })
})

// list of socket ids that are generating
const GENERATING: string[] = []

io.on('connection', (socket) => {
    // here, socket is the user's socket
    log.info(`[connection] ${socket.id}`)

    socket.on('ping', () => {
        socket.emit('pong')
    })

    socket.on('gpt-interpret-emoji', async (data) => {
        if (typeof data !== 'string') return
        const miniUID = socket.id.slice(0, 6)
        if (GENERATING.includes(socket.id)) {
            log.warn(`[gpt-interpret-emoji] \`${miniUID}\` is already generating`)
            socket.emit('error', 'a request is already being processed, please wait')
            return
        }

        GENERATING.push(socket.id)
        const genId = nanoid().slice(0, 6)

        log.info(`[gpt-interpret-emoji] ${miniUID}: generating idea \`${genId}\``)

        interpretEmojis(data)
            .then(async (stream) => {
                let reply = ''
                for await (const chunk of stream) {
                    const content = chunk.choices[0].delta?.content
                    if (content) {
                        reply += content
                        socket.emit('gpt-interpret-response', {
                            id: genId,
                            content,
                        })
                    }
                }
                log.info(`[gpt-interpret-emoji] ${miniUID}: ${reply}`)
            })
            .catch((err) => {
                log.error(
                    `[gpt-interpret-emoji] ${miniUID}: an error ocurred while interpreting emojis, id \`${genId}\``
                )
                if (err instanceof EmojiParseError) {
                    log.error(`[gpt-interpret-emoji] ${miniUID}: ${err.message}`)
                    socket.emit('error', err.message)
                    return
                }
                console.error(err)
                socket.emit('error', 'an unknown error occurred')
            })
            .finally(() => {
                GENERATING.splice(GENERATING.indexOf(socket.id), 1)
            })
    })

    socket.on('disconnect', () => {
        log.info(`[disconnect] ${socket.id}`)
    })
})

server.listen(PORT, () => {
    log.info(`listening on http://localhost:${PORT}/`)
})
