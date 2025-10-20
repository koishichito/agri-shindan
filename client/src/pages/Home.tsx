import { Link } from "wouter";
import { APP_TITLE } from "@/const";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl">🌱</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{APP_TITLE}</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            養液栽培遠隔支援システム
          </h2>
          <p className="text-lg text-gray-600">
            AIを活用した植物病害診断と機器トラブル診断で、あなたの農業をサポートします
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
          <Link href="/plant">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-yellow-200">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">植物病害診断</h3>
              <p className="text-gray-600 mb-6">
                植物の画像をアップロードして、病害や害虫、栄養欠乏を診断します。
              </p>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                診断を始める
              </button>
            </div>
          </Link>

          <Link href="/equipment">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-blue-200">
              <div className="text-6xl mb-4">⚙️</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">機器トラブル診断</h3>
              <p className="text-gray-600 mb-6">
                養液栽培システムの機器トラブルを対話形式で診断します。
              </p>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                診断を始める
              </button>
            </div>
          </Link>
        </div>

        <div className="max-w-5xl mx-auto">
          <Link href="/history">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-purple-200">
              <div className="flex items-center gap-4">
                <div className="text-6xl">📊</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">診断履歴</h3>
                  <p className="text-gray-600">
                    過去の診断結果を確認できます。
                  </p>
                </div>
                <button className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                  履歴を見る
                </button>
              </div>
            </div>
          </Link>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          © 2025 養液栽培遠隔支援システム. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

