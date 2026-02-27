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

// ===== 热词库：按风格分类 =====
const BUZZWORDS = {
  '干货': [
    '绝绝子', 'yyds', '干货', '码住', '建议收藏', '避坑指南', '保姆级教程',
    '亲测有效', '手把手教你', '吐血整理', '压箱底', '一般人我不告诉',
    '天花板级别', '保姆教程', '懒人必备', '效率翻倍', '小白必看'
  ],
  '情感': [
    '谁懂啊', '家人们', '真的绝了', '破防了', '狠狠共情了', '太真实了',
    '泪目', '治愈', '温暖', '神仙', '宝藏', '被惊艳到', '狠狠心动',
    '原地封神', '救命', '戳心', '人间真实', '温柔到骨子里'
  ],
  '争议': [
    '清醒一点', '大实话', '行业内幕', '真相了', '不吐不快', '人间清醒',
    '扎心', '残酷真相', '现实就是这么', '别被骗', '避坑', '说点真话',
    '得罪人', '翻车', '翻车现场', '翻车预警', '千万别', '醒醒吧'
  ]
};

// ===== 爆款结构模板 =====
const CONTENT_STRUCTURES = {
  '干货': {
    structure: [
      '【痛点钩子】用反问或惊人数据开篇，制造紧迫感',
      '【个人故事】简短分享自己在这个领域的经历，建立可信度',
      '【干货主体】3-5个具体可操作的步骤/技巧，带emoji编号',
      '【避坑提醒】列出常见错误，显得专业贴心',
      '【行动号召】鼓励尝试 + 互动提问'
    ],
    tone: '专业但不装逼，像经验丰富的闺蜜分享心得',
    hooks: ['很多人不知道', '后悔没早点', '90%的人都错了', '亲测有效']
  },
  '情感': {
    structure: [
      '【情绪钩子】用场景描写或金句开头，引发共鸣',
      '【真实故事】分享自己的经历，细节要具体有画面感',
      '【情感升华】从个人经历提炼出普适性感悟',
      '【温暖收束】给予鼓励和力量，传递正能量',
      '【共情互动】邀请读者分享自己的故事'
    ],
    tone: '真诚温暖，像深夜和闺蜜倾诉心事',
    hooks: ['姐妹们谁懂啊', '深夜emo', '今天想说点心里话', '被狠狠戳到了']
  },
  '争议': {
    structure: [
      '【争议钩子】标题党开头，制造悬念或对立',
      '【观点亮明】明确表达不随波逐流的态度',
      '【事实论据】用数据或案例支撑观点，显得有理有据',
      '【对比分析】揭示行业/现象的另一面',
      '【理性呼吁】引导独立思考 + 开放式讨论'
    ],
    tone: '犀利但有理，敢于说真话但不偏激',
    hooks: ['说点得罪人的', '别急着喷我', '真相可能会让你', '清醒一点']
  }
};

