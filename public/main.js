const res_container = document.getElementById('res')
const emoji_input = document.getElementById('emoji-input')
const form = document.getElementById('input-form')
const ping = document.getElementById('ping')

const addMsg = (msg, prefix) => {
    const div = document.createElement('div')
    const now = new Date().toLocaleTimeString()
    const pfx = prefix ? `(${prefix}) ` : '(client)'
    div.innerText = `[${now}] ${pfx} ${msg}`
    res_container.appendChild(div)
    res_container.scrollTop = res_container.scrollHeight
}

const appendMessage = (id, msg, prefix) => {
    const now = new Date().toLocaleTimeString()
    const pfx = prefix ? `(${prefix}) ` : '(client)'
    const el = document.getElementById(id)
    if (!el) {
        const div = document.createElement('div')
        div.id = id
        res_container.appendChild(div)
        div.innerText = `[${now}] ${pfx} ${msg}`
    } else {
        el.innerText += msg
    }
    res_container.scrollTop = res_container.scrollHeight
}

let connectTime = new Date().getTime()
addMsg('connecting to socket')
const socket = io()

let pingInterval = null
let pingTime = null

socket.on('connect', () => {
    const now = new Date().getTime()
    const diff = now - connectTime
    addMsg(`connected (${diff}ms)`)

    pingInterval = setInterval(() => {
        pingTime = new Date().getTime()
        socket.emit('ping')
    }, 1000)
})

socket.on('pong', () => {
    const now = new Date().getTime()
    const diff = now - pingTime
    ping.innerText = `${diff}ms`
})

socket.on('error', (err) => {
    addMsg(err, 'error')
})

socket.on('disconnect', () => {
    addMsg('disconnected')
    clearInterval(pingInterval)
    connectTime = new Date().getTime()
})

socket.on('gpt-interpret-response', (data) => {
    const { id, content } = data
    appendMessage(id, content, 'server')
})

form.addEventListener('submit', (e) => {
    e.preventDefault()
    if (!socket.connected) {
        addMsg('not connected')
        return
    }

    const msg = emoji_input.value
    addMsg(msg)
    socket.emit('gpt-interpret-emoji', msg)
    emoji_input.value = ''
})
