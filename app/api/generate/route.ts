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
function generateMockContent(topic: string, style: string, variation: number): GeneratedContent {
  const baseTemplates: Record<string, Array<GeneratedContent>> = {
    '干货': [
      {
        content: `📝${topic}｜新手入门避坑指南

姐妹们！刚开始接触${topic}的时候我真的踩了好多坑😭

🌱 入门3步法：
1️⃣ 先搞懂基础概念，别急着上手
2️⃣ 找几个对标案例研究透
3️⃣ 小范围试错，别一上来all in

⚠️ 血泪教训：
• 别信速成，真的没有捷径
• 多向前辈请教，少走弯路
• 记录每次尝试，复盘很重要

刚开始难是正常的，坚持一个月就会看到变化！

新手姐妹还有什么想问的？👇`,
        tags: ['新手入门', '避坑指南', '经验分享', '干货满满', '建议收藏'],
        imageSuggestion: '手账风格的新手教程配图，可以用便利贴、荧光笔标注重点'
      },
      {
        content: `🔥${topic}｜3个让效率翻倍的技巧

从业5年，今天分享几个压箱底的技巧👇

💡 高手都在用的方法：
✅ 技巧1：建立SOP流程，重复的事情标准化
✅ 技巧2：善用工具，自动化处理繁琐环节  
✅ 技巧3：定期复盘优化，持续迭代改进

📊 数据说话：
用这套方法后，我的效率提升了200%，出错率降低了80%

💪 进阶建议：
不要满足于现状，保持学习才能持续领先

你们还有什么想了解的？评论区交流～`,
        tags: ['进阶技巧', '效率提升', '专业干货', '职场进阶', '经验总结'],
        imageSuggestion: '专业的数据分析风格配图，可以用图表、电脑屏幕、办公桌面'
      },
      {
        content: `🤯关于${topic}，90%的人都理解错了！

最近发现一个反常识的现象...

❌ 常见误区：
以为只要努力就够？其实方向更重要
以为工具越多越好？其实精通一个就够了
以为跟着大佬就行？其实要结合自身情况

✨ 正确打开方式：
🔍 找到自己的独特切入点
🎯 深耕细分领域做到极致
📈 用数据验证而不是凭感觉

这个思路帮我少走了很多弯路，分享给你们！

你们觉得还有哪些被误解的点？👇`,
        tags: ['反常识', '深度思考', '认知升级', '真相揭秘', '干货分享'],
        imageSuggestion: '有冲击力的对比图，可以用对错符号、思维导图或数据可视化'
      }
    ],
    '情感': [
      {
        content: `💭${topic}｜我的真实心路历程

姐妹们，今天想说点心里话...

🌧️ 刚开始的那段时间
真的很迷茫，不知道方向在哪里
失眠了好多个晚上，偷偷哭过几次😢

🌈 转折点
遇到了一个很好的 mentor
她告诉我：每个人都有自己的节奏
不用和别人比较

💫 现在的我
学会了接纳自己的不完美
懂得了过程比结果更重要
心态平和了很多

想对正在迷茫的你说：
一切都会好起来的，真的。

你们最近过得怎么样？想聊聊吗？`,
        tags: ['情感共鸣', '心路历程', '治愈系', '真实分享', '温暖'],
        imageSuggestion: '温暖治愈的风景照，日落、海边或窗边咖啡'
      },
      {
        content: `✨${topic}教会我的3件事

回头看这段经历，想分享一些感悟：

1️⃣ 成年人的成长是孤独的
没有人会一直陪着你
要学会独处，学会自我激励

2️⃣ 失败是常态，成功是偶然  
每一次跌倒都是积累
重要的是爬起来继续走

3️⃣ 永远相信自己值得更好的
不要因为暂时的困境否定自己
你比你想象中更强大💪

把这些话送给每一个正在努力的你
我们一起加油！🌟

有什么想聊的，评论区见～`,
        tags: ['人生感悟', '成长记录', '正能量', '自我提升', '深夜树洞'],
        imageSuggestion: '励志风格的配图，可以是日出、登山、书籍或手写便签'
      },
      {
        content: `🤔我们真的需要${topic}吗？

最近一直在思考这个问题...

社交媒体上人人都在谈${topic}
好像不参与就out了一样

但说实话：
🍃 不跟随潮流，真的很可怕吗？
🍃 找到适合自己的节奏，不也挺好的吗？
🍃 人生不是只有一种活法啊

也许我们需要的不是盲目跟风
而是停下来问问自己：
这真的是我想要的吗？

不同意见的欢迎交流👇
（理性讨论，杠就是你对😉）`,
        tags: ['观点分享', '深度思考', '不同声音', '自我认知', '生活哲学'],
        imageSuggestion: '引发思考的配图，可以用迷宫、岔路口、剪影或黑白对比'
      }
    ],
    '争议': [
      {
        content: `😤说点${topic}的大实话！

最近看到好多人在吹${topic}
但我真的要泼点冷水了...

❌ 那些没告诉你的真相：
• 根本不是适合所有人
• 前期的投入比你想象的大
• 回报率远没有宣传的那么香

🤷‍♀️ 为什么要说这些？
因为我看到太多人盲目跟风
最后时间花了，效果没有

💡 我的建议：
先想清楚自己适不适合
再决定要不要投入
别被焦虑绑架了！

你们觉得呢？来聊聊真实的感受👇`,
        tags: ['说真话', '避雷指南', '理性分析', '不同声音', '真实分享'],
        imageSuggestion: '有争议感的配图，可以用红叉、警告标志或对比强烈的视觉'
      },
      {
        content: `📊${topic}的数据真相

拿数据说话，不吹不黑👇

🔍 行业调研显示：
• 成功率只有不到10%
• 平均周期需要6-12个月
• 前期成本回收期很长

📈 对比分析：
横向对比3个主流方案
性价比最高的其实是...
（想知道的评论区问我）

💭 理性建议：
不要被表面光鲜迷惑
数据不会说谎
做决策前做好功课

还有想了解的数据维度吗？`,
        tags: ['数据分析', '行业洞察', '理性决策', '干货分享', '深度测评'],
        imageSuggestion: '数据图表风格的配图，柱状图、饼图或信息可视化'
      },
      {
        content: `🎭${topic}｜一场精心设计的骗局？

这个标题可能会得罪人
但我不吐不快...

🎪 流量密码：
• 制造焦虑 → 引发恐慌
• 贩卖希望 → 收割韭菜  
• 营造稀缺 → 刺激冲动

👀 识破套路：
凡是让你"马上行动"的
都要多留个心眼
真正的好机会不需要催促

🛡️ 保护自己：
✅ 凡事先查资质
✅ 多渠道验证信息
✅ 小成本试错

可能这条会被限流
但看到就是赚到
转发给需要的人！

你们遇到过类似的套路吗？👇`,
        tags: ['避坑指南', '揭秘', '防骗', '人间清醒', '必看'],
        imageSuggestion: '警示风格的配图，可以用问号、放大镜或破墙而出的视觉'
      }
    ]
  };

  const templates = baseTemplates[style] || baseTemplates['干货'];
  return templates[variation] || templates[0];
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
          { role: 'system', content: '你是小红书爆款文案专家，擅长创作多样化、有创意的文案。每次回复都要有明显差异。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.95,
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
          { role: 'system', content: '你是小红书爆款文案专家，擅长创作多样化、有创意的文案。每次回复都要有明显差异。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.95,
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
  // 三个版本的不同切入角度
  const angles = [
    '从【入门新手视角】切入，分享初次接触这个主题的真实感受和踩坑经验，语气轻松亲切，像闺蜜聊天',
    '从【过来人/专家视角】切入，分享进阶技巧和深度见解，展现专业性，语气自信有干货',
    '从【好奇旁观者视角】切入，提出新颖观点或反常识发现，引发讨论，语气带有探索感和话题性'
  ];

  const angle = angles[variation] || angles[0];

  return `请为以下主题创作小红书文案，输出JSON格式：

主题：${topic}
风格：${style}型
切入角度：${angle}

要求：
1. 标题吸睛（15-20字），使用2-3个emoji，制造好奇心
2. 正文分段清晰（3-5段），每段用emoji开头，口语化像朋友聊天
3. 使用小红书热词：绝绝子、yyds、宝藏、安利、种草、干货、码住、家人们、谁懂啊、真的绝了
4. 结尾有互动引导（提问或邀请评论）
5. 标签要与内容高度相关，覆盖细分领域
6. 输出必须是有效JSON格式

输出格式：
{
  "content": "文案内容（包含emoji和换行\\n）",
  "tags": ["标签1", "标签2", "标签3", "标签4", "标签5"],
  "imageSuggestion": "具体的配图建议，描述画面内容和风格"
}`;
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
      return generateMockContent(topic, style, variation);
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