// ===== 模拟生成结果（质量更高） =====
function generateMockContent(topic: string, style: string, variation: number): GeneratedContent {
  const templates: Record<string, Array<GeneratedContent>> = {
    '干货': [
      {
        content: `💔${topic}｜后悔没早点知道这些坑！

姐妹们！！我真的后悔死了😭要是早点有人告诉我这些，能省多少冤枉钱啊！

🌟 血泪总结3步法：
1️⃣ 先做功课再动手（很多人上来就all in，真的傻）
2️⃣ 找3个对标案例研究透（别贪多，精准学习）
3️⃣ 小范围试错验证（别指望一次成功， Iteration很重要）

⚠️ 这些坑千万别踩：
• 别信"7天速成"，真的没有捷径，都是智商税！
• 工具在精不在多，先精通一个再扩展
• 一定要记录复盘，同样的错误别犯第二次

亲测有效！按照这个思路，我的效率直接翻倍💪

你们还有什么想了解的？评论区告诉我，下期出详细教程！👇`,
        tags: ['干货满满', '避坑指南', '亲测有效', '建议收藏', '效率翻倍'],
        imageSuggestion: '手账风格教程图，用荧光笔标注重点步骤，暖色调，ins风排版'
      },
      {
        content: `🔥被问了100遍的${topic}技巧，今天一次说清楚！

真的绝了！！这个方法我用了一年，效率提升了200%，今天必须安利给你们👇

✨ 3个压箱底技巧：
💡 技巧1：建立SOP流程
把重复的事情标准化，一次做好，永久复用！真的yyds

💡 技巧2：善用自动化工具
繁琐环节交给工具，把时间留给高价值的事。我用的是XX（可以替换具体工具）

💡 技巧3：定期复盘迭代
每周花30分钟复盘，持续优化，1个月就能看到质的飞跃

📊 效果对比：
之前：每天加班到9点，还是做不完
现在：准时下班，还提前完成了季度目标

家人们，真的谁用谁知道！码住慢慢看💪

还有什么想了解的？评论区留言，我整理成下一期！`,
        tags: ['效率神器', '职场干货', '时间管理', 'yyds', '建议收藏'],
        imageSuggestion: '专业办公桌面俯拍，有笔记本、咖啡、数据图表，明亮现代风格'
      },
      {
        content: `🤯${topic}｜90%的人都理解错了！

姐妹们！我发现一个反常识的真相...
关于${topic}，大部分人从一开始就想错了！！

❌ 常见误区：
以为努力就够？错！方向比努力重要100倍
以为工具越多越好？错！精通一个吊打一群
以为跟着大佬就行？错！要结合自己的实际情况

✅ 正确打开方式：
🔍 找到自己的独特切入点（别随大流）
🎯 深耕细分领域做到极致（宁做鸡头不做凤尾）
📈 用数据说话，而不是凭感觉

这个思路帮我少走了很多弯路，从0到1只用了3个月！

干货满满，建议收藏慢慢看👆
你们还遇到过哪些坑？评论区交流～`,
        tags: ['反常识', '认知升级', '深度思考', '干货分享', '真相揭秘'],
        imageSuggestion: '思维导图或对比图，对错符号对比，蓝白配色，简洁专业风格'
      }
    ],
    '情感': [
      {
        content: `💭关于${topic}，我的真实心路历程...

姐妹们，今天想说点心里话...

🌧️ 刚开始的那段时间
真的很迷茫，失眠了好多个晚上
偷偷哭过几次，谁也不敢说😢
感觉自己好像什么都做不好...

🌈 转折点
遇到了一个很好的姐姐
她告诉我：每个人都有自己的节奏
不用和别人比较，你只要比昨天的自己好

💫 现在的我
学会了接纳不完美
懂得了过程比结果更重要
心态平和了很多，整个人都轻松了

想对正在迷茫的你说：
一切都会好起来的，真的。你比你想象中更优秀✨

你们最近过得怎么样？想聊聊吗？👇`,
        tags: ['情感共鸣', '心路历程', '治愈系', '深夜树洞', '温暖'],
        imageSuggestion: '温暖治愈的窗边场景，柔和光线，一杯热茶，窗外是日落或城市夜景'
      },
      {
        content: `✨${topic}教会我的3件事，送给每一个努力的你

回头看这段经历，真的很感慨...
想把这些话送给每一个正在努力的姐妹👇

1️⃣ 成年人的成长是孤独的
没有人会一直陪着你
要学会独处，学会自我激励
但这是你变强的必经之路💪

2️⃣ 失败是常态，成功才是偶然
每一次跌倒都是积累
重要的是爬起来继续走
那些打不倒你的，会让你更强大

3️⃣ 永远相信自己值得更好的
不要因为暂时的困境否定自己
你比你想象中更优秀，更强大✨

深夜写下这些，送给每一个还在坚持的你们
我们一起加油！🌟

有什么想聊的，评论区见～`,
        tags: ['人生感悟', '成长记录', '正能量', '深夜树洞', '励志'],
        imageSuggestion: '励志风格配图，日出登山、晨光中的城市、或翻开的书页配手写便签'
      },
      {
        content: `🤔我们真的需要${topic}吗？

最近一直在思考这个问题...

社交媒体上人人都在谈${topic}
好像不参与就out了一样
不跟着做就好像会被时代抛弃...

但说实话：
🍃 不跟随潮流，真的很可怕吗？
🍃 找到适合自己的节奏，不也挺好的吗？
🍃 人生不是只有一种活法啊

也许我们需要的不是盲目跟风
而是停下来问问自己：
这真的是我想要的吗？还是只是焦虑驱动的？

找到自己的节奏，比什么都重要🌸

不同意见的欢迎交流👇
（理性讨论，杠就是你对😉）`,
        tags: ['观点分享', '深度思考', '自我认知', '生活哲学', '人间清醒'],
        imageSuggestion: '引发思考的配图，人物站在岔路口、迷宫俯拍、或黑白对比强烈的艺术照'
      }
    ],
    '争议': [
      {
        content: `😤说点${topic}的大实话！可能会被骂...

最近看到好多人在吹${topic}
但我真的要泼点冷水了...
说点得罪人的真话👇

❌ 那些没人告诉你的真相：
• 根本不是适合所有人，盲目跟风只会浪费时间
• 前期的投入比你想象的大得多，不是随便搞搞就行
• 回报率远没有宣传的那么香，很多人最后都放弃了

🤷‍♀️ 为什么要说这些？
因为我看到太多人被割韭菜
时间花了，钱花了，效果没有
我真的看不下去...

💡 我的建议：
先想清楚自己适不适合
再决定要不要投入
别被焦虑绑架了！独立思考很重要

可能这条会被限流，但看到就是赚到
转发给需要的人！

你们觉得呢？来聊聊真实的感受👇`,
        tags: ['说真话', '人间清醒', '避坑指南', '行业揭秘', '理性分析'],
        imageSuggestion: '有冲击力的警示风格配图，红叉符号、警告标志、或黑白对比强烈的视觉效果'
      },
      {
        content: `📊${topic}的数据真相（可能会被删）

拿数据说话，不吹不黑👇

🔍 行业调研显示：
• 成功率只有不到10%（你没看错）
• 平均周期需要6-12个月，很多人撑不到3个月
• 前期成本回收期很长，现金流压力大

📈 横向对比：
我分析了3个主流方案
性价比最高的其实是...第2个
（想知道具体是哪个的评论区问我，这里不方便说太细）

💭 理性建议：
不要被表面光鲜迷惑
数据不会说谎，行业不会骗人
做决策前一定要做好功课，别冲动！

还有想了解的数据维度吗？评论区见👇`,
        tags: ['数据分析', '行业洞察', '理性决策', '真相揭秘', '深度测评'],
        imageSuggestion: '专业的数据图表风格，柱状图、饼图、信息可视化，蓝色商务配色'
      },
      {
        content: `🎭${topic}｜一场精心设计的骗局？

这个标题可能会得罪人
但我真的不吐不快...

🎪 揭秘流量密码：
• 制造焦虑 → 引发恐慌 → 让你觉得不买就亏了
• 贩卖希望 → 描绘美好蓝图 → 收割韭菜
• 营造稀缺 → 限时限量 → 刺激冲动消费

👀 识破套路：
凡是让你"马上行动"的
都要多留个心眼
真正的好机会不需要催促，懂的人都懂

🛡️ 保护自己：
✅ 凡事先查资质，别被包装迷惑
✅ 多渠道验证信息，不要只听一家之言
✅ 小成本试错，别一上来就all in

可能这条会被限流，但看到就是赚到
转发给需要的人！能救一个是一个

你们遇到过类似的套路吗？评论区曝光👇`,
        tags: ['避坑指南', '行业揭秘', '人间清醒', '防骗指南', '必看'],
        imageSuggestion: '警示风格的配图，可以用问号、放大镜、破墙而出的视觉元素，红色为主色调'
      }
    ]
  };

  const styleTemplates = templates[style] || templates['干货'];
  return styleTemplates[variation] || styleTemplates[0];
}

