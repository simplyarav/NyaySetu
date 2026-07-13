const { Groq } = require("groq-sdk");

async function generateCaseFacts(params, apiKey) {
  const groq = new Groq({ apiKey });
  
  const prompt = `Generate realistic legal case facts for an Indian court case.
Case Type: ${params.caseType}
Status: ${params.status}
Adjournments: ${params.adjournmentCount}

Return ONLY a valid JSON object with these keys:
- caseDescription (2-3 sentences explaining what happened)
- reliefSought (1 sentence what they are asking for)
- stuckReason (1 sentence why it's delayed)
- hearingNotes (array of 2 short strings for past hearings)`;

  try {
    const res = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(res.choices[0].message.content);
  } catch (err) {
    console.error("Groq generation failed:", err);
    return {
      caseDescription: `A typical ${params.caseType} case involving a dispute between the parties over standard issues.`,
      reliefSought: `Standard relief typical for ${params.caseType} cases.`,
      stuckReason: `Delayed due to routine procedural bottlenecks.`,
      hearingNotes: [`Initial hearing conducted`, `Review of documents`]
    };
  }
}

module.exports = { generateCaseFacts };
