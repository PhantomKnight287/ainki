import { tool, UIMessageStreamWriter } from "ai";
import { z } from "zod";
import type { Session } from "@/lib/db/schema";
import { saveAnkiCard } from "@/lib/db/queries";

type CreateAnkiCardProps = {
  session: Session;
  writer:UIMessageStreamWriter
};

// Define the schema for card metadata based on the plan
const cardMetadataSchema = z.object({
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  partOfSpeech: z.string().optional(),
  conjugations: z.record(z.string()).optional(), // For verbs
  gender: z.string().optional(), // For nouns (can be any gender system: der/die/das, el/la, le/la, etc.)
  plural: z.string().optional(), // For nouns
  irregularForms: z.record(z.string()).optional(), // For irregular verbs/adjectives
  tones: z.array(z.number()).optional(), // For tonal languages like Chinese
  particles: z.array(z.string()).optional(), // For languages like Japanese
  pronunciation: z.string().optional(), // Phonetic pronunciation
  etymology: z.string().optional(), // Word origin/history
});

const createAnkiCardSchema = z.object({
  type: z.enum(["vocabulary", "verb", "phrase", "grammar"]),
  front: z.string().describe("The word, phrase, or concept to learn (in the target language)"),
  back: z.string().describe("The translation or explanation (in the user's native language)"),
  context: z.string().optional().describe("Example sentence in the target language"),
  contextTranslation: z.string().optional().describe("Example sentence in the user's native language"),
  tags: z.array(z.string()).default([]).describe("Tags for categorization (include the target language name)"),
  metadata: cardMetadataSchema.describe("Additional metadata for the card"),
  notes: z.string().optional().describe("Additional learning notes"),
});

export const createAnkiCard = ({ session,writer }: CreateAnkiCardProps) =>
  tool({
    description:
      "Create an Anki card for language learning. Use this when the user wants to save a word, phrase, verb, or grammar concept in any language for spaced repetition practice.",
    inputSchema: createAnkiCardSchema,
    async *execute(input,{toolCallId,}) {
      try {
        // Step 1: Validate input


        yield {
          status: 'loading' as const,
          text: 'Validating card data...',
          cardId: undefined,
          card: undefined,
        };

        const validatedInput = createAnkiCardSchema.parse(input);

        // Step 2: Structure the card data
        yield {
          status: 'loading' as const,
          text: `Preparing ${validatedInput.type} card for "${validatedInput.front}"...`,
          cardId: undefined,
          card: undefined,
        };

        const cardData = {
          type: validatedInput.type,
          front: validatedInput.front,
          back: validatedInput.back,
          context: validatedInput.context,
          context_translation: validatedInput.contextTranslation,
          tags: validatedInput.tags,
          metadata: validatedInput.metadata || {},
          notes: validatedInput.notes,
        };

        // Step 3: Save to database
        yield {
          status: 'loading' as const,
          text: 'Saving card to database...',
          cardId: undefined,
          card: undefined,
        };

        const savedCard = await saveAnkiCard({
          userId: session.userId,
          cardData,
        });

        // Step 4: Success
        yield {
          status: 'success' as const,
          text: `✅ Anki card created successfully! "${validatedInput.front}" → "${validatedInput.back}"`,
          cardId: savedCard.id,
          card: {
            type: validatedInput.type,
            front: validatedInput.front,
            back: validatedInput.back,
            context: validatedInput.context,
            tags: validatedInput.tags,
          },
        };

      } catch (error) {
        console.error("Error creating Anki card:", error);

        yield {
          status: 'error' as const,
          text: "❌ Sorry, I couldn't create the Anki card. Please try again.",
          cardId: undefined,
          card: undefined,
          error: error instanceof Error ? error.message : "Failed to create Anki card",
        };
      }
    },
  });