// ===== API 调用函数 =====
async function callMinimaxAPI(prompt: string, systemPrompt: string): Promise<string> {
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.9,
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

async function callKimiAPI(prompt: string, systemPrompt: string): Promise<string> {
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.9,
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

// ===== 生成系统提示词 =====
function createSystemPrompt(style: string): string {
  const structure = CONTENT_STRUCTURES[style as keyof typeof CONTENT_STRUCTURES];
  const buzzwords = BUZZWORDS[style as keyof typeof BUZZWORDS].join('、');
  
  return `你是小红书爆款文案专家，擅长创作能引发高互动、高收藏的爆款笔记。

【你的写作风格】
- ${structure.tone}
- 口语化、真实、有画面感
- 善用emoji增加视觉吸引力

【内容结构要求】
${structure.structure.map((s, i) => `${i + 1}. ${s}`).join('\n')}

【必须使用的热词】
从以下词汇中选择3-5个自然融入：${buzzwords}

【爆款钩子开头】
可以从以下角度选择：${structure.hooks.join('、')}

【输出要求】
- 标题15-25字，使用2-3个emoji，制造好奇心
- 正文200-400字，分段清晰，每段用emoji开头
- 标签5个，与内容高度相关
- 必须输出有效JSON格式`;
}

// ===== 生成用户提示词 =====
function createPrompt(topic: string, style: string, variation: number): string {
  const structure = CONTENT_STRUCTURES[style as keyof typeof CONTENT_STRUCTURES];
  const hooks = structure.hooks;
  const hook = hooks[variation % hooks.length];
  
  // 三个版本的不同切入角度
  const angles = [
    `从"新手踩坑"角度：分享自己刚开始接触${topic}时的真实经历和踩过的坑，语气像闺蜜吐槽`,
    `从"经验总结"角度：作为过来人分享压箱底的技巧和心得，展现专业性和可信度`,
    `从"独特观点"角度：提出一个反常识的发现或新颖观点，引发读者思考和讨论`
  ];
  
  const angle = angles[variation] || angles[0];

  return `请为"${topic}"创作一篇${style}风格的小红书文案。

【切入角度】
${angle}

【钩子建议】
可以使用："${hook}..."

【必须包含的元素】
1. 吸睛标题（15-25字，2-3个emoji）
2. 爆款结构正文（200-400字）
3. 5个相关标签
4. 具体的配图建议（描述画面风格、配色、元素）

【格式要求】
必须输出以下JSON格式，不要有任何其他内容：
{
  "content": "标题\\n\\n正文内容（用\\n换行）",
  "tags": ["标签1", "标签2", "标签3", "标签4", "标签5"],
  "imageSuggestion": "配图建议描述"
}`;
}

// ===== 增强版 AI 响应解析 =====
function parseAIResponse(content: string, style: string): GeneratedContent {
  console.log('Parsing AI response:', content.substring(0, 200) + '...');
  
  try {
    // 尝试多种方式提取 JSON
    let jsonStr = '';
    
    // 方法1: 直接匹配 { ... }
    const jsonMatch = content.match(/\{[\s\S]*?\}(?=\s*$|\s*\n)/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    // 方法2: 匹配 ```json ... ``` 代码块
    if (!jsonStr) {
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      }
    }
    
    // 方法3: 找到第一个 { 和最后一个 }
    if (!jsonStr) {
      const startIdx = content.indexOf('{');
      const endIdx = content.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        jsonStr = content.substring(startIdx, endIdx + 1);
      }
    }
    
    if (jsonStr) {
      // 清理可能的格式问题
      jsonStr = jsonStr
        .replace(/\n\s*\/\/.*$/gm, '') // 移除注释
        .replace(/,\s*([}\]])/g, '$1'); // 移除尾随逗号
      
      const parsed = JSON.parse(jsonStr);
      
      return {
        content: parsed.content || content,
        tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : generateDefaultTags(topic, style),
        imageSuggestion: parsed.imageSuggestion || generateDefaultImageSuggestion(style),
      };
    }
  } catch (e) {
    console.error('JSON parse failed:', e);
    // 尝试从文本中提取信息
    return extractFromText(content, style);
  }
  
  // 完全无法解析，使用文本提取
  return extractFromText(content, style);
}

