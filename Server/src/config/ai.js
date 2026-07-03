const Anthropic = require("@anthropic-ai/sdk");
const logger = require("./logger");

if (!process.env.ANTHROPIC_API_KEY) {
  logger.warn(
    "[ai] ANTHROPIC_API_KEY is not set. AI features will fail until it is configured.",
  );
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const AI_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
const AI_MAX_TOKENS = Number(process.env.AI_MAX_TOKENS) || 1024;

/**
 * Sends a single-turn or multi-turn request to Claude and returns the
 * plain text of the response. Used by aiController.js for the shopping
 * assistant, natural-language search parsing, and description generation.
 *
 * @param {Object} options
 * @param {string} options.system - system prompt describing the assistant's role
 * @param {Array<{role: 'user'|'assistant', content: string}>} options.messages
 * @param {number} [options.maxTokens]
 */
async function askClaude({ system, messages, maxTokens = AI_MAX_TOKENS }) {
  try {
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: maxTokens,
      system,
      messages,
    });

    const textBlock = response.content.find((block) => block.type === "text");
    return textBlock ? textBlock.text : "";
  } catch (err) {
    logger.error(`[ai] Anthropic request failed: ${err.message}`);
    throw new Error("AI service is temporarily unavailable. Please try again.");
  }
}

module.exports = { anthropic, askClaude, AI_MODEL, AI_MAX_TOKENS };
