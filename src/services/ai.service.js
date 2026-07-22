import { openai } from "../config/openai.js"

export const generateCoverLetter = async (application) => {
    const { companyName, position, location, notes } = application

    const userPrompt = `
    Write a concise, professional 3-paragraph cover letter for the following job application:
    - Position: ${position}
    - Company: ${companyName}
    ${location ? `- Location: ${location}` : ""}
    ${notes ? `- Additional Context/Notes: ${notes}` : ""}

    Keep the tone confident, tailored, and enthusiastic. Do not use generic placeholders.
    `

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "You are an expert career coach and professional cover letter writer."
            },
            {
                role: "user",
                content: userPrompt
            }
        ],
        temperature: 0.7
    })

    return response.choices[0].message.content
}
