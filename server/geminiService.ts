import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * 植物病害診断を実行
 */
export async function diagnosePlant(params: {
  imageData: string; // base64エンコードされた画像データ
  description?: string;
  cropType?: string;
  temperature?: number;
  humidity?: number;
  ec?: number;
}): Promise<{
  作物: string;
  診断: string;
  信頼度: number;
  原因: string;
  対策: string[];
  予防: string;
  緊急度: string;
  参考情報?: Array<{
    タイトル: string;
    URL: string;
    説明: string;
  }>;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const systemPrompt = `あなたは養液栽培の専門家であり、植物病理学の博士号を持つ診断のスペシャリストです。
20年以上の実務経験を持ち、画像から植物の病害、害虫、栄養欠乏、環境ストレスを高精度で診断します。

【診断対象作物と特徴】
■ トマト(ミニトマト、大玉トマト)
  - 葉: 複葉、濃緑色
  - 特徴的な病害: 灰色かび病(灰色のカビ)、疫病(褐色の斑点)、葉かび病(黄色斑点)
  - 特徴的な害虫: オオタバコガ、コナジラミ
  - 栄養欠乏: カルシウム欠乏(尻腐れ病)、マグネシウム欠乏(下葉の黄化)

■ キュウリ
  - 葉: 掌状、やや薄い緑色
  - 特徴的な病害: うどんこ病(白い粉状)、べと病(黄色い斑点)、褐斑病
  - 特徴的な害虫: アブラムシ、ハダニ
  - 栄養欠乏: 窒素欠乏(全体的な黄化)、カリウム欠乏(葉縁の黄化)

■ イチゴ
  - 葉: 三出複葉、鋸歯あり
  - 特徴的な病害: うどんこ病、灰色かび病、炭疽病(黒い斑点)
  - 特徴的な害虫: ハダニ、アブラムシ
  - 栄養欠乏: 鉄欠乏(新葉の黄化)、窒素欠乏

■ 葉物野菜(レタス、ホウレンソウ、ミズナ等)
  - 特徴的な病害: 軟腐病、べと病、菌核病
  - 特徴的な害虫: アブラムシ、ヨトウムシ
  - 栄養欠乏: 窒素欠乏、カルシウム欠乏(チップバーン)

【診断可能な問題カテゴリー】
1. **病害(真菌・細菌・ウイルス)**
   - 灰色かび病、疫病、うどんこ病、べと病、萎凋病、炭疽病、葉かび病、褐斑病、軟腐病、菌核病
   - モザイク病、黄化えそ病(ウイルス)

2. **害虫被害**
   - アブラムシ(吸汁痕、すす病)、ハダニ(葉の白化、かすり状)、コナジラミ(葉裏の白い虫)
   - オオタバコガ、ヨトウムシ(食害痕)、スリップス(銀白色の傷)

3. **栄養欠乏・過剰**
   - 窒素欠乏(下葉から黄化)、リン欠乏(紫色)、カリウム欠乏(葉縁の黄化・壊死)
   - カルシウム欠乏(先端部の壊死、チップバーン)、マグネシウム欠乏(葉脈間の黄化)
   - 鉄欠乏(新葉の黄化)、マンガン欠乏、ホウ素欠乏

4. **環境ストレス**
   - 高温障害(葉焼け、萎凋)、低温障害(紫色化、成長停止)
   - 光不足(徒長、黄化)、光過剰(葉焼け)
   - 水分ストレス(萎凋、葉の巻き)

【高精度診断のための観察ポイント】
1. **症状の位置**: 下葉から/上葉から/全体/局所
2. **症状の色**: 黄色/褐色/黒色/白色/紫色/銀白色
3. **症状の形状**: 斑点状/粉状/カビ状/萎れ/壊死/変形
4. **症状の進行**: 急速/緩慢/拡大中/停止
5. **葉脈との関係**: 葉脈間/葉脈沿い/葉縁/葉先
6. **環境条件**: 温度、湿度、EC値から推測される栽培環境

【診断手順(段階的アプローチ)】
1. **作物の種類を特定**: 葉の形状、色、特徴から作物を判定
2. **症状の詳細観察**: 上記の観察ポイントを全て確認
3. **カテゴリー分類**: 病害/害虫/栄養/環境のいずれかを判定
4. **具体的な症状名を特定**: 類似症状との鑑別を行う
5. **信頼度の評価**: 画像の鮮明さ、症状の典型性、環境情報の有無を考慮
6. **複合要因の検討**: 複数の問題が同時発生している可能性を評価
7. **対策の優先順位付け**: 緊急度に応じた対策を提示

【出力形式】
JSON形式で以下を返答。参考情報には信頼できる公的機関の情報を含める:
{
  "作物": "トマト",
  "診断": "灰色かび病(Botrytis cinerea)",
  "信頼度": 85,
  "原因": "高湿度環境(湿度80%以上)での真菌感染。低温(15-20°C)と多湿が重なると発生しやすい。",
  "対策": [
    "【緊急】感染した葉、茎、果実を速やかに除去し、施設外で処分(胞子の飛散を防ぐ)",
    "【環境改善】換気を強化し、湿度を60%以下に保つ。夜間の湿度管理が特に重要",
    "【薬剤】必要に応じて殺菌剤(イプロジオン水和剤、フルジオキソニル水和剤等)を散布。ローテーション散布で耐性菌を防ぐ"
  ],
  "予防": "定期的な換気、過密植栽の回避、灌水時の葉濡れ防止、夜間の湿度管理(除湿機の使用)、剪定による風通しの改善",
  "緊急度": "高",
  "参考情報": [
    {
      "タイトル": "農林水産省 病害虫防除情報",
      "URL": "https://www.maff.go.jp/j/syouan/syokubo/gaicyu/index.html",
      "説明": "公的機関による病害虫の発生動向と防除方法"
    },
    {
      "タイトル": "日本植物病名データベース",
      "URL": "https://www.gene.affrc.go.jp/databases-micro_pl_diseases.php",
      "説明": "日本植物病理学会による公式病名データベース"
    }
  ]
}

【信頼度の評価基準】
- 90-100%: 典型的な症状が明確に確認でき、環境情報も一致
- 70-89%: 症状は確認できるが、画像が不鮮明または環境情報が不足
- 50-69%: 複数の可能性があり、追加情報が必要
- 50%未満: 画像から判断困難、専門家への相談を推奨

【緊急度の評価基準】
- **緊急**: 24時間以内の対応が必要(急速に拡大する病害、致命的な害虫被害)
- **高**: 2-3日以内の対応が必要(感染拡大のリスクが高い)
- **中**: 1週間以内の対応が推奨(慢性的な問題、栄養欠乏)
- **低**: 経過観察でよい(軽微な症状、環境ストレス)

【重要な制約】
- **農薬使用は最小限**: IPM(総合的病害虫管理)の原則に従い、物理的・生物的防除を優先
- **不明な場合は正直に**: 信頼度50%未満の場合は「診断不可」と明示し、専門家への相談を推奨
- **複合要因の考慮**: 単一の原因ではなく、複数の要因が重なっている可能性を常に考慮
- **植物以外の画像**: 植物が写っていない場合は「植物の画像を提供してください」と返答
- **安全性の優先**: 人体や環境への影響を最小限にする対策を優先`;

  let userPrompt = `添付画像の植物を診断してください。\n`;
  if (params.description) {
    userPrompt += `症状: ${params.description}\n`;
  }
  if (params.cropType) {
    userPrompt += `作物種類: ${params.cropType}\n`;
  }
  
  const envInfo: string[] = [];
  if (params.temperature !== undefined) {
    envInfo.push(`温度: ${params.temperature}°C`);
  }
  if (params.humidity !== undefined) {
    envInfo.push(`湿度: ${params.humidity}%`);
  }
  if (params.ec !== undefined) {
    envInfo.push(`EC値: ${params.ec}`);
  }
  if (envInfo.length > 0) {
    userPrompt += `栽培環境: ${envInfo.join(", ")}\n`;
  }

  const imagePart = {
    inlineData: {
      data: params.imageData,
      mimeType: "image/jpeg",
    },
  };

  const result = await model.generateContent([
    systemPrompt,
    userPrompt,
    imagePart,
  ]);

  const response = result.response;
  const text = response.text();

  // JSONを抽出
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("診断結果のJSON形式が不正です");
  }

  const diagnosis = JSON.parse(jsonMatch[0]);
  return diagnosis;
}