// 从纯文本中提取信息
function extractFromText(content: string, style: string): GeneratedContent {
  const lines = content.split('\n').filter(line => line.trim());
  
  // 第一行通常包含标题
  const title = lines[0] || '小红书文案分享';
  
  // 其余是正文
  const body = lines.slice(1).join('\n');
  
  return {
    content: `${title}\n\n${body}`,
    tags: generateDefaultTags('', style),
    imageSuggestion: generateDefaultImageSuggestion(style)
  };
}

// 生成默认标签
function generateDefaultTags(topic: string, style: string): string[] {
  const baseTags: Record<string, string[]> = {
    '干货': ['干货满满', '建议收藏', '经验分享', '实用技巧', '避坑指南'],
    '情感': ['情感共鸣', '治愈系', '真实分享', '温暖', '深夜树洞'],
    '争议': ['人间清醒', '说真话', '深度思考', '避坑指南', '必看']
  };
  return baseTags[style] || baseTags['干货'];
}

// 生成默认配图建议
function generateDefaultImageSuggestion(style: string): string {
  const suggestions: Record<string, string> = {
    '干货': '专业风格的教程配图，清晰的步骤展示，明亮整洁的桌面场景',
    '情感': '温暖治愈的风景照，柔和光线，可以是日出日落或温馨室内场景',
    '争议': '有冲击力的对比图或警示风格配图，强烈的视觉对比，引发思考'
  };
  return suggestions[style] || '与主题相关的高质量配图，色调和谐，构图美观';
}

