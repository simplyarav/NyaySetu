export function getCaseSummaryPrompt(caseData) {
  return `You are a legal assistant explaining a case in simple, clear language to a citizen.
Explain the following case details in 2-3 short, reassuring sentences, removing legal jargon.

Case Title: ${caseData.title}
Case Type: ${caseData.caseType}
Description: ${caseData.caseDescription}
Relief Sought: ${caseData.reliefSought}

Explain it simply:`;
}
