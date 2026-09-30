const suspiciousWords = [
  "verify", "urgent", "winner", "prize", "free", "claim", "password",
  "login", "account", "blocked", "suspended", "otp", "click", "limited",
  "refund", "bank", "gift", "crypto"
];

function analyze(input, type = "url") {
  const text = String(input || "").trim();
  const lower = text.toLowerCase();
  let score = 8;
  const indicators = [];

  if (!text) {
    return {
      score: 0,
      classification: "Unknown",
      confidence: 0,
      threatCategory: "Unknown",
      indicators: ["No input supplied"],
      recommendations: ["Enter a URL, email or message to scan."]
    };
  }

  if (type === "url") {
    if (!/^https:\/\//i.test(text)) {
      score += 12;
      indicators.push("URL does not use HTTPS");
    }
    if (/@/.test(text)) {
      score += 22;
      indicators.push("URL contains @, which can hide the real destination");
    }
    if (text.includes("xn--")) {
      score += 25;
      indicators.push("Internationalized/punycode domain detected");
    }
    if (/\d{5,}/.test(text)) {
      score += 8;
      indicators.push("Long numeric sequence in URL");
    }
    if ((text.match(/[.-]/g) || []).length > 6) {
      score += 8;
      indicators.push("Unusually complex URL structure");
    }
  }

  const hits = suspiciousWords.filter(w => lower.includes(w));
  if (hits.length) {
    score += Math.min(hits.length * 7, 35);
    indicators.push(`Suspicious language: ${hits.slice(0, 5).join(", ")}`);
  }

  if (/bit\.ly|tinyurl|t\.co|shorturl/i.test(text)) {
    score += 15;
    indicators.push("URL shortener detected");
  }

  if (/password|otp|cvv|card|bank/i.test(lower)) {
    score += 12;
    indicators.push("Requests sensitive financial/account information");
  }

  if (/click now|act now|within \d+ minutes|immediately/i.test(lower)) {
    score += 10;
    indicators.push("Strong urgency detected");
  }

  score = Math.min(100, score);
  const classification = score >= 70 ? "Phishing" : score >= 40 ? "Suspicious" : "Safe";
  const confidence = Math.min(98, Math.max(55, score + 15));
  const threatCategory =
    /otp|bank|cvv|card/.test(lower) ? "Credential / Financial Scam" :
    /winner|prize|gift|free/.test(lower) ? "Prize / Reward Scam" :
    /password|login|verify|account/.test(lower) ? "Credential Phishing" :
    "General Phishing";

  const recommendations = classification === "Safe"
    ? ["Still verify the sender and domain before sharing sensitive information.", "Do not reuse passwords."]
    : ["Do not click the link or reply with sensitive information.", "Verify the sender using an official channel.", "Enable MFA and report suspicious content to your organization/provider."];

  if (!indicators.length) indicators.push("No strong phishing indicators detected by the current rule set");

  return { score, classification, confidence, threatCategory, indicators, recommendations };
}

export default analyze;
