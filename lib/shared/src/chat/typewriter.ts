interface Typewriter {
    /**
     * Push new text to the typewriter to emit over time.
     * Text should be incremental but still include the previous text. E.g. "Hel" -> "Hello" -> "Hello, world!"
     */
    write: (incomingText: string) => void
    /** Stop the typewriter, immediately emit any remaining text */
    stop: () => void
}

interface CreateTypewriterParams {
    /**
     * Callback to call every time a new character is emitted
     */
    emit: (text: string) => void
}

// Maximum/minimum amount of time to wait between character chunks
const MAX_DELAY_MS = 200
const MIN_DELAY_MS = 5

const MIN_CHAR_CHUNK_SIZE = 1

export const createTypewriter = ({ emit }: CreateTypewriterParams): Typewriter => {
    let fullText = ''
    let processedText = ''
    let interval: ReturnType<typeof setInterval> | undefined

    return {
        write: (updatedText: string) => {
            /** Keep text in sync with the latest update, so consumers can choose to `stop` early. */
            fullText = updatedText

            /**
             * If we already have an interval running, stop it to avoid stacking
             * multiple intervals on top of each other.
             */
            if (interval) {
                clearInterval(interval)
                interval = undefined
            }

            /**
             * Calculate the delay from the remaining characters we know we have left to process
             * This ensures that the typewriter effect will speed up if we start to fall behind.
             */
            const calculatedDelay = MAX_DELAY_MS / (updatedText.length - processedText.length)

            /**
             * We limit how small our delay can be to ensure we always have some form of typing effect.
             */
            const dynamicDelay = Math.max(calculatedDelay, MIN_DELAY_MS)

            /**
             * To ensure we still can keep up with the updated text, we instead increase the character chunk size.
             * We calculate this by working out how many characters we would need to maintain the same minimum delay.
             * This ensures we always keep up with the text, no matter how large the incoming chunks are.
             *
             * Note: For particularly large chunks, this will result in a character chunk size that is far bigger than you would expect for a typing effect.
             * This is an accepted trade-off in order to ensure we stay in sync with the incoming text.
             */
            const charChunkSize =
                calculatedDelay < MIN_DELAY_MS ? Math.round(MIN_DELAY_MS / calculatedDelay) : MIN_CHAR_CHUNK_SIZE

            interval = setInterval(() => {
                processedText += updatedText.slice(processedText.length, processedText.length + charChunkSize)

                /** Clean up when we have reached the end of the known remaining text. */
                if (processedText.length === updatedText.length && interval) {
                    clearInterval(interval)
                    interval = undefined
                }

                return emit(processedText)
            }, dynamicDelay)
        },
        stop: () => {
            if (interval) {
                clearInterval(interval)
                interval = undefined
            }
            return emit(fullText)
        },
    }
}