// 存储当前topic供extractFromText使用
let currentTopic = '';

// ===== 生成内容（带 fallback 和重试） =====
async function generateContent(
  topic: string, 
  style: string, 
  variation: number,
  retryCount = 0
): Promise<GeneratedContent> {
  currentTopic = topic;
  const systemPrompt = createSystemPrompt(style);
  const prompt = createPrompt(topic, style, variation);
  
  const maxRetries = 2;
  
  // 先尝试 Minimax
  try {
    console.log(`[${variation}] Trying Minimax...`);
    const content = await callMinimaxAPI(prompt, systemPrompt);
    return parseAIResponse(content, style);
  } catch (minimaxError) {
    console.log(`[${variation}] Minimax failed, trying Kimi...`);
    
    // Minimax 失败，尝试 Kimi
    try {
      const content = await callKimiAPI(prompt, systemPrompt);
      return parseAIResponse(content, style);
    } catch (kimiError) {
      console.log(`[${variation}] Kimi also failed.`);
      
      // 如果还有重试次数，递归重试
      if (retryCount < maxRetries) {
        console.log(`[${variation}] Retrying (${retryCount + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return generateContent(topic, style, variation, retryCount + 1);
      }
      
      // 所有尝试都失败，使用模拟数据
      console.log(`[${variation}] Using mock content`);
      return generateMockContent(topic, style, variation);
    }
  }
}

// ===== API Route Handler =====
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

    if (!['干货', '情感', '争议'].includes(style)) {
      return NextResponse.json(
        { error: 'style 必须是：干货、情感、争议' },
        { status: 400 }
      );
    }

    console.log(`Generating content for: "${topic}" (${style})`);

    // 并行生成3个不同版本
    const results = await Promise.all([
      generateContent(topic, style, 0),
      new Promise<GeneratedContent>(resolve => 
        setTimeout(() => resolve(generateContent(topic, style, 1)), 300)
      ),
      new Promise<GeneratedContent>(resolve => 
        setTimeout(() => resolve(generateContent(topic, style, 2)), 600)
      )
    ]);

    console.log('Generated 3 variations successfully');

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { 
        error: '生成失败，请稍后重试', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
