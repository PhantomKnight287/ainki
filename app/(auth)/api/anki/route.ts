import { db } from "@/lib/db/client";
import { ankiCard } from "@/lib/db/schema";
import { and, desc } from "drizzle-orm";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  const page = parseInt(request.nextUrl.searchParams.get("page") ?? "1"); // defaults to 1
  const key = request.nextUrl.searchParams.get("key");
  console.log(key);
  if (key != process.env.API_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }
  const ankiCards = await db.query.ankiCard.findMany({
    orderBy: desc(ankiCard.createdAt),
    limit: 100,
    offset: (page - 1) * 100,
    columns: {
      userId: false,
      id: false,
    },
  });

  return Response.json(ankiCards);
};