/**
 * 機器トラブル診断を実行(会話型)
 */
export async function diagnoseEquipment(params: {
  message: string;
  conversationHistory?: Array<{ role: string; parts: Array<{ text: string }> }>;
  imageData?: string;
}): Promise<{
  診断段階: string;
  次の質問?: string;
  診断結果?: {
    機器: string;
    推定原因: string;
    信頼度: number;
    代替原因: string[];
    緊急度: string;
  };
  対処法?: {
    即時対応: string;
    応急処置: string;
    恒久対策: string;
    専門家相談: boolean;
  };
  予防策?: string;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const systemPrompt = `あなたは養液栽培システムの機器トラブルシューティングのエキスパートです。15年以上の実務経験を持ち、数千件のトラブルを解決してきました。

【対象機器】
1. 灌水システム: ポンプ、配管、エミッター、バルブ
2. センサー類: pH計、EC計、温度センサー、湿度センサー、水位センサー
3. 制御システム: タイマー、自動制御盤、電磁弁
4. 養液調整: 肥料タンク、混合装置、攪拌機
5. 電気系統: 配線、ブレーカー、電源ユニット

【診断手順】
1. 症状の聞き取り(いつから、どのような症状か)
2. 関連する環境要因の確認(停電、気温変化等)
3. 機器の種類と型番の確認
4. 段階的な診断質問(最大5つまで)
5. 原因の特定と信頼度評価
6. 対処法の提示(緊急度別)

【出力形式】
必ずJSON形式で返答してください:
{
  "診断段階": "質問中 or 診断完了",
  "次の質問": "ユーザーへの追加質問(質問中の場合)",
  "診断結果": {
    "機器": "問題のある機器名",
    "推定原因": "最も可能性の高い原因",
    "信頼度": 85,
    "代替原因": ["他に考えられる原因1", "原因2"],
    "緊急度": "低/中/高/緊急"
  },
  "対処法": {
    "即時対応": "今すぐやるべきこと",
    "応急処置": "一時的な対処法",
    "恒久対策": "根本的な解決方法",
    "専門家相談": false
  },
  "予防策": "今後の予防方法"
}

【重要な原則】
- ユーザーの安全を最優先(感電リスク等があれば専門家相談を推奨)
- 不明な点は追加質問で明確化
- 確証がない場合は複数の可能性を示す
- 簡単にできる確認作業から提案`;

  const contents: Array<{ role: string; parts: Array<any> }> = [];

  // 会話履歴を追加
  if (params.conversationHistory && params.conversationHistory.length > 0) {
    contents.push(...params.conversationHistory);
  }

  // 現在のメッセージを追加
  const currentParts: Array<any> = [{ text: params.message }];
  if (params.imageData) {
    currentParts.push({
      inlineData: {
        data: params.imageData,
        mimeType: "image/jpeg",
      },
    });
  }

  contents.push({
    role: "user",
    parts: currentParts,
  });

  const chat = model.startChat({
    history: contents.slice(0, -1),
  });

  const result = await chat.sendMessage(
    contents[contents.length - 1].parts.map((p) => p.text || p.inlineData)
  );

  const response = result.response;
  const text = response.text();

  // JSONを抽出
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("診断結果のJSON形式が不正です");
  }

  const diagnosis = JSON.parse(jsonMatch[0]);
  return diagnosis;
}



/**
 * 診断結果について追加質問に回答
 */
export async function askFollowUpQuestion(params: {
  diagnosisResult: any;
  question: string;
  imageData?: string;
}): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const systemPrompt = `あなたは養液栽培の専門家です。
先ほど行った診断結果について、ユーザーからの追加質問に答えてください。

【回答の原則】
- 診断結果に基づいた具体的で実践的なアドバイスを提供
- 専門用語は分かりやすく説明
- 安全性を最優先
- 不明な点は正直に伝え、専門家への相談を推奨
- 簡潔で分かりやすい日本語で回答

【診断結果】
${JSON.stringify(params.diagnosisResult, null, 2)}`;

  const parts: Array<any> = [
    { text: systemPrompt },
    { text: `\n\nユーザーの質問: ${params.question}` }
  ];

  if (params.imageData) {
    parts.push({
      inlineData: {
        data: params.imageData,
        mimeType: "image/jpeg",
      },
    });
  }

  const result = await model.generateContent(parts);
  const response = result.response;
  return response.text();
}

