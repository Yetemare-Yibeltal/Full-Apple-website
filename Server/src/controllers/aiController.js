const { askClaude } = require("../config/ai");
const Product = require("../models/Product");
const Conversation = require("../models/Conversation");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../config/logger");

const STORE_CONTEXT = `You are the shopping assistant for an Apple-style tech store selling iPhone, iPad, Mac, Watch, TV, Music, and Accessories categories. Be concise, friendly, and helpful. Only recommend products from the "Available products" list given to you in context - never invent products, prices, or specs that weren't provided. If nothing in the list fits, say so honestly and suggest browsing a category instead.`;

/**
 * Finds a handful of currently active products that might be relevant to a
 * free-text query, using the text index on Product. Used to ground the AI's
 * answers in real inventory instead of letting it invent products.
 */
async function findRelevantProducts(text, limit = 8) {
  const results = await Product.find(
    { $text: { $search: text }, isActive: true },
    { score: { $meta: "textScore" } },
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .select("name slug category tagline basePrice startingPrice media");

  return results;
}

/**
 * @route   POST /api/ai/chat
 * @access  Public (works for guests via sessionId, and logged-in users)
 * body: { sessionId, message }
 */
const chatWithAssistant = asyncHandler(async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || !message) {
    return res
      .status(400)
      .json({ message: "sessionId and message are required." });
  }

  let conversation = await Conversation.findOne({ sessionId });
  if (!conversation) {
    conversation = await Conversation.create({
      sessionId,
      user: req.user?._id || null,
      messages: [],
    });
  }

  const relevantProducts = await findRelevantProducts(message);

  const productContext =
    relevantProducts.length > 0
      ? `Available products relevant to this query:\n${relevantProducts
          .map(
            (p) =>
              `- ${p.name} (${p.category}), from $${p.basePrice}: ${p.tagline || ""}`,
          )
          .join("\n")}`
      : "No closely matching products were found in the catalog for this query.";

  const history = conversation.messages
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content }));

  const reply = await askClaude({
    system: `${STORE_CONTEXT}\n\n${productContext}`,
    messages: [...history, { role: "user", content: message }],
  });

  conversation.messages.push({ role: "user", content: message });
  conversation.messages.push({
    role: "assistant",
    content: reply,
    recommendedProducts: relevantProducts.map((p) => p._id),
  });
  conversation.lastActivityAt = new Date();
  await conversation.save();

  res.status(200).json({
    reply,
    recommendedProducts: relevantProducts,
  });
});

/**
 * @route   GET /api/ai/chat/:sessionId
 * @access  Public
 * Lets the frontend restore a chat session's history on page reload.
 */
const getConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({
    sessionId: req.params.sessionId,
  });
  res.status(200).json({ messages: conversation ? conversation.messages : [] });
});

/**
 * @route   POST /api/ai/search
 * @access  Public
 * body: { query }
 * Asks Claude to translate a natural-language query into structured filters,
 * then runs a real MongoDB query with those filters.
 */
const naturalLanguageSearch = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ message: "query is required." });
  }

  const parserSystemPrompt = `You convert a shopper's natural-language product search into a strict JSON object with these optional keys: category (one of iphone, ipad, mac, watch, tv, music, accessories), maxPrice (number), minPrice (number), keywords (short string of key search terms). Respond with ONLY the JSON object, no other text, no markdown fences.`;

  const rawJson = await askClaude({
    system: parserSystemPrompt,
    messages: [{ role: "user", content: query }],
    maxTokens: 300,
  });

  let filters;
  try {
    filters = JSON.parse(rawJson.trim());
  } catch (err) {
    logger.warn(`[ai] Failed to parse search filter JSON: ${rawJson}`);
    filters = { keywords: query };
  }

  const mongoQuery = { isActive: true };
  if (filters.category) mongoQuery.category = filters.category;
  if (filters.minPrice || filters.maxPrice) {
    mongoQuery.basePrice = {};
    if (filters.minPrice) mongoQuery.basePrice.$gte = Number(filters.minPrice);
    if (filters.maxPrice) mongoQuery.basePrice.$lte = Number(filters.maxPrice);
  }
  if (filters.keywords) {
    mongoQuery.$text = { $search: filters.keywords };
  }

  const products = await Product.find(mongoQuery).limit(20);

  res.status(200).json({ products, interpretedFilters: filters });
});

/**
 * @route   POST /api/ai/generate-description
 * @access  Private/Admin
 * body: { name, category, highlights? }
 * Generates a tagline + description for the admin's Add Product form.
 * Does NOT save anything - the admin reviews and edits before submitting.
 */
const generateProductContent = asyncHandler(async (req, res) => {
  const { name, category, highlights = [] } = req.body;

  if (!name || !category) {
    return res.status(400).json({ message: "name and category are required." });
  }

  const system = `You write premium, Apple-style marketing copy for a tech product page. Respond with ONLY a JSON object with two keys: "tagline" (under 15 words, punchy) and "description" (2-3 sentences, benefit-focused). No markdown fences, no other text.`;

  const prompt = `Product name: ${name}\nCategory: ${category}\nKey highlights: ${
    highlights.length ? highlights.join(", ") : "none provided"
  }`;

  const rawJson = await askClaude({
    system,
    messages: [{ role: "user", content: prompt }],
    maxTokens: 400,
  });

  let content;
  try {
    content = JSON.parse(rawJson.trim());
  } catch (err) {
    logger.warn(`[ai] Failed to parse generated content JSON: ${rawJson}`);
    return res
      .status(502)
      .json({ message: "AI response could not be parsed. Please try again." });
  }

  res
    .status(200)
    .json({ tagline: content.tagline, description: content.description });
});

module.exports = {
  chatWithAssistant,
  getConversation,
  naturalLanguageSearch,
  generateProductContent,
};
