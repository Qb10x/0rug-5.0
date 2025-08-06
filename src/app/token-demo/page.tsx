import { TokenCardPanel } from '@/components/trading/TokenCardPanel';

export default function TokenDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Token Card Panel Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Scrollable token cards with expandable sections and rich metrics
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <TokenCardPanel />
        </div>
      </div>
    </div>
  );
} 