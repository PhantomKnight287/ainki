import { AnkiCardCreator } from "@/components/anki-card-creator";

export default function AnkiPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Language Learning with Anki</h1>
          <p className="text-gray-600">
            Create Anki cards for vocabulary, verbs, phrases, and grammar concepts in any language.
            These cards will be automatically synced to your Anki deck for spaced repetition learning.
          </p>
        </div>

        <AnkiCardCreator />
        
        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">How it works:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Create Anki cards using the form above or ask the AI assistant to create them during chat</li>
            <li>Cards are saved to your personal collection in the database</li>
            <li>A background service processes unprocessed cards and syncs them to Anki via AnkiConnect</li>
            <li>Study your cards using Anki's spaced repetition system</li>
          </ol>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Try it in chat!</h2>
          <p className="text-gray-700 mb-4">
            You can also create Anki cards directly in the chat by asking the AI assistant:
          </p>
          <div className="bg-white p-4 rounded border-l-4 border-blue-500">
            <p className="font-mono text-sm text-gray-600">
              "Create an Anki card for the Spanish word 'casa' which means 'house'"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
