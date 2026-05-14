import { motion, AnimatePresence } from "motion/react";
import { Check, TrendingUp, Users, Heart, ArrowRight } from "lucide-react";
import React, { useState, useEffect } from "react";

const InstagramDM = ({ messages, avatarUrl }: { messages: any[], avatarUrl: string }) => {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const showMessages = () => {
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setVisibleCount(count);
        if (count >= messages.length) {
          clearInterval(interval);
        }
      }, 300);
      return interval;
    };

    const intervalId = showMessages();

    const loopId = setInterval(() => {
      setVisibleCount(0);
      showMessages();
    }, 5000);

    return () => {
      clearInterval(intervalId);
      clearInterval(loopId);
    };
  }, [messages.length]);

  return (
    <div className="flex flex-col gap-2 w-[190px]">
      <AnimatePresence mode="popLayout">
        {messages.slice(0, visibleCount).map((msg, idx) => {
          if (msg.type === 'system') {
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-[11px] text-slate-400 py-1 font-medium"
              >
                {msg.text}
              </motion.div>
            );
          }

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: msg.type === 'sent' ? 10 : -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className={`flex items-end gap-2 ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'received' && (
                <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mb-0.5 shadow-sm border border-white/20">
                  <img 
                    src={avatarUrl} 
                    alt="User Profile Avatar" 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                    referrerPolicy="no-referrer" 
                  />
                </div>
              )}
              
              <div 
                className={`
                  px-3 py-2 text-[13px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]
                  ${msg.type === 'received' 
                    ? 'bg-[#1C1C1C] text-white rounded-[16px]' 
                    : msg.type === 'sent'
                    ? 'bg-[#7C3AED] text-white rounded-[16px]'
                    : 'bg-[#2A2A2A] text-white rounded-full text-center w-full font-medium py-2.5'
                  }
                `}
              >
                {msg.text}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

interface DemoBlockProps {
  label: string;
  heading: string;
  subtext: string;
  image: string;
  messages: any[];
  badge: { icon?: React.ElementType; text: string; color: string };
  glowColor: string;
  rotation: string;
  hideVisual?: boolean;
  isLarge?: boolean;
  bubblePosition?: 'left' | 'right';
  onStart: () => void;
  onInstagramConnect?: () => void;
}

const DemoBlock: React.FC<DemoBlockProps> = ({ 
  label, 
  heading, 
  subtext, 
  image, 
  messages, 
  badge, 
  glowColor,
  rotation,
  hideVisual,
  isLarge,
  bubblePosition,
  onStart,
  onInstagramConnect
}) => {
  const position = bubblePosition || (isLarge ? 'right' : 'left');
  
  return (
    <div className="w-full py-12">
      <div className={`max-w-4xl mx-auto px-6 flex flex-col items-center ${isLarge ? 'gap-16' : 'gap-12'}`}>
        {/* Visual Content */}
        {!hideVisual && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full"
          >
            <div className={`relative ${isLarge ? 'h-[450px] md:h-[650px]' : 'h-[400px] md:h-[500px]'} w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex items-center justify-center`}>
              {/* Glow Background */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isLarge ? 'w-[600px] h-[600px]' : 'w-[400px] h-[400px]'} rounded-full blur-[100px] opacity-40 ${glowColor}`} />
              
              {/* Person Image */}
              <motion.div 
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className={`relative ${isLarge ? 'h-full w-full' : 'h-[90%] w-[85%]'} z-10 flex items-center justify-center ${rotation}`}
              >
                <img 
                  src={image} 
                  alt={heading} 
                  className={`h-full w-full ${isLarge ? 'object-cover' : 'object-contain'}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
  
              {/* Chat Bubbles */}
              {messages.length > 0 && (
                <div className={`absolute ${position === 'right' ? 'right-4 md:right-12 origin-right' : 'left-4 md:left-12 origin-left'} top-1/2 -translate-y-1/2 z-20 ${isLarge ? 'scale-110 md:scale-150' : 'scale-90 md:scale-100'}`}>
                  <InstagramDM messages={messages} avatarUrl={image} />
                </div>
              )}
  
              {/* Floating Badge */}
              {badge.text && (
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className={`absolute top-10 right-10 px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 z-30 text-white font-bold ${badge.color}`}
                >
                  {badge.icon && <badge.icon className="w-4 h-4" />}
                  <span className="text-sm whitespace-nowrap font-bold">{badge.text}</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center space-y-6 max-w-2xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
            {heading}
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            {subtext}
          </p>
          
          <div className="flex flex-col items-center justify-center gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="bg-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg flex items-center gap-2 group shadow-xl shadow-blue-200"
            >
              Start For Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">✓ Meta Verified</span>
              <span className="flex items-center gap-1.5">✓ No Credit Card</span>
              <span className="flex items-center gap-1.5">✓ Instant Setup</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default function Features({ onStart, onInstagramConnect, isPage = false }: { onStart: () => void, onInstagramConnect?: () => void, isPage?: boolean }) {
  const blocks: (Partial<DemoBlockProps> & { label: string; heading: string; subtext: string; image: string; glowColor: string; rotation: string; badge: { text: string; color: string; }; messages: any[]; isLarge: boolean; bubblePosition?: 'left' | 'right' })[] = [
    {
      label: "COMMENT AUTOMATION",
      heading: "Turn Every Comment Into a Sale",
      subtext: "Auto-reply to every comment with a personalized DM — 24/7, even while you sleep.",
      image: "https://images.pexels.com/photos/36496350/pexels-photo-36496350.png",
      glowColor: "bg-yellow-400",
      rotation: "rotate(-2deg)",
      badge: { text: "", color: "" },
      messages: [],
      isLarge: true
    },
    {
      label: "GROWTH LOCK",
      heading: "Convert Viewers Into Real Followers",
      subtext: "Only verified followers get your exclusive content — everyone else gets prompted automatically.",
      image: "https://images.pexels.com/photos/36495016/pexels-photo-36495016.png",
      glowColor: "bg-blue-400",
      rotation: "rotate(2deg)",
      badge: { text: "", color: "" },
      messages: [],
      isLarge: true,
      bubblePosition: 'left'
    }
  ];

  return (
    <section id="features" className="bg-white overflow-hidden">
      {/* Existing Heading Section - Preserved as requested */}
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-6 text-center">
        {isPage ? (
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4 text-slate-900">Everything You Need to Dominate Instagram</h1>
        ) : (
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-4 text-slate-900">Everything You Need to Dominate Instagram</h2>
        )}
        <p className="text-slate-500 max-w-xl mx-auto">Powerful automation tools designed specifically for creators and brands.</p>
      </div>

      {/* New Demo Blocks */}
      <div className="flex flex-col gap-[100px] pb-24">
        {blocks.map((block, i) => (
          <DemoBlock 
            key={i}
            {...block}
            onStart={onStart}
            onInstagramConnect={onInstagramConnect}
          />
        ))}
      </div>
    </section>
  );
}
