import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-6">
            Live Air-Writing
          </h1>
          <h2 className="text-4xl font-bold text-white mb-4">
            Alphabet Recognition System
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Write letters in the air using your index finger and see real-time predictions powered by MediaPipe hand tracking
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-6 border border-blue-700">
            <div className="text-4xl mb-3">✋</div>
            <h3 className="text-xl font-semibold text-white mb-2">Hand Tracking</h3>
            <p className="text-blue-200">MediaPipe Hands tracks your index finger in real-time</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-2xl p-6 border border-purple-700">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-semibold text-white mb-2">Live Prediction</h3>
            <p className="text-purple-200">Predictions update every 300ms while you draw</p>
          </div>

          <div className="bg-gradient-to-br from-pink-900 to-pink-800 rounded-2xl p-6 border border-pink-700">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">Rule-Based</h3>
            <p className="text-pink-200">Smart shape detection algorithms recognize letters</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            href="/air-writing"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Start Air-Writing →
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-gray-800 bg-opacity-50 rounded-2xl p-8 border border-gray-700">
          <h3 className="text-2xl font-semibold text-white mb-4">How It Works</h3>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start">
              <span className="text-blue-400 font-bold mr-3">1.</span>
              <span>Grant camera permissions when prompted</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 font-bold mr-3">2.</span>
              <span>Point your index finger at the camera</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 font-bold mr-3">3.</span>
              <span>Draw letters in the air - predictions appear instantly</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 font-bold mr-3">4.</span>
              <span>Click "Clear" to start a new letter</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
