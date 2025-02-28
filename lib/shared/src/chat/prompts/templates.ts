const selection_prompt = `
I have questions about this selected {languageName} code from {fileName}:
\`\`\`
{selectedText}
\`\`\`
`

const instruction_prompt = `Please follow these rules when answering my question:
- Your answers and suggestions should based on the shared context only.
- Do not suggest anything that would break the working code.
- Do not make assumptions or fabricating additional details.
- All generated code should be full workable code.

Questions: {humanInput}
`
const prevent_hallucinations =
    "Answer the questions only if you know the answer or can make a well-informed guess, else tell me you don't know it."

export const answers = {
    terminal: 'Noted. I will answer your next question based on this terminal output with the code you just shared.',
    selection: 'Noted. I will refer to this code you selected in the editor to answer your question.',
}

export const prompts = {
    selection: selection_prompt,
    instruction: instruction_prompt,
}

export const rules = {
    hallucination: prevent_hallucinations,
}
