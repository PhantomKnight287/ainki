"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { AnkiCardIcon } from "./icons";

interface AnkiCardData {
  type: "vocabulary" | "verb" | "phrase" | "grammar";
  front: string;
  back: string;
  context?: string;
  contextTranslation?: string;
  tags: string[];
  metadata?: {
    difficulty?: "beginner" | "intermediate" | "advanced";
    partOfSpeech?: string;
    conjugations?: Record<string, string>;
    gender?: "der" | "die" | "das";
    plural?: string;
    irregularForms?: Record<string, string>;
  };
  notes?: string;
}

interface AnkiCardCreatorProps {
  onCardCreated?: (card: AnkiCardData) => void;
  initialData?: Partial<AnkiCardData>;
}

export function AnkiCardCreator({ onCardCreated, initialData }: AnkiCardCreatorProps) {
  const [cardData, setCardData] = useState<AnkiCardData>({
    type: initialData?.type || "vocabulary",
    front: initialData?.front || "",
    back: initialData?.back || "",
    context: initialData?.context || "",
    contextTranslation: initialData?.contextTranslation || "",
    tags: initialData?.tags || [],
    metadata: initialData?.metadata || {},
    notes: initialData?.notes || "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardData.front.trim() || !cardData.back.trim()) {
      toast.error("Please fill in both front and back of the card");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/anki-cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cardData }),
      });

      if (!response.ok) {
        throw new Error("Failed to create Anki card");
      }

      const result = await response.json();
      
      toast.success(`✅ Anki card created: "${cardData.front}" → "${cardData.back}"`);
      
      if (onCardCreated) {
        onCardCreated(cardData);
      }

      // Reset form
      setCardData({
        type: "vocabulary",
        front: "",
        back: "",
        context: "",
        contextTranslation: "",
        tags: [],
        metadata: {},
        notes: "",
      });
    } catch (error) {
      console.error("Error creating Anki card:", error);
      toast.error("❌ Failed to create Anki card. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
    setCardData(prev => ({ ...prev, tags }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border">
      <div className="flex items-center gap-2 mb-6">
        <AnkiCardIcon size={24} />
        <h2 className="text-xl font-semibold">Create Language Learning Card</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Card Type</Label>
            <Select
              value={cardData.type}
              onValueChange={(value: AnkiCardData["type"]) =>
                setCardData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vocabulary">Vocabulary</SelectItem>
                <SelectItem value="verb">Verb</SelectItem>
                <SelectItem value="phrase">Phrase</SelectItem>
                <SelectItem value="grammar">Grammar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              value={cardData.metadata?.difficulty || "beginner"}
              onValueChange={(value: "beginner" | "intermediate" | "advanced") =>
                setCardData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, difficulty: value }
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="front">Target Language (Front)</Label>
          <Input
            id="front"
            value={cardData.front}
            onChange={(e) => setCardData(prev => ({ ...prev, front: e.target.value }))}
            placeholder="Enter the word or phrase in the target language"
            required
          />
        </div>

        <div>
          <Label htmlFor="back">Native Language (Back)</Label>
          <Input
            id="back"
            value={cardData.back}
            onChange={(e) => setCardData(prev => ({ ...prev, back: e.target.value }))}
            placeholder="Enter the translation in your native language"
            required
          />
        </div>

        <div>
          <Label htmlFor="context">Context Sentence (Target Language)</Label>
          <Textarea
            id="context"
            value={cardData.context}
            onChange={(e) => setCardData(prev => ({ ...prev, context: e.target.value }))}
            placeholder="Example sentence in the target language"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="contextTranslation">Context Translation</Label>
          <Textarea
            id="contextTranslation"
            value={cardData.contextTranslation}
            onChange={(e) => setCardData(prev => ({ ...prev, contextTranslation: e.target.value }))}
            placeholder="Example sentence in your native language"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={cardData.tags.join(", ")}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="spanish, noun, A1"
          />
        </div>

        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={cardData.notes}
            onChange={(e) => setCardData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional learning notes..."
            rows={2}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Creating Card..." : "Create Anki Card"}
        </Button>
      </form>
    </div>
  );
}
