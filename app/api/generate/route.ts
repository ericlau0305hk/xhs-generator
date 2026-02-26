import { NextRequest, NextResponse } from 'next/server';

interface GenerateRequest {
  topic: string;
  style: '干货' | '情感' | '争议';
}

interface GeneratedContent {
  content: string;
  tags: string[];
  imageSuggestion: string;
}

// Minimax API 配置
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_API_URL = 'https://api.minimaxi.com/anthropic/v1/messages';

// Kimi API 配置 (fallback)
const KIMI_API_KEY = process.env.KIMI_API_KEY;
const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';

function getSystemPrompt(style: string): string {
  const basePrompt = `你是小红书爆款文案专家，擅长创作吸引人的笔记内容。

要求：
1. 标题要吸睛，使用emoji增加视觉吸引力
2. 正文分段清晰，每段不要过长
3. 语言口语化，像朋友分享经验
4. 适当使用小红书常用词汇：绝绝子、yyds、宝藏、安利、种草、干货、码住
5. 结尾要有互动引导，邀请评论

输出格式必须是JSON：
{
  "content": "文案内容",
  "tags": ["标签1", "标签2", "标签3", "标签4", "标签5"],
  "imageSuggestion": "配图建议描述"
}`;

  const stylePrompts: Record<string, string> = {
    '干货': basePrompt + '\n\n风格：干货型\n- 侧重实用价值和经验分享\n- 使用"干货"、"建议收藏"、"吐血整理"等词汇\n- 内容要有可落地的建议',
    '情感': basePrompt + '\n\n风格：情感共鸣型\n- 侧重情感表达和共鸣\n- 分享真实感受和心路历程\n- 使用"谁懂啊"、"家人们"、"真的很"等表达',
    '争议': basePrompt + '\n\n风格：争议讨论型\n- 提出有争议或反常识的观点\n- 引发讨论和互动\n- 使用"只有我发现"、"难道只有我觉得"、"不吹不黑"等',
  };

  return stylePrompts[style] || basePrompt;
}

async function callMinimax(prompt: string): Promise<GeneratedContent> {
  if (!MINIMAX_API_KEY) {
    throw new Error('Minimax API key not configured');
  }

  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'MiniMax-M2.5',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Minimax API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || data.content?.[0]?.text;
  
  return parseAIResponse(content);
}

async function callKimi(prompt: string): Promise<GeneratedContent> {
  if (!KIMI_API_KEY) {
    throw new Error('Kimi API key not configured');
  }

  const response = await fetch(KIMI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIMI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'kimi-k2.5',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kimi API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  return parseAIResponse(content);
}

function parseAIResponse(content: string): GeneratedContent {
  try {
    // 尝试提取JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        content: parsed.content || content,
        tags: parsed.tags || ['小红书', '干货分享', '生活记录'],
        imageSuggestion: parsed.imageSuggestion || '相关主题配图',
      };
    }
  } catch (e) {
    console.error('Failed to parse AI response:', e);
  }

  // Fallback: 返回默认格式
  return {
    content: content,
    tags: ['小红书', '干货分享', '生活记录', '经验分享', '种草'],
    imageSuggestion: '与主题相关的高质量图片',
  };
}

async function generateWithFallback(userPrompt: string, style: string): Promise<GeneratedContent> {
  const systemPrompt = getSystemPrompt(style);
  const fullPrompt = `${systemPrompt}\n\n请为以下主题创作小红书文案：\n${userPrompt}`;

  // 先尝试 Minimax
  try {
    console.log('Trying Minimax...');
    return await callMinimax(fullPrompt);
  } catch (error) {
    console.log('Minimax failed, falling back to Kimi:', error);
    
    // Minimax 失败时切换到 Kimi
    try {
      return await callKimi(fullPrompt);
    } catch (kimiError) {
      console.error('Both APIs failed:', kimiError);
      throw new Error('AI 服务暂时不可用，请稍后重试');
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { topic, style } = body;

    if (!topic || !style) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 生成3个不同角度/表达的版本
    const results: GeneratedContent[] = [];
    
    for (let i = 0; i < 3; i++) {
      // 为每个版本添加不同的提示词变体
      const variationPrompt = i === 0 
        ? topic 
        : i === 1 
          ? `${topic}（从不同角度切入）` 
          : `${topic}（提供具体案例或数据）`;
      
      const result = await generateWithFallback(variationPrompt, style);
      results.push(result);
      
      // 添加小延迟避免请求过快
      if (i < 2) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
