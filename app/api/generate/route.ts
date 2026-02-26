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

// 模拟生成结果（用于测试和 fallback）
function generateMockContent(topic: string, style: string): GeneratedContent {
  const templates: Record<string, GeneratedContent> = {
    '干货': {
      content: `📝${topic}｜吐血整理的干货分享

姐妹们，今天来分享${topic}的经验！

✨ 核心要点：
1️⃣ 第一步：做好准备工作
2️⃣ 第二步：执行关键动作  
3️⃣ 第三步：持续优化改进

💡 小贴士：
• 坚持就是胜利
• 多复盘多总结
• 找到适合自己的方法

希望对你有帮助！觉得有用的话记得点赞收藏～

有问题评论区见👇`,
      tags: ['干货分享', '经验总结', '成长记录', '实用技巧', '建议收藏'],
      imageSuggestion: '干货笔记风格配图，可以使用清单、步骤图或思维导图'
    },
    '情感': {
      content: `💭关于${topic}，我想说的话

家人们，谁懂啊！

最近一直在思考${topic}这件事，真的感触很深...

🌙 那些失眠的夜晚
🍃 那些迷茫的时刻  
✨ 那些突然的顿悟

其实每个人都一样，都在摸索中成长
你不是一个人在战斗💪

想问问大家：
你们有没有类似的经历？
评论区聊聊吧👇

#成长 #共鸣 #治愈`,
      tags: ['情感共鸣', '成长记录', '治愈系', '深夜话题', '真实分享'],
      imageSuggestion: '温暖治愈风格的配图，可以是风景、咖啡、书桌或自拍'
    },
    '争议': {
      content: `🤔只有我发现吗？关于${topic}的真相

不吹不黑，今天说点大实话！

关于${topic}，很多人其实理解错了：
❌ 误区1：急于求成
❌ 误区2：盲目跟风
❌ 误区3：忽视基础

✅ 正确的做法应该是：
• 脚踏实地一步步来
• 找到适合自己的节奏
• 注重长期价值

可能这些话会得罪人，但我还是要说！

你们觉得呢？
评论区理性讨论👇

#真相 #观点 #讨论`,
      tags: ['观点分享', '真相揭秘', '理性讨论', '不同看法', '深度思考'],
      imageSuggestion: '引发思考的配图，可以使用对比图、数据图或具有视觉冲击力的图片'
    }
  };

  return templates[style] || templates['干货'];
}

// 调用 Minimax API
async function callMinimaxAPI(prompt: string): Promise<string> {
  const apiKey = process.env.MINIMAX_API_KEY;
  
  if (!apiKey) {
    throw new Error('MINIMAX_API_KEY not configured');
  }

  try {
    const response = await fetch('https://api.minimaxi.com/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'MiniMax-Text-01',
        messages: [
          { role: 'system', content: '你是小红书爆款文案专家。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Minimax API error:', errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || data.choices?.[0]?.text || '';
  } catch (error) {
    console.error('Minimax API call failed:', error);
    throw error;
  }
}

// 调用 Kimi API (fallback)
async function callKimiAPI(prompt: string): Promise<string> {
  const apiKey = process.env.KIMI_API_KEY;
  
  if (!apiKey) {
    throw new Error('KIMI_API_KEY not configured');
  }

  try {
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'kimi-k2.5',
        messages: [
          { role: 'system', content: '你是小红书爆款文案专家。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Kimi API error:', errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('Kimi API call failed:', error);
    throw error;
  }
}

// 生成 Prompt
function createPrompt(topic: string, style: string, variation: number): string {
  const basePrompt = `请为以下主题创作小红书文案，输出JSON格式：

主题：${topic}
风格：${style}型

要求：
1. 标题吸睛，使用emoji
2. 正文分段清晰，口语化
3. 使用小红书常用词：绝绝子、yyds、宝藏、安利、种草、干货、码住、家人们
4. 结尾有互动引导
5. 输出必须是有效JSON格式

${variation === 1 ? '从不同角度切入，提供独特视角。' : ''}
${variation === 2 ? '提供具体案例或数据支撑。' : ''}

输出格式：
{
  "content": "文案内容（包含emoji和换行）",
  "tags": ["标签1", "标签2", "标签3", "标签4", "标签5"],
  "imageSuggestion": "配图建议描述"
}`;

  return basePrompt;
}

// 解析 AI 响应
function parseAIResponse(content: string): GeneratedContent {
  try {
    // 尝试提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        content: parsed.content || content,
        tags: Array.isArray(parsed.tags) ? parsed.tags : ['小红书', '干货分享', '经验总结'],
        imageSuggestion: parsed.imageSuggestion || '与主题相关的高质量配图',
      };
    }
  } catch (e) {
    console.error('Failed to parse AI response as JSON:', e);
  }

  // 如果解析失败，返回原始内容
  return {
    content: content,
    tags: ['小红书', '干货分享', '经验总结', '实用技巧', '建议收藏'],
    imageSuggestion: '与主题相关的高质量配图',
  };
}

// 生成内容（带 fallback）
async function generateContent(topic: string, style: string, variation: number): Promise<GeneratedContent> {
  const prompt = createPrompt(topic, style, variation);
  
  // 先尝试 Minimax
  try {
    console.log(`Trying Minimax for variation ${variation}...`);
    const content = await callMinimaxAPI(prompt);
    return parseAIResponse(content);
  } catch (minimaxError) {
    console.log('Minimax failed, trying Kimi:', minimaxError);
    
    // Minimax 失败，尝试 Kimi
    try {
      const content = await callKimiAPI(prompt);
      return parseAIResponse(content);
    } catch (kimiError) {
      console.log('Kimi also failed, using mock:', kimiError);
      
      // 两者都失败，使用模拟数据
      return generateMockContent(topic, style);
    }
  }
}

// API Route Handler
export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { topic, style } = body;

    if (!topic || !style) {
      return NextResponse.json(
        { error: '缺少必要参数：topic 和 style' },
        { status: 400 }
      );
    }

    // 生成3个不同版本
    const results: GeneratedContent[] = [];
    
    for (let i = 0; i < 3; i++) {
      const result = await generateContent(topic, style, i);
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
      { error: '生成失败，请稍后重试', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
