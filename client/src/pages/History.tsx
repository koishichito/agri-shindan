import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { APP_TITLE } from "@/const";
import { Link } from "wouter";

export default function History() {
  const { data: plantHistory, isLoading: plantLoading } = trpc.plant.history.useQuery();
  const { data: equipmentHistory, isLoading: equipmentLoading } = trpc.equipment.history.useQuery();

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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📊 診断履歴</h2>

          <Tabs defaultValue="plant" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="plant">植物診断</TabsTrigger>
              <TabsTrigger value="equipment">機器診断</TabsTrigger>
            </TabsList>

            <TabsContent value="plant">
              {plantLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                  <p className="text-gray-600">読み込み中...</p>
                </div>
              ) : plantHistory && plantHistory.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {plantHistory.map((diagnosis) => (
                    <Card key={diagnosis.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {diagnosis.result?.作物 || "不明"} - {diagnosis.result?.診断 || "診断結果なし"}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {new Date(diagnosis.createdAt!).toLocaleString("ja-JP")}
                        </p>
                      </CardHeader>
                      <CardContent>
                        {diagnosis.imageUrl && (
                          <img
                            src={diagnosis.imageUrl}
                            alt="診断画像"
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                        )}
                        
                        {diagnosis.result && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">信頼度</span>
                              <span className="font-semibold">{diagnosis.result.信頼度}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">緊急度</span>
                              <span className={`font-semibold ${
                                diagnosis.result.緊急度 === "高" || diagnosis.result.緊急度 === "緊急"
                                  ? "text-red-600"
                                  : diagnosis.result.緊急度 === "中"
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}>
                                {diagnosis.result.緊急度}
                              </span>
                            </div>
                            
                            {diagnosis.description && (
                              <div className="mt-4">
                                <p className="text-sm text-gray-600">症状</p>
                                <p className="text-sm">{diagnosis.description}</p>
                              </div>
                            )}
                            
                            <div className="mt-4">
                              <p className="text-sm text-gray-600">原因</p>
                              <p className="text-sm">{diagnosis.result.原因}</p>
                            </div>
                            
                            <div className="mt-4">
                              <p className="text-sm text-gray-600">対策</p>
                              <ul className="text-sm list-disc list-inside">
                                {diagnosis.result.対策?.map((item: string, index: number) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-gray-500">植物診断の履歴がありません</p>
                    <Link href="/plant">
                      <Button className="mt-4">診断を始める</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="equipment">
              {equipmentLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                  <p className="text-gray-600">読み込み中...</p>
                </div>
              ) : equipmentHistory && equipmentHistory.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {equipmentHistory.map((session) => (
                    <Card key={session.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {session.finalDiagnosis?.機器 || "診断中"} - {session.status === "completed" ? "完了" : "進行中"}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {new Date(session.updatedAt!).toLocaleString("ja-JP")}
                        </p>
                      </CardHeader>
                      <CardContent>
                        {session.finalDiagnosis && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">推定原因</span>
                              <span className="font-semibold text-sm">{session.finalDiagnosis.推定原因}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">信頼度</span>
                              <span className="font-semibold">{session.finalDiagnosis.信頼度}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">緊急度</span>
                              <span className={`font-semibold ${
                                session.finalDiagnosis.緊急度 === "高" || session.finalDiagnosis.緊急度 === "緊急"
                                  ? "text-red-600"
                                  : session.finalDiagnosis.緊急度 === "中"
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}>
                                {session.finalDiagnosis.緊急度}
                              </span>
                            </div>
                            
                            {session.finalDiagnosis.代替原因 && session.finalDiagnosis.代替原因.length > 0 && (
                              <div className="mt-4">
                                <p className="text-sm text-gray-600">他の可能性</p>
                                <ul className="text-sm list-disc list-inside">
                                  {session.finalDiagnosis.代替原因.map((item: string, index: number) => (
                                    <li key={index}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {!session.finalDiagnosis && (
                          <p className="text-sm text-gray-500">診断が完了していません</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-gray-500">機器診断の履歴がありません</p>
                    <Link href="/equipment">
                      <Button className="mt-4">診断を始める</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

