const { GoogleGenAI } = require("@google/genai");

// Instantiate with API key (relies on GEMINI_API_KEY env var)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Whitelisted vibes mapped to style descriptors used to steer tone.
const VIBE_STYLES = {
  Fun: "Playful, upbeat, light tone. Include 1–2 fitting emojis.",
  Professional:
    "Concise, neutral, authoritative tone. Avoid slang. 0–1 tasteful emoji allowed.",
  Dramatic:
    "Cinematic, evocative, high-impact tone. 1–2 powerful emojis if fitting.",
  Minimal:
    "Ultra concise (max 8 words) and clean. Prefer NO emojis unless essential.",
  Adventurous:
    "Energetic, explorative, outdoorsy tone with subtle excitement. 1–2 emojis.",
  Wholesome: "Warm, positive, heartwarming tone. 1–2 gentle emojis.",
};

// Language configurations for multi-language support
const LANGUAGE_CONFIGS = {
  en: { name: "English", instruction: "Generate the caption in English." },
  es: {
    name: "Spanish",
    instruction: "Generate the caption in Spanish (Español).",
  },
  fr: {
    name: "French",
    instruction: "Generate the caption in French (Français).",
  },
  de: {
    name: "German",
    instruction: "Generate the caption in German (Deutsch).",
  },
  it: {
    name: "Italian",
    instruction: "Generate the caption in Italian (Italiano).",
  },
  pt: {
    name: "Portuguese",
    instruction: "Generate the caption in Portuguese (Português).",
  },
  ru: {
    name: "Russian",
    instruction: "Generate the caption in Russian (Русский).",
  },
  ja: {
    name: "Japanese",
    instruction: "Generate the caption in Japanese (日本語).",
  },
  ko: {
    name: "Korean",
    instruction: "Generate the caption in Korean (한국어).",
  },
  zh: {
    name: "Chinese",
    instruction: "Generate the caption in Chinese (中文).",
  },
  ar: {
    name: "Arabic",
    instruction:
      "Generate the caption in Arabic (العربية). Use appropriate RTL text formatting.",
  },
  hi: { name: "Hindi", instruction: "Generate the caption in Hindi (हिन्दी)." },
};

// Build a reusable system instruction template with language support.
function buildSystemInstruction(styleDescriptor, language = "en") {
  const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.en;

  return `You craft a SINGLE social-media-ready caption for an image.
Style Guidance: ${styleDescriptor}
Language: ${langConfig.instruction}
Hard Rules:
  - Output ONLY the caption text (no preface, no quotes, no numbering).
  - Base caption body BEFORE hashtags must be relevant and natural language.
  - Append 3 to 4 highly relevant, diverse hashtags at the END separated by single spaces.
  - Hashtags: short (<=18 chars), no repetition, no generic spam (#photo, #insta, #love) unless truly necessary.
  - For non-English languages, hashtags can be in English or the target language as appropriate.
  - Max 140 characters overall (unless Minimal vibe: max 100 characters to accommodate required hashtags).
  - Never invent personal or private details (names, locations) unless explicitly provided in extra context.
  - Avoid repeating words unless for deliberate stylistic effect.
  - No offensive, unsafe, or disallowed content.
  - Respect cultural context and appropriateness for the target language.
Formatting:
  - No surrounding quotation marks.
  - No trailing spaces.
  - Emojis (if any) should feel organic, not forced.
  - Ensure hashtags come last with a space before the first hashtag.
  - For RTL languages like Arabic, maintain proper text direction.`;
}

// Normalize and constrain model output.
function pickAdditionalHashtags(baseText, existing, needed) {
  // crude keyword extraction: take unique words excluding stopwords & existing hashtags
  const stop = new Set([
    "the",
    "and",
    "for",
    "with",
    "this",
    "that",
    "over",
    "under",
    "into",
    "from",
    "your",
    "been",
    "are",
    "was",
    "were",
    "a",
    "an",
    "on",
    "of",
    "in",
    "to",
    "it",
    "its",
    "is",
  ]);
  const words = baseText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const candidates = [];
  const seen = new Set();
  for (const w of words) {
    if (stop.has(w) || w.length < 3) continue;
    if (seen.has(w)) continue;
    if (existing.some((h) => h.toLowerCase() === "#" + w)) continue;
    seen.add(w);
    candidates.push(w);
  }
  const picked = [];
  for (const c of candidates) {
    if (picked.length >= needed) break;
    picked.push("#" + c.replace(/[^a-z0-9]/g, ""));
  }
  return picked;
}

