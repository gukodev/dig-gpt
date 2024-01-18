export function chooseRandomItems<T>(array: T[], count: number): T[] {
    if (count > array.length) {
        throw new Error('Count cannot be greater than the array length')
    }

    const shuffledArray = array.slice()
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]
    }

    return shuffledArray.slice(0, count)
}
