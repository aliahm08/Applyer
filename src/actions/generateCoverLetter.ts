"use server"

function buildFallbackCoverLetter(company: string, role: string) {
    return `Dear Hiring Team at ${company},

I am writing to express my interest in the ${role} position. My background combines product-minded software development, fast iteration, and a bias toward shipping polished tools that solve concrete user problems.

I am particularly drawn to ${company}'s focus on building ambitious products with clear real-world impact. In previous work, I have contributed across the stack, translated ambiguous requirements into reliable features, and moved quickly without losing attention to code quality, maintainability, or user experience.

For this role, I would bring strong ownership, clear communication, and the ability to learn new systems quickly. I am comfortable working across frontend and backend surfaces, collaborating with cross-functional partners, and refining details until the final product feels deliberate and production-ready.

I would welcome the opportunity to contribute that mindset to ${company}. Thank you for your time and consideration.

Sincerely,
Ali Ahmad`
}

export async function generateCoverLetter(company: string, role: string) {
    const apiKey = process.env.OLLAMA_API_KEY?.trim();
    const baseUrl = process.env.OLLAMA_BASE_URL?.trim();
    const model = process.env.OLLAMA_MODEL?.trim() || "llama3";

    if (!baseUrl) {
        return buildFallbackCoverLetter(company, role)
    }

    const prompt = `Write a professional cover letter for a ${role} position at ${company}. Keep it concise, professional, highlighting technical skills, and matching the tone of a high-end tech applicant. Do not include conversational filler before or after the letter, just return the raw cover letter text.`;

    try {
        const response = await fetch(`${baseUrl}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            },
            body: JSON.stringify({
                model,
                prompt,
                stream: false,
            }),
            cache: "no-store",
        });

        if (!response.ok) {
            throw new Error(`LLM API returned ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        return typeof data.response === "string" && data.response.trim()
            ? data.response
            : buildFallbackCoverLetter(company, role)
    } catch (error) {
        console.error("Cover letter generation failed:", error);
        return buildFallbackCoverLetter(company, role)
    }
}