function normalizeCaption(raw, { vibe }) {
  if (!raw) return "";
  let caption = raw.trim();
  caption = caption.replace(/^['"`]+|['"`]+$/g, "");

  // Split out hashtags if model already appended them
  const tokens = caption.split(/\s+/);
  const existingHashIdx = tokens.findIndex((t) => t.startsWith("#"));
  let body, hashes;
  if (existingHashIdx === -1) {
    body = caption;
    hashes = [];
  } else {
    body = tokens.slice(0, existingHashIdx).join(" ").trim();
    hashes = tokens
      .slice(existingHashIdx)
      .filter((t) => /^#[A-Za-z0-9_]+$/.test(t));
  }

  // Deduplicate & validate hashtags
  const seen = new Set();
  hashes = hashes.filter((h) => {
    const low = h.toLowerCase();
    if (seen.has(low)) return false;
    seen.add(low);
    return h.length <= 20; // keep short
  });

  // Trim to at most 4
  if (hashes.length > 4) hashes = hashes.slice(0, 4);

  // If fewer than 3, synthesize more from body
  if (hashes.length < 3) {
    const needed = 3 - hashes.length;
    hashes = hashes.concat(pickAdditionalHashtags(body, hashes, needed));
  }
  // If still fewer (body too small), duplicate a meaningful token mutated (last resort)
  if (hashes.length < 3) {
    while (hashes.length < 3) hashes.push("#photo");
  }

  // Ensure 3 or 4 hashtags: if only 3 and body is short we can try to add one more candidate
  if (hashes.length === 3) {
    const extra = pickAdditionalHashtags(body, hashes, 1);
    if (extra.length) hashes.push(extra[0]);
  }
  if (hashes.length > 4) hashes = hashes.slice(0, 4);

  // Character limit enforcement (exclude hashtags first)
  const limit = vibe === "Minimal" ? 100 : 140;
  if (body.length > limit - 10) {
    // leave room for hashtags
    const slicePoint = body.lastIndexOf(" ", limit - 10);
    const cutIndex = slicePoint > 30 ? slicePoint : limit - 10;
    body = body.slice(0, cutIndex).trimEnd();
    if (!/[.!?]$/.test(body)) body += ".";
  }

  // Reassemble
  let finalCaption = body.trim();
  // Remove any accidental trailing punctuation before hashtags duplication
  finalCaption = finalCaption.replace(/([#])+/g, "").trim();
  finalCaption = finalCaption.replace(/\s{2,}/g, " ");
  finalCaption = finalCaption + " " + hashes.join(" ");
  return finalCaption.trim();
}

/**
 * generateCaption
 * @param {string} base64ImageFile - Base64 (no data: prefix) representation of the image.
 * @param {Object} opts
 * @param {string} opts.vibe - One of the allowed vibe keys.
 * @param {string} opts.extraPrompt - Optional extra user context.
 * @returns {Promise<string>} Single caption string.
 */
async function generateCaption(
  base64ImageFile,
  { vibe = "Fun", extraPrompt = "", language = "en" } = {}
) {
  // Sanitize inputs
  const chosenVibe = VIBE_STYLES[vibe] ? vibe : "Fun";
  const styleDescriptor = VIBE_STYLES[chosenVibe];
  const chosenLanguage = LANGUAGE_CONFIGS[language] ? language : "en";
  let context = (extraPrompt || "").trim().replace(/\s+/g, " ");
  if (context.length > 180) context = context.slice(0, 180) + "…";

  const contents = [
    {
      inlineData: {
        mimeType: "image/jpeg", // Assume jpeg; upstream caller can ensure conversion if needed.
        data: base64ImageFile,
      },
    },
    {
      text: context
        ? `Extra context: ${context}`
        : "No extra context provided.",
    },
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: buildSystemInstruction(
          styleDescriptor,
          chosenLanguage
        ),
        temperature: 0.7,
        topK: 32,
        topP: 0.95,
      },
    });

    const raw = response.text || response.response?.text || "";
    const caption = normalizeCaption(raw, { vibe: chosenVibe });
    return caption;
  } catch (err) {
    console.error("AI caption generation failed:", err?.message || err);
    throw new Error("Failed to generate caption");
  }
}

module.exports = { generateCaption };
