import { headers } from "next/headers";
import { auth } from "@/auth";
import {
  deleteAnkiCard,
  getAnkiCardsByUserId,
  saveAnkiCard,
} from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

// GET /api/anki-cards - Retrieve user's Anki cards
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const processed = searchParams.get("processed");

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return new ChatSDKError("unauthorized:anki-cards").toResponse();
  }

  try {
    const cards = await getAnkiCardsByUserId({
      userId: session.user.id,
      limit,
      processed: processed ? processed === "true" : undefined,
    });

    return Response.json({ cards }, { status: 200 });
  } catch (error) {
    console.error("Error fetching Anki cards:", error);
    return new ChatSDKError(
      "bad_request:database",
      "Failed to fetch Anki cards"
    ).toResponse();
  }
}

// POST /api/anki-cards - Create new Anki card
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return new ChatSDKError("unauthorized:anki-cards").toResponse();
  }

  try {
    const { cardData }: { cardData: Record<string, any> } = await request.json();

    if (!cardData) {
      return new ChatSDKError(
        "bad_request:api",
        "Card data is required"
      ).toResponse();
    }

    // Validate required fields
    if (!cardData.type || !cardData.front || !cardData.back) {
      return new ChatSDKError(
        "bad_request:api",
        "Card data must include type, front, and back fields"
      ).toResponse();
    }

    const savedCard = await saveAnkiCard({
      userId: session.user.id,
      cardData,
    });

    return Response.json({ card: savedCard }, { status: 201 });
  } catch (error) {
    console.error("Error creating Anki card:", error);
    return new ChatSDKError(
      "bad_request:database",
      "Failed to create Anki card"
    ).toResponse();
  }
}

// DELETE /api/anki-cards?id=cardId - Delete specific Anki card
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get("id");

  if (!cardId) {
    return new ChatSDKError(
      "bad_request:api",
      "Card ID is required"
    ).toResponse();
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return new ChatSDKError("unauthorized:anki-cards").toResponse();
  }

  try {
    // First verify the card belongs to the user
    const userCards = await getAnkiCardsByUserId({
      userId: session.user.id,
      limit: 1000, // Get all cards to check ownership
    });

    const cardExists = userCards.some((card) => card.id === cardId);
    if (!cardExists) {
      return new ChatSDKError(
        "not_found:anki-cards",
        "Card not found or access denied"
      ).toResponse();
    }

    const deletedCard = await deleteAnkiCard({ cardId });

    if (deletedCard.length === 0) {
      return new ChatSDKError(
        "not_found:anki-cards",
        "Card not found"
      ).toResponse();
    }

    return Response.json({ success: true, deletedCard: deletedCard[0] }, { status: 200 });
  } catch (error) {
    console.error("Error deleting Anki card:", error);
    return new ChatSDKError(
      "bad_request:database",
      "Failed to delete Anki card"
    ).toResponse();
  }
}
