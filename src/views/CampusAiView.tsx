import React, { useState, useRef, useEffect } from 'react';
import { CampusAIMessage } from '../types';
import { campusAiService, QUICK_PROMPTS, CampusAiStudyMode } from '../services/campusAiService';

interface CampusAiViewProps {
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const CampusAiView: React.FC<CampusAiViewProps> = ({ onShowToast }) => {
  const [messages, setMessages] = useState<CampusAIMessage[]>(() => campusAiService.getMessages());
  const [inputPrompt, setInputPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [studyMode, setStudyMode] = useState<CampusAiStudyMode>('tutor');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll handler targeting the dedicated chat container
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, streamingContent]);

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isStreaming) return;

    setInputPrompt('');
    setIsStreaming(true);
    setStreamingContent('');

    // Prepend mode context if in specific mode
    let enhancedPrompt = prompt;
    if (studyMode === 'exam_prep' && !prompt.toLowerCase().includes('quiz')) {
      enhancedPrompt = `[Exam Prep Mode] ${prompt}`;
    } else if (studyMode === 'code_review') {
      enhancedPrompt = `[Code & Complexity Review] ${prompt}`;
    }

    campusAiService.addUserMessage(prompt);
    setMessages([...campusAiService.getMessages()]);

    try {
      const stream = campusAiService.streamResponse(enhancedPrompt);
      let accumulated = '';
      for await (const chunk of stream) {
        accumulated += chunk;
        setStreamingContent(accumulated);
      }
      setStreamingContent('');
      setMessages([...campusAiService.getMessages()]);
    } catch {
      onShowToast('Error generating AI response. Please try again.', 'error');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClear = () => {
    campusAiService.clearHistory();
    setMessages([...campusAiService.getMessages()]);
    setStreamingContent('');
    setQuizAnswers({});
    onShowToast('AI conversation reset', 'info');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    onShowToast('Copied response to clipboard', 'success');
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(id);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
    onShowToast('Code block copied', 'success');
  };

  // Inline formatting helper: parses bold **text**, inline `code`, and math $formula$
  const parseInlineFormatting = (text: string): React.ReactNode => {
    // Regex for:
    // 1. Math formulas ($...$ or $$...$$)
    // 2. Inline code (`...`)
    // 3. Bold text (**...**)
    const tokens = text.split(/(\$\$[\s\S]+?\$\$|\$[^\$]+?\$|`[^`]+?`|\*\*[^*]+?\*\*)/g);

    return tokens.map((token, idx) => {
      if ((token.startsWith('$$') && token.endsWith('$$')) || (token.startsWith('$') && token.endsWith('$'))) {
        const formula = token.replace(/^\$\$?|\$\$?$/g, '');
        return (
          <span
            key={idx}
            className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white mx-0.5"
          >
            {formula}
          </span>
        );
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code
            key={idx}
            className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white mx-0.5"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      if (token.startsWith('**') && token.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-black dark:text-white">
            {token.slice(2, -2)}
          </strong>
        );
      }
      return token;
    });
  };

  // Helper to render markdown-like formatting, code blocks, lists and headers cleanly
  const renderFormattedContent = (content: string, msgId: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
      <div className="space-y-3 font-sans leading-relaxed text-sm text-neutral-800 dark:text-neutral-200">
        {parts.map((part, pIdx) => {
          if (part.startsWith('```') && part.endsWith('```')) {
            const lines = part.slice(3, -3).trim().split('\n');
            const lang = lines[0].trim() || 'code';
            const codeBody = (lines.length > 1 ? lines.slice(1).join('\n') : lines[0]).trim();
            const codeBlockId = `${msgId}-code-${pIdx}`;

            return (
              <div
                key={pIdx}
                className="my-3 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100 overflow-hidden shadow-md"
              >
                <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-800 text-xs text-neutral-400 font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-700"></span>
                    <span className="uppercase tracking-wider font-semibold">{lang}</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(codeBody, codeBlockId)}
                    className="flex items-center space-x-1.5 hover:text-white transition px-2 py-1 rounded hover:bg-neutral-800"
                    title="Copy code"
                  >
                    <i className={copiedCodeIdx === codeBlockId ? 'fas fa-check text-white' : 'fas fa-copy'}></i>
                    <span>{copiedCodeIdx === codeBlockId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-neutral-200">
                  <code>{codeBody}</code>
                </pre>
              </div>
            );
          }

          // Render normal markdown lines (headers, bullet points, numbered lists, math)
          const subLines = part.split('\n');
          return (
            <div key={pIdx} className="space-y-2">
              {subLines.map((line, lIdx) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={lIdx} className="h-1.5"></div>;

                // Headers
                if (trimmed.startsWith('### ')) {
                  return (
                    <h3
                      key={lIdx}
                      className="text-base font-bold text-black dark:text-white pt-2.5 pb-1 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-4 bg-black dark:bg-white rounded-full"></span>
                      {parseInlineFormatting(trimmed.replace('### ', ''))}
                    </h3>
                  );
                }
                if (trimmed.startsWith('#### ')) {
                  return (
                    <h4 key={lIdx} className="text-sm font-bold text-black dark:text-white pt-1">
                      {parseInlineFormatting(trimmed.replace('#### ', ''))}
                    </h4>
                  );
                }

                // Bullet points
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                  return (
                    <div key={lIdx} className="flex items-start space-x-2 pl-2">
                      <span className="text-black dark:text-white font-bold leading-tight mt-1">•</span>
                      <div className="flex-1 leading-relaxed">
                        {parseInlineFormatting(trimmed.slice(2))}
                      </div>
                    </div>
                  );
                }

                // Numbered lists
                const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
                if (numMatch) {
                  return (
                    <div key={lIdx} className="flex items-start space-x-2 pl-1 my-1">
                      <span className="w-5 h-5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {numMatch[1]}
                      </span>
                      <div className="flex-1 leading-relaxed">
                        {parseInlineFormatting(numMatch[2])}
                      </div>
                    </div>
                  );
                }

                return (
                  <p key={lIdx} className="leading-relaxed">
                    {parseInlineFormatting(line)}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const filteredPrompts = QUICK_PROMPTS.filter((qp) => {
    if (selectedCourseFilter === 'all') return true;
    return qp.courseTag === selectedCourseFilter;
  });

  return (
    <div className="fade-in flex flex-col h-full w-full max-w-7xl mx-auto rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-xl">
      
      {/* Top Studio Header Bar */}
      <div className="px-4 py-3 sm:px-6 bg-black text-white dark:bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-white text-black dark:bg-white dark:text-black flex items-center justify-center text-lg font-bold shadow-md">
            <i className="fas fa-brain"></i>
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="font-extrabold text-base tracking-tight text-white">Campus AI</h1>
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                v2.5 Studio
              </span>
              <span className="hidden sm:inline-flex items-center space-x-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Model</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 truncate max-w-xs sm:max-w-md mt-0.5">
              Curriculum Grounding • Math proofs, algorithms, practice exams & papers
            </p>
          </div>
        </div>

        {/* Study Mode Selector & Controls */}
        <div className="flex items-center space-x-2">
          {/* Study Modes Pill Buttons */}
          <div className="hidden lg:flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs">
            {(
              [
                { id: 'tutor', label: 'Tutor', icon: 'fas fa-graduation-cap' },
                { id: 'exam_prep', label: 'Exam Prep', icon: 'fas fa-tasks' },
                { id: 'code_review', label: 'Code Review', icon: 'fas fa-code' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setStudyMode(m.id);
                  campusAiService.setMode(m.id);
                  onShowToast(`Switched mode: ${m.label}`, 'info');
                }}
                className={`px-3 py-1.5 rounded-md font-medium transition flex items-center space-x-1.5 ${
                  studyMode === m.id
                    ? 'bg-white text-black shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <i className={`${m.icon} text-xs`}></i>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
            title="Toggle Curriculum Sidebar"
          >
            <i className="fas fa-sliders-h text-sm"></i>
          </button>

          <button
            onClick={handleClear}
            title="Clear Chat History"
            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-medium transition flex items-center space-x-1.5"
          >
            <i className="fas fa-trash-alt text-xs"></i>
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Workspace with Split Quick Drawer */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        
        {/* Left Side: Curriculum Context & Quick Prompts Drawer */}
        <aside
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } absolute md:static z-20 inset-y-0 left-0 w-72 bg-neutral-50 dark:bg-neutral-900/60 border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-transform duration-200 ease-in-out shrink-0`}
        >
          {/* Header */}
          <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fas fa-book-reader text-xs text-black dark:text-white"></i>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Course Syllabus Filter
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-neutral-400 hover:text-black dark:hover:text-white p-1"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>

          {/* Course filter pill list */}
          <div className="p-3 flex flex-wrap gap-1.5 border-b border-neutral-200 dark:border-neutral-800">
            {['all', 'CSC 301', 'CSC 340', 'CSC 380', 'CSC 415'].map((code) => (
              <button
                key={code}
                onClick={() => setSelectedCourseFilter(code)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition ${
                  selectedCourseFilter === code
                    ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-sm'
                    : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-black dark:hover:border-white'
                }`}
              >
                {code === 'all' ? 'All Courses' : code}
              </button>
            ))}
          </div>

          {/* Quick Academic Starters */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
              Curriculum Starters
            </p>
            {filteredPrompts.map((qp) => (
              <button
                key={qp.id}
                onClick={() => {
                  handleSend(qp.prompt);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className="w-full text-left p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-black dark:hover:border-white transition-all group shadow-sm hover:shadow"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white uppercase font-mono">
                    {qp.courseTag}
                  </span>
                  <i className={`${qp.icon} text-neutral-400 group-hover:text-black dark:group-hover:text-white text-xs transition`}></i>
                </div>
                <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 group-hover:underline">
                  {qp.title}
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">
                  {qp.prompt}
                </p>
              </button>
            ))}
          </div>

          {/* Assistant Pro Tip Footer */}
          <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 text-[11px] text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center space-x-1.5 font-semibold text-black dark:text-white mb-1">
              <i className="fas fa-lightbulb text-amber-500 text-xs"></i>
              <span>Pro Tip</span>
            </div>
            Ask Campus AI: <span className="italic">"Test me on B+ Trees"</span> to generate custom exam practice questions!
          </div>
        </aside>

        {/* Right Side: Chat Feed & Fixed Bottom Input */}
        <div className="flex-1 flex flex-col min-w-0 h-full bg-neutral-100/40 dark:bg-neutral-950">
          
          {/* Messages Scroll View - Isolated Scrollable Viewport */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6"
          >
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 sm:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      isUser
                        ? 'bg-black text-white dark:bg-white dark:text-black font-bold text-xs'
                        : 'bg-black text-white dark:bg-white dark:text-black text-sm'
                    }`}
                  >
                    {isUser ? (
                      <i className="fas fa-user text-xs"></i>
                    ) : (
                      <i className="fas fa-brain text-xs"></i>
                    )}
                  </div>

                  {/* Bubble Container */}
                  <div className={`max-w-[88%] sm:max-w-2xl lg:max-w-3xl flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    
                    {/* Role header & timestamp */}
                    <div className="flex items-center space-x-2 text-[11px] text-neutral-500 dark:text-neutral-400 mb-1.5 px-1">
                      <span className="font-semibold text-black dark:text-white">
                        {isUser ? 'You (Student)' : 'Campus AI'}
                      </span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(msg.content)}
                          className="hover:text-black dark:hover:text-white transition ml-2 flex items-center space-x-1"
                          title="Copy whole response"
                        >
                          <i className="fas fa-copy text-[10px]"></i>
                          <span className="text-[10px]">Copy</span>
                        </button>
                      )}
                    </div>

                    {/* Main Message Bubble */}
                    <div
                      className={`p-4 sm:p-5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${
                        isUser
                          ? 'bg-black text-white dark:bg-white dark:text-black rounded-tr-none'
                          : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 rounded-tl-none'
                      }`}
                    >
                      {renderFormattedContent(msg.content, msg.id)}

                      {/* Interactive Quiz Card */}
                      {msg.quiz && (
                        <div className="mt-5 p-4 sm:p-5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border-2 border-neutral-300 dark:border-neutral-800 shadow-sm">
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                              <i className="fas fa-check-double text-emerald-500"></i>
                              <span>Interactive Concept Check</span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black font-semibold">
                              1 Point
                            </span>
                          </div>

                          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4 leading-snug">
                            {msg.quiz.question}
                          </p>

                          <div className="space-y-2">
                            {msg.quiz.options.map((opt, idx) => {
                              const hasAnswered = quizAnswers[msg.id] !== undefined;
                              const isCorrect = idx === msg.quiz?.correctIndex;
                              const isSelected = quizAnswers[msg.id] === idx;

                              let btnClasses = 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:border-black dark:hover:border-white';
                              if (hasAnswered) {
                                if (isCorrect) {
                                  btnClasses = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold ring-1 ring-emerald-500';
                                } else if (isSelected) {
                                  btnClasses = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 ring-1 ring-red-500';
                                } else {
                                  btnClasses = 'opacity-60 border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-500';
                                }
                              }

                              return (
                                <button
                                  key={idx}
                                  onClick={() => setQuizAnswers((prev) => ({ ...prev, [msg.id]: idx }))}
                                  disabled={hasAnswered}
                                  className={`w-full text-left p-3 text-xs rounded-xl border transition-all flex items-center justify-between ${btnClasses}`}
                                >
                                  <div className="flex items-start space-x-2.5">
                                    <span className="w-5 h-5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                                      {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className="leading-relaxed">{opt}</span>
                                  </div>
                                  {hasAnswered && isCorrect && (
                                    <i className="fas fa-check-circle text-emerald-500 text-sm shrink-0 ml-2"></i>
                                  )}
                                  {hasAnswered && isSelected && !isCorrect && (
                                    <i className="fas fa-times-circle text-red-500 text-sm shrink-0 ml-2"></i>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {quizAnswers[msg.id] !== undefined && (
                            <div className="mt-4 p-3.5 rounded-lg bg-white dark:bg-neutral-900 text-xs text-neutral-800 dark:text-neutral-200 border-l-4 border-black dark:border-white shadow-sm leading-relaxed">
                              <span className="font-bold text-black dark:text-white uppercase tracking-wider block mb-1">
                                <i className="fas fa-info-circle mr-1"></i> Solution Walkthrough:
                              </span>
                              {msg.quiz.explanation}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Course Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-4 pt-3.5 border-t border-neutral-200 dark:border-neutral-800">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-1.5">
                            <i className="fas fa-book-open text-xs"></i>
                            <span>Verified Course References:</span>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {msg.citations.map((c, i) => (
                              <div
                                key={i}
                                className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 shadow-sm"
                              >
                                <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black">
                                  {c.course}
                                </span>
                                <span className="font-medium truncate max-w-xs">{c.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Follow-up Suggested Question Chips */}
                    {msg.suggestedQuestions && !isStreaming && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {msg.suggestedQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(q)}
                            className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-neutral-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 transition shadow-sm flex items-center space-x-1.5"
                          >
                            <i className="fas fa-sparkles text-[10px] text-amber-500"></i>
                            <span>{q}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Live Streaming Indicator: clean typography during streaming */}
            {isStreaming && (
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-9 h-9 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-sm shrink-0 shadow-sm">
                  <i className="fas fa-brain animate-pulse"></i>
                </div>
                <div className="max-w-[88%] sm:max-w-2xl lg:max-w-3xl p-5 rounded-2xl rounded-tl-none bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 shadow-sm leading-relaxed">
                  <div className="leading-relaxed font-sans text-sm">
                    {renderFormattedContent(streamingContent, 'streaming')}
                    <span className="inline-block w-2.5 h-4 bg-black dark:bg-white ml-1 animate-pulse align-middle rounded-sm"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Prompt Composer Bar (Stationary at bottom of chat panel) */}
          <div className="p-3 sm:p-4 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
            <div className="max-w-4xl mx-auto">
              
              {/* Quick Prompt Category Chips */}
              <div className="flex items-center space-x-2 mb-2.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 shrink-0">
                  Quick Query:
                </span>
                <button
                  onClick={() => handleSend('Generate an interactive 1-question practice quiz for algorithms')}
                  className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-neutral-700 dark:text-neutral-300 transition whitespace-nowrap"
                >
                  🎯 Quick Quiz
                </button>
                <button
                  onClick={() => handleSend('Explain how Bellman-Ford detects negative weight cycles in graphs')}
                  className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-neutral-700 dark:text-neutral-300 transition whitespace-nowrap"
                >
                  ⚡ Bellman-Ford Cycles
                </button>
                <button
                  onClick={() => handleSend('Break down the Transformer Scaled Dot-Product Attention formula')}
                  className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-neutral-700 dark:text-neutral-300 transition whitespace-nowrap"
                >
                  🧠 Self-Attention Proof
                </button>
                <button
                  onClick={() => handleSend('Summarize Raft consensus states and leader election timers')}
                  className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-neutral-700 dark:text-neutral-300 transition whitespace-nowrap"
                >
                  🌐 Raft Consensus
                </button>
              </div>

              {/* Form Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="relative flex items-center rounded-2xl border-2 border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 focus-within:border-black dark:focus-within:border-white transition-all shadow-sm"
              >
                <div className="pl-4 text-neutral-400">
                  <i className="fas fa-terminal text-sm"></i>
                </div>

                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={isStreaming}
                  placeholder="Ask Campus AI about proofs, lecture notes, homework code, or quizzes... (Press Enter to send)"
                  className="flex-1 py-3 px-3 text-sm bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none resize-none max-h-32"
                />

                <div className="pr-2 flex items-center space-x-1">
                  <button
                    type="submit"
                    disabled={!inputPrompt.trim() || isStreaming}
                    className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 disabled:opacity-40 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow"
                  >
                    <span>Send</span>
                    <i className="fas fa-paper-plane text-[10px]"></i>
                  </button>
                </div>
              </form>

              <div className="flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500 mt-2 px-1">
                <span>Shift + Enter for new line • Enter to submit</span>
                <span className="flex items-center gap-1">
                  <i className="fas fa-shield-alt text-[10px]"></i>
                  <span>Academic honesty aligned</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
