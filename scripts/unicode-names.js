const fs = require('fs')
const path = require('path')

const OUTPUT_PATH = path.join(__dirname, '..', 'src/data/unicode_names.json')
const UNICODE_DATA_URL = 'https://unicode.org/Public/UNIDATA/UnicodeData.txt'

// download unicode data
async function fetchData() {
    console.log('[fetch] downloading unicode data')
    const response = await fetch(UNICODE_DATA_URL)
    const data = await response.text()
    return data
}

// parse unicode data
async function parseData(data) {
    console.log('[parse] parsing unicode data')
    let lines = data.split('\n')

    console.log('[parse] parsing names...')

    let res = {}
    lines.forEach((line) => {
        const [code, name] = line.split(';')
        if (!code || !name) return
        res[code] = name.toLowerCase()
    })

    console.log(`[parse] ${Object.keys(res).length} names parsed`)
    return res
}

async function main() {
    const data = await fetchData()
    const parsedData = await parseData(data)
    const json = JSON.stringify(parsedData)

    console.log('[write] writing to', OUTPUT_PATH.split('/').pop())
    fs.writeFileSync(OUTPUT_PATH, json, {
        encoding: 'utf-8',
    })
}

main()
