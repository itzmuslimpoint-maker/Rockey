import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, BarChart2 } from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area 
} from 'recharts';
import { useChatStore } from '../store/useChatStore';

interface AIAssistantProps {
  igProfile: any;
  igStats: any;
  usage: any;
  stats: any;
  chartData: any;
}

const AIAssistant = ({ igProfile, igStats, usage, stats, chartData }: AIAssistantProps) => {
  const { messages, isLoading, addMessage, setLoading } = useChatStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const parseAssistantResponse = (text: string) => {
    const chartRegex = /```chart-spec\n([\s\S]*?)\n```/;
    const match = text.match(chartRegex);
    
    if (match) {
      try {
        const spec = JSON.parse(match[1]);
        const cleanContent = text.replace(chartRegex, '').trim();
        return { content: cleanContent, metadata: spec };
      } catch (e) {
        console.error("Failed to parse chart spec:", e);
      }
    }
    return { content: text, metadata: undefined };
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    addMessage({ role: 'user', content: userMessage });
    setLoading(true);

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const history = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const systemPrompt = `You are an expert Instagram Growth Strategist for DMflow. Your goal is to help users analyze their performance and provide actionable growth strategies.

### USER PROFILE & METRICS
- **Username**: ${igProfile?.username || 'Not connected'}
- **Full Name**: ${igProfile?.full_name || 'N/A'}
- **Biography**: ${igProfile?.biography || 'No bio provided'}
- **Followers**: ${igStats?.followers || 0}
- **Following**: ${igStats?.follows || 0}
- **Total Posts**: ${igStats?.posts || 0}
- **Total Reels**: ${igStats?.reels || 0}

### PERFORMANCE DATA
- **Recent Engagement (Last 7 Days)**: ${JSON.stringify(chartData)}
- **Usage Statistics (Current Month)**:
  - DMs Sent: ${usage?.dmsSent || 0}
  - Active Automations: ${usage?.automationsCount || 0}
  - Total Contacts: ${usage?.contactsCount || 0}

### KEY TRENDS
${stats?.map((s: any) => `- ${s.label}: ${s.value} (${s.change || '0%'} change)`).join('\n') || 'No recent trend data available'}

### ANALYTICS CHART FEATURE
If the user asks for a chart (e.g., "show me a chart of growth", "visualize engagement"), you MUST include a JSON block in your response using the following format:
\`\`\`chart-spec
{
  "type": "chart",
  "chartType": "line" | "bar" | "area",
  "data": [ { "name": "Jan", "value": 100 }, ... ],
  "title": "Follower Growth",
  "dataKey": "value"
}
\`\`\`
Use the user's available data to construct the chart. If the user asks for data you don't have (like 30 days), use the provided 7-day data or reasonably estimate it based on the trends provided in the metrics.

### STRATEGIC GUIDELINES
1. **Actionable Insights**: Always link your advice to the provided metrics.
2. **Tone**: Be professional, data-driven, and highly encouraging.
3. **Consistency**: Recommend a posting schedule based on their current post/reel ratio.

Use the data above to provide highly personalized responses.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history,
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: systemPrompt
        }
      });

      const responseText = response.text || "I'm sorry, I couldn't generate a response.";
      const { content, metadata } = parseAssistantResponse(responseText);
      
      addMessage({ 
        role: 'assistant', 
        content: content || "Here is the chart you requested:",
        metadata 
      });
    } catch (error) {
      console.error("AI Assistant Error:", error);
      addMessage({ role: 'assistant', content: "Sorry, I encountered an error. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  const renderChart = (metadata: any) => {
    if (!metadata || metadata.type !== 'chart') return null;

    const { chartType, data, title, dataKey } = metadata;

    return (
      <div className="mt-4 w-full h-[300px] bg-white rounded-xl p-4 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{title}</h3>
          <BarChart2 className="w-4 h-4 text-blue-600" />
        </div>
        <ResponsiveContainer width="100%" height="80%">
          {chartType === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey={dataKey} stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
            </LineChart>
          ) : chartType === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Bar dataKey={dataKey} fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey={dataKey} stroke="#2563eb" fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  const quickActions = [
    "Visualize my follower growth",
    "Show engagement chart",
    "Analyze my current growth",
    "Best time to post reels?"
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col p-4 md:p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
            <Brain className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">AI Assistant</h1>
        </div>
        <p className="text-slate-500 text-sm font-medium">Your personal Instagram strategist with data visualizer.</p>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-none font-medium'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                {msg.metadata && renderChart(msg.metadata)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => setInput(action)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-600 hover:border-blue-300 hover:text-blue-600 uppercase tracking-widest transition-all shadow-sm"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask anything about Instagram..."
              className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="p-3.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-50 disabled:grayscale active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
