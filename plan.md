# Language Learning Anki Integration Plan

## Overview
Transform the existing AI chat app into a German language learning tool where users can generate Anki cards during conversations. The AI will use a tool to save cards to a database, which a separate microservice will process into Anki decks.

## Database Schema Changes

### New Table: `anki_cards`
```sql
CREATE TABLE anki_cards (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  card_data JSONB NOT NULL, -- Flexible storage for different card types
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP,
  anki_deck_id TEXT -- Optional: track which Anki deck this was added to
);
```

**JSON Schema for `card_data`:**
```json
{
  "type": "vocabulary|verb|phrase|grammar",
  "front": "German word/phrase",
  "back": "English translation/explanation",
  "context": "Example sentence in German",
  "context_translation": "Example sentence in English",
  "tags": ["german", "noun", "A1"],
  "metadata": {
    "difficulty": "beginner|intermediate|advanced",
    "part_of_speech": "noun|verb|adjective|etc",
    "conjugations": { // For verbs
      "ich": "esse",
      "du": "isst",
      "er/sie/es": "isst",
      "wir": "essen",
      "ihr": "esst",
      "sie/Sie": "essen"
    },
    "gender": "der|die|das", // For nouns
    "plural": "die Häuser", // For nouns
    "irregular_forms": {} // For irregular verbs/adjectives
  }
}
```

## AI Tool Implementation

### New Tool: `create_anki_card`
- **Purpose**: Allow AI to save Anki cards during chat conversations
- **Trigger**: User says something like "Create an Anki card for [word/phrase]"
- **Parameters**:
  - `type`: vocabulary|verb|phrase|grammar
  - `content`: The German word/phrase to learn
  - `context`: Optional example sentence
  - `notes`: Additional learning notes
- **Response**: Confirmation that card was saved, with card ID

### Tool Integration
- Add to existing AI tools in `lib/ai/tools/`
- Use the existing database connection via Drizzle
- Implement proper error handling and validation

## UI/UX Changes

### Chat Interface Modifications
1. **Anki Card Button**: Add a button in message actions to "Create Anki Card"
2. **Inline Triggers**: Detect phrases like "anki card for [word]" and offer quick creation
3. **Card Preview**: Show a preview of the card before saving
4. **Feedback**: Toast notification when card is successfully saved

### New Components Needed
- `AnkiCardCreator`: Modal/form for creating cards
- `AnkiCardPreview`: Component to show card front/back
- `AnkiCardHistory`: View saved cards (optional)

## Backend API Routes

### New Route: `/api/anki-cards`
- **POST**: Create new Anki card
- **GET**: Retrieve user's Anki cards (for history/review)
- **DELETE**: Remove card if needed

### Integration with Existing Chat API
- Modify chat API to handle Anki card creation tools
- Ensure tool calls are processed within chat context
- Maintain conversation flow when creating cards

## Microservice Integration

### Database Polling Service
- Separate microservice that polls `anki_cards` table
- Processes unprocessed cards (`processed = FALSE`)
- Converts JSON data to Anki card format
- Adds to user's Anki deck via AnkiConnect API
- Updates `processed = TRUE` and `processed_at` timestamp

### AnkiConnect Integration
- Use AnkiConnect plugin for direct Anki integration
- Handle different card types (Basic, Cloze, etc.)
- Support for custom note types with conjugation fields

## Implementation Phases

### Phase 1: Database & Tool Setup
1. Create `anki_cards` table migration
2. Implement `create_anki_card` tool
3. Add tool to AI provider configuration
4. Test tool functionality in chat

### Phase 2: UI Integration
1. Add Anki card creation UI to chat
2. Implement card preview and editing
3. Add success/error feedback
4. Style components to match existing design

### Phase 3: Microservice Development
1. Build polling service
2. Implement AnkiConnect integration
3. Add error handling and retry logic
4. Test end-to-end card creation to Anki

### Phase 4: Polish & Testing
1. Add comprehensive error handling
2. Implement card history/review features
3. Add analytics for card creation patterns
4. Write tests for all new functionality

## Security Considerations
- Validate JSON schema before saving to database
- Sanitize user input in card content
- Rate limiting for card creation
- User authentication for all Anki card operations

## Performance Considerations
- Index `user_id` and `processed` columns
- Implement pagination for card history
- Cache frequently accessed card data
- Optimize JSON queries for complex card types

## Future Enhancements
- Bulk card import/export
- Card difficulty tracking
- Spaced repetition statistics
- Integration with other language learning platforms
- Voice pronunciation for cards