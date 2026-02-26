'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw, Wand2, Lightbulb, Heart, MessageCircle } from 'lucide-react';

interface GeneratedContent {
  content: string;
  tags: string[];
  imageSuggestion: string;
}

export default function Home() {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState<'干货' | '情感' | '争议'>('干货');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratedContent[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState('');

  const generateContent = async () => {
    if (!topic.trim()) {
      setError('请输入主题');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, style }),
      });
      
      if (!response.ok) {
        throw new Error('生成失败');
      }
      
      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError('生成失败，请重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-red-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
              小红书文案生成器
            </h1>
          </div>
          <span className="text-sm text-gray-500">AI 帮你写爆款</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              输入主题 <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例如：程序员如何开启副业、我的转行经历、面试技巧分享..."
              className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none resize-none transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              选择风格
            </label>
            <div className="flex gap-3">
              {(['干货', '情感', '争议'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                    style === s
                      ? 'border-rose-500 bg-rose-50 text-rose-700'
                      : 'border-gray-200 hover:border-rose-200 text-gray-600'
                  }`}
                >
                  {s === '干货' && <Lightbulb className="w-4 h-4" />}
                  {s === '情感' && <Heart className="w-4 h-4" />}
                  {s === '争议' && <MessageCircle className="w-4 h-4" />}
                  {s}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={generateContent}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl font-semibold shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                AI 正在创作...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                生成文案
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              为你生成了 {results.length} 个版本
            </h2>
            
            {results.map((result, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden"
              >
                <div className="px-6 py-4 bg-gradient-to-r from-rose-50 to-white border-b border-rose-100 flex items-center justify-between">
                  <span className="font-medium text-rose-700">
                    版本 {index + 1}
                  </span>
                  <button
                    onClick={() => copyToClipboard(
                      `${result.content}\n\n${result.tags.map(t => `#${t}`).join(' ')}`,
                      index
                    )}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-rose-600 transition-colors"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-4 h-4" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        复制
                      </>
                    )}
                  </button>
                </div>
                
                <div className="p-6">
                  {/* Content */}
                  <div className="mb-4 text-gray-800 whitespace-pre-line leading-relaxed">
                    {result.content}
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {result.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Image Suggestion */}
                  <div className="pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">💡 配图建议：</span>
                    <span className="text-sm text-gray-700 ml-1">
                      {result.imageSuggestion}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        {!results.length && !loading && (
          <div className="mt-12 text-center text-gray-500">
            <p className="mb-2">💡 小贴士</p>
            <p className="text-sm">输入具体的主题，AI会生成更贴合的文案</p>
            <p className="text-sm mt-1">例如："程序员副业月入过万的5个方法"</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 text-center text-sm text-gray-400">
        <p>Made with AI · 仅供学习参考</p>
      </footer>
    </div>
  );
}
