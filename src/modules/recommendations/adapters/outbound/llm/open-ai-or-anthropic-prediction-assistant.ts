import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { z } from "zod";
import {
  AiCredentialsMissingError,
  ExternalServiceError,
  ValidationError,
} from "@/modules/shared/domain/errors";
import { parseMarketSlug } from "@/modules/shared/domain/market-slug";
import { Price } from "@/modules/shared/domain/price";
import type { Settings } from "@/modules/shared/application/settings";
import { OutcomeSide } from "@/modules/trading/domain/order";
import type { Recommendation } from "@/modules/recommendations/domain/recommendation";
import type {
  PredictionAssistant,
  RecommendationContext,
} from "@/modules/recommendations/application/ports/prediction-assistant";

const recommendationSchema = z.object({
  marketSlug: z.string().min(1),
  outcome: z.enum(["YES", "NO"]),
  confidence: z.number().min(0).max(1),
  rationale: z.string().min(1),
  suggestedLimitPrice: z.string().min(1),
});

export class OpenAiOrAnthropicPredictionAssistant implements PredictionAssistant {
  constructor(private readonly settings: Settings) {}

  async recommend(context: RecommendationContext): Promise<Recommendation> {
    const payload = await this.complete(buildPrompt(context));
    return parseRecommendation(payload, context);
  }

  private async complete(prompt: string): Promise<string> {
    if (this.settings.hasOpenAi && this.settings.openaiApiKey) {
      return this.completeOpenAi(prompt, this.settings.openaiApiKey);
    }
    if (this.settings.hasAnthropic && this.settings.anthropicApiKey) {
      return this.completeAnthropic(prompt, this.settings.anthropicApiKey);
    }
    throw new AiCredentialsMissingError();
  }

  private async completeOpenAi(prompt: string, apiKey: string): Promise<string> {
    try {
      const client = new OpenAI({ apiKey });
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a prediction-market assistant. Reply with JSON only.",
          },
          { role: "user", content: prompt },
        ],
      });
      const content = response.choices[0]?.message.content;
      if (!content) {
        throw new ExternalServiceError("OpenAI returned an empty recommendation");
      }
      return content;
    } catch (error) {
      if (error instanceof AiCredentialsMissingError || error instanceof ExternalServiceError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : "OpenAI request failed";
      throw new ExternalServiceError(message);
    }
  }

  private async completeAnthropic(prompt: string, apiKey: string): Promise<string> {
    try {
      const client = new Anthropic({ apiKey });
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        temperature: 0.2,
        messages: [{ role: "user", content: prompt }],
      });
      const text = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n");
      if (!text) {
        throw new ExternalServiceError("Anthropic returned an empty recommendation");
      }
      return text;
    } catch (error) {
      if (error instanceof AiCredentialsMissingError || error instanceof ExternalServiceError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : "Anthropic request failed";
      throw new ExternalServiceError(message);
    }
  }
}

function buildPrompt(context: RecommendationContext): string {
  const markets = context.candidates
    .map(
      (market) =>
        `- slug=${market.slug}; title=${market.title}; outcome=${market.outcome}`,
    )
    .join("\n");

  return `Choose the single best Polymarket US market and YES/NO outcome for this user request.

User request:
${context.prompt}

Candidate markets (you MUST pick a slug from this list):
${markets}

Return JSON with keys:
- marketSlug (exact slug from the list)
- outcome ("YES" or "NO")
- confidence (0 to 1)
- rationale (short, 2-4 sentences)
- suggestedLimitPrice (string between 0 and 1, e.g. "0.55")`;
}

function parseRecommendation(
  raw: string,
  context: RecommendationContext,
): Recommendation {
  const json = extractJson(raw);
  const parsed = recommendationSchema.safeParse(json);
  if (!parsed.success) {
    throw new ExternalServiceError("AI returned an invalid recommendation payload");
  }

  const slug = parseMarketSlug(parsed.data.marketSlug);
  const allowed = new Set(context.candidates.map((market) => market.slug));
  if (!allowed.has(slug)) {
    throw new ValidationError("AI selected a market that was not in the candidate list");
  }

  return {
    marketSlug: slug,
    outcome: parsed.data.outcome === "YES" ? OutcomeSide.YES : OutcomeSide.NO,
    confidence: parsed.data.confidence,
    rationale: parsed.data.rationale.trim(),
    suggestedLimitPrice: Price.parse(parsed.data.suggestedLimitPrice).toDecimalString(),
  };
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const payload = fenced?.[1] ?? trimmed;
  try {
    return JSON.parse(payload);
  } catch {
    throw new ExternalServiceError("AI response was not valid JSON");
  }
}
