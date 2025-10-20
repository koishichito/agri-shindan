import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { APP_TITLE } from "@/const";
import { Link } from "wouter";

export default function PlantDiagnosis() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [description, setDescription] = useState("");
  const [cropType, setCropType] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [ec, setEc] = useState("");
  const [diagnosing, setDiagnosing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [followUpAnswer, setFollowUpAnswer] = useState("");
  const [askingFollowUp, setAskingFollowUp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const diagnoseMutation = trpc.plant.diagnose.useMutation({
    onSuccess: (data) => {
      setResult(data);
      toast.success("診断が完了しました");
      setDiagnosing(false);
    },
    onError: (error) => {
      toast.error(`診断に失敗しました: ${error.message}`);
      setDiagnosing(false);
    },
  });

  const followUpMutation = trpc.plant.followUp.useMutation({
    onSuccess: (data) => {
      setFollowUpAnswer(data.answer);
      setAskingFollowUp(false);
    },
    onError: (error) => {
      toast.error(`質問の送信に失敗しました: ${error.message}`);
      setAskingFollowUp(false);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) {
      toast.error("画像を選択してください");
      return;
    }

    setDiagnosing(true);
    setResult(null);
    setFollowUpAnswer("");

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      
      diagnoseMutation.mutate({
        imageData: base64,
        description: description || undefined,
        cropType: cropType || undefined,
        temperature: temperature ? parseFloat(temperature) : undefined,
        humidity: humidity ? parseFloat(humidity) : undefined,
        ec: ec ? parseFloat(ec) : undefined,
      });
    };
    reader.readAsDataURL(imageFile);
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!followUpQuestion.trim()) {
      toast.error("質問を入力してください");
      return;
    }

    setAskingFollowUp(true);
    setFollowUpAnswer("");

    followUpMutation.mutate({
      diagnosisResult: result,
      question: followUpQuestion,
    });
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
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🌱 植物病害診断</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>画像と情報を入力</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="image">植物の画像 *</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="mt-1"
                    />
                    {imagePreview && (
                      <div className="mt-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cropType">作物種類</Label>
                    <Input
                      id="cropType"
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                      placeholder="例: トマト、キュウリ"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">症状の説明</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="気になる症状を詳しく記入してください"
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="temperature">温度 (°C)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        placeholder="25"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="humidity">湿度 (%)</Label>
                      <Input
                        id="humidity"
                        type="number"
                        value={humidity}
                        onChange={(e) => setHumidity(e.target.value)}
                        placeholder="60"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ec">EC値</Label>
                      <Input
                        id="ec"
                        type="number"
                        step="0.1"
                        value={ec}
                        onChange={(e) => setEc(e.target.value)}
                        placeholder="1.5"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={diagnosing || !imageFile}
                  >
                    {diagnosing ? "診断中..." : "診断する"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>診断結果</CardTitle>
              </CardHeader>
              <CardContent>
                {diagnosing && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">AIが診断中です...</p>
                  </div>
                )}

                {result && !diagnosing && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">診断結果</h3>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">作物</p>
                        <p className="font-bold text-lg">{result.作物}</p>
                        <p className="text-sm text-gray-600 mt-2">診断</p>
                        <p className="font-bold text-lg text-red-600">{result.診断}</p>
                        <p className="text-sm text-gray-600 mt-2">信頼度</p>
                        <p className="font-bold">{result.信頼度}%</p>
                        <p className="text-sm text-gray-600 mt-2">緊急度</p>
                        <p className={`font-bold ${
                          result.緊急度 === "高" || result.緊急度 === "緊急" 
                            ? "text-red-600" 
                            : result.緊急度 === "中" 
                            ? "text-yellow-600" 
                            : "text-green-600"
                        }`}>
                          {result.緊急度}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">原因</h3>
                      <p className="text-gray-700">{result.原因}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">対策</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {result.対策?.map((item: string, index: number) => (
                          <li key={index} className="text-gray-700">{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">予防</h3>
                      <p className="text-gray-700">{result.予防}</p>
                    </div>

                    {result.参考情報 && result.参考情報.length > 0 && (
                      <div className="border-t pt-4 mt-4">
                        <h3 className="font-semibold mb-2">📚 参考情報（公的機関・研究機関）</h3>
                        <div className="space-y-2">
                          {result.参考情報.map((ref: any, index: number) => (
                            <div key={index} className="bg-blue-50 p-3 rounded-lg">
                              <a
                                href={ref.URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                              >
                                {ref.タイトル}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                              <p className="text-sm text-gray-600 mt-1">{ref.説明}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!result && !diagnosing && (
                  <div className="text-center py-8 text-gray-500">
                    画像をアップロードして診断を開始してください
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {result && !diagnosing && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>診断結果について質問する</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFollowUpSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="followUpQuestion">追加の質問</Label>
                    <Textarea
                      id="followUpQuestion"
                      value={followUpQuestion}
                      onChange={(e) => setFollowUpQuestion(e.target.value)}
                      placeholder="例: この対策はどのくらいの期間続ければよいですか？"
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={askingFollowUp || !followUpQuestion.trim()}
                  >
                    {askingFollowUp ? "回答を取得中..." : "質問を送信"}
                  </Button>
                </form>

                {askingFollowUp && (
                  <div className="mt-4 text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">AIが回答を生成中です...</p>
                  </div>
                )}

                {followUpAnswer && !askingFollowUp && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-blue-900">回答</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{followUpAnswer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

