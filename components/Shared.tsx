import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: React.ElementType;
}

export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, icon: Icon, ...props }: ButtonProps) => {
  const variants: Record<string, string> = {
    primary: "bg-accent text-white hover:bg-purple-600 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40",
    secondary: "bg-black/10 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-black/20 dark:hover:bg-white/20 border border-black/10 dark:border-white/10",
    ghost: "hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      {...props}
      className={`
        min-h-[44px] min-w-[44px] px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 
        transition-all duration-200 active:scale-95 hover:-translate-y-0.5 
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100
        ${variants[variant]} ${className}
      `}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`
    bg-white/60 dark:bg-white/5 border border-white/20 dark:border-white/10 
    backdrop-blur-md rounded-2xl p-6 shadow-sm dark:shadow-none 
    animate-slideUp transition-all duration-300 hover:shadow-md dark:hover:bg-white/[0.07]
    ${className}
  `}>
    {children}
  </div>
);

export const Input = ({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props}
    className={`
      w-full min-h-[44px] bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 
      rounded-lg px-4 py-3 text-slate-900 dark:text-white 
      placeholder-slate-500 dark:placeholder-gray-500 
      focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent 
      transition-all ${className}
    `}
  />
);

// New Component: Renders AI Markdown-like text as native UI
export const RichTextRenderer = ({ content }: { content: string }) => {
  if (!content) return null;

  // Simple parser for headers, bullets, and paragraphs
  const lines = content.split('\n');
  
  return (
    <div className="space-y-4 text-slate-800 dark:text-gray-200 leading-loose font-sans">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2"></div>;

        // Headers
        if (trimmed.startsWith('###')) return <h4 key={i} className="text-lg font-bold text-accent mt-6 mb-2 tracking-tight">{trimmed.replace(/###/g, '')}</h4>;
        if (trimmed.startsWith('##')) return <h3 key={i} className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-3 tracking-tight">{trimmed.replace(/##/g, '')}</h3>;
        if (trimmed.startsWith('#')) return <h2 key={i} className="text-2xl font-extrabold text-slate-900 dark:text-white mt-10 mb-4 pb-3 border-b border-black/10 dark:border-white/10 tracking-tight">{trimmed.replace(/#/g, '')}</h2>;

        // Blockquotes (The "Juice" requested)
        if (trimmed.startsWith('>')) {
           return (
             <blockquote key={i} className="border-l-4 border-accent/50 pl-4 my-4 py-1 italic text-slate-600 dark:text-slate-400 bg-black/5 dark:bg-white/5 rounded-r-lg">
                "{trimmed.replace(/>/g, '').trim()}"
             </blockquote>
           );
        }

        // Horizontal Rules
        if (trimmed === '---' || trimmed === '***') {
           return <hr key={i} className="my-8 border-black/10 dark:border-white/10" />;
        }

        // Lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-3 ml-1 my-1">
               <span className="text-accent font-bold mt-1.5 text-xs">●</span>
               <span className="flex-1" dangerouslySetInnerHTML={{ 
                 __html: trimmed.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-white font-bold">$1</strong>').replace(/\*(.*?)\*/g, '<em class="text-accent">$1</em>')
               }} />
            </div>
          );
        }
        
        // Numbered Lists
        if (/^\d+\./.test(trimmed)) {
           return (
             <div key={i} className="flex gap-3 ml-1 my-2">
                <span className="text-accent font-bold font-mono bg-accent/10 px-1.5 py-0.5 rounded text-xs h-fit mt-0.5">{trimmed.split('.')[0]}.</span>
                <span className="flex-1" dangerouslySetInnerHTML={{ 
                   __html: trimmed.substring(trimmed.indexOf('.') + 1).replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-white font-bold">$1</strong>').replace(/\*(.*?)\*/g, '<em class="text-accent">$1</em>')
                }} />
             </div>
           );
        }

        // Standard Paragraph with Bold support
        return (
          <p key={i} dangerouslySetInnerHTML={{ 
            __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-white font-bold">$1</strong>').replace(/\*(.*?)\*/g, '<em class="text-accent">$1</em>')
          }} />
        );
      })}
    </div>
  );
};