import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { APP_TITLE } from "@/const";
import { Link } from "wouter";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function EquipmentDiagnosis() {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "機器のトラブルについて教えてください。例: 「ポンプが動きません」「センサーの値がおかしいです」",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [diagnosing, setDiagnosing] = useState(false);
  const [currentResult, setCurrentResult] = useState<any>(null);

  const diagnoseMutation = trpc.equipment.diagnose.useMutation({
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.診断段階 === "診断完了" 
          ? formatDiagnosisResult(data)
          : data.次の質問 || "診断を続けています...",
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentResult(data);
      setDiagnosing(false);
    },
    onError: (error) => {
      toast.error(`診断に失敗しました: ${error.message}`);
      setDiagnosing(false);
    },
  });

  const formatDiagnosisResult = (data: any) => {
    if (!data.診断結果 || !data.対処法) return "診断結果を取得できませんでした。";
    
    return `【診断完了】

機器: ${data.診断結果.機器}
推定原因: ${data.診断結果.推定原因}
信頼度: ${data.診断結果.信頼度}%
緊急度: ${data.診断結果.緊急度}

【対処法】
即時対応: ${data.対処法.即時対応}
応急処置: ${data.対処法.応急処置}
恒久対策: ${data.対処法.恒久対策}
専門家相談: ${data.対処法.専門家相談 ? "推奨" : "不要"}

${data.予防策 ? `【予防策】\n${data.予防策}` : ""}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) {
      toast.error("メッセージを入力してください");
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setDiagnosing(true);
    setInputMessage("");

    diagnoseMutation.mutate({
      message: inputMessage,
      sessionId,
    });
  };

  const handleNewDiagnosis = () => {
    setSessionId(undefined);
    setMessages([
      {
        role: "assistant",
        content: "機器のトラブルについて教えてください。例: 「ポンプが動きません」「センサーの値がおかしいです」",
      },
    ]);
    setCurrentResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-green-700">{APP_TITLE}</h1>
            <Link href="/">
              <Button variant="outline">ホームに戻る</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">⚙️ 機器トラブル診断</h2>

          <Card>
            <CardHeader>
              <CardTitle>対話形式で診断</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.role === "user"
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {diagnosing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                        <p className="text-gray-600">診断中...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {currentResult?.診断段階 === "診断完了" ? (
                <div className="space-y-4">
                  <Button
                    onClick={handleNewDiagnosis}
                    className="w-full"
                    variant="outline"
                  >
                    新規診断
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="症状や状況を入力してください"
                    disabled={diagnosing}
                  />
                  <Button type="submit" disabled={diagnosing}>
                    送信
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

