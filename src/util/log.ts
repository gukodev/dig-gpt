import chalk from "chalk"

const log = makeLogger()

function makeLogger() {
    const PREFIX = chalk.magenta('(dig-gpt)')

    const info = (...args: any[]) => {
        console.log(`${PREFIX} ${chalk.cyan('[info]')} ${args.join(' ')}`)
    }

    const warn = (...args: any[]) => {
        console.warn(`${PREFIX} ${chalk.yellow('[warn]')} ${args.join(' ')}`)
    }

    const error = (...args: any[]) => {
        console.error(`${PREFIX} ${chalk.red('[error]')} ${args.join(' ')}`)
    }

    return {
        info,
        warn,
        error,
    }
}

export default log