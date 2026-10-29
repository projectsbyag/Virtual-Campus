import React, { useState, useRef, useEffect } from 'react';
import { CampusAIMessage } from '../types';
import { campusAiService, QUICK_PROMPTS } from '../services/campusAiService';

interface CampusAiViewProps {
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const CampusAiView: React.FC<CampusAiViewProps> = ({ onShowToast }) => {
  const [messages, setMessages] = useState<CampusAIMessage[]>(() => campusAiService.getMessages());
  const [inputPrompt, setInputPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isStreaming) return;

    setInputPrompt('');
    setIsStreaming(true);
    setStreamingContent('');

    campusAiService.addUserMessage(prompt);
    setMessages([...campusAiService.getMessages()]);

    try {
      const stream = campusAiService.streamResponse(prompt);
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
    onShowToast('AI conversation reset', 'info');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    onShowToast('Copied text to clipboard', 'success');
  };

  return (
    <div className="fade-in bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] overflow-hidden">
      
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-750">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white flex items-center justify-center text-xl">
            <i className="fas fa-robot"></i>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-base text-gray-900 dark:text-white">Campus AI Study Assistant</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                Online
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Curriculum-aligned assistant for STEM courses, proofs, and assignments
            </p>
          </div>
        </div>

        <button
          onClick={handleClear}
          title="Clear Chat History"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <i className="fas fa-trash-alt text-sm"></i>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white flex items-center justify-center text-sm mr-2.5 shrink-0 mt-1">
                  <i className="fas fa-robot"></i>
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-2xl flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-lg text-sm leading-relaxed ${
                    isUser
                      ? 'bg-black text-white dark:bg-white dark:text-black rounded-br-none shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-750 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans space-y-2">
                    {msg.content}
                  </div>

                  {/* Interactive Practice Quiz */}
                  {msg.quiz && (
                    <div className="mt-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-primary dark:text-primaryLight mb-2">
                        <i className="fas fa-check-circle"></i>
                        <span>Interactive Concept Check</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white mb-3">
                        {msg.quiz.question}
                      </p>
                      <div className="space-y-2">
                        {msg.quiz.options.map((opt, idx) => {
                          const hasAnswered = quizAnswers[msg.id] !== undefined;
                          const isCorrect = idx === msg.quiz?.correctIndex;
                          const isSelected = quizAnswers[msg.id] === idx;

                          let btnStyle = 'border-gray-200 dark:border-gray-700 hover:border-primary bg-gray-50 dark:bg-gray-750 text-gray-800 dark:text-gray-200';
                          if (hasAnswered) {
                            if (isCorrect) {
                              btnStyle = 'border-green-500 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-200 font-semibold';
                            } else if (isSelected) {
                              btnStyle = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200';
                            }
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => setQuizAnswers((prev) => ({ ...prev, [msg.id]: idx }))}
                              disabled={hasAnswered}
                              className={`w-full text-left p-2.5 text-xs rounded-lg border transition flex items-center justify-between ${btnStyle}`}
                            >
                              <span><strong className="mr-2">{String.fromCharCode(65 + idx)}.</strong> {opt}</span>
                              {hasAnswered && isCorrect && <i className="fas fa-check text-green-500"></i>}
                            </button>
                          );
                        })}
                      </div>

                      {quizAnswers[msg.id] !== undefined && (
                        <div className="mt-3 p-2.5 rounded bg-gray-50 dark:bg-gray-750 text-xs text-gray-700 dark:text-gray-300 border-l-2 border-primary">
                          <strong>Explanation: </strong> {msg.quiz.explanation}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Course Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200/60 dark:border-gray-700">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                        <i className="fas fa-book-open text-xs"></i>
                        <span>Course Material References:</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citations.map((c, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-white dark:bg-gray-800 text-[11px] font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                          >
                            <i className="fas fa-file-pdf text-red-500 text-[10px]"></i>
                            <span>{c.course}: {c.title}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {!isUser && (
                  <div className="flex items-center space-x-2 mt-1 px-1 text-xs text-gray-400">
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => handleCopy(msg.content)}
                      className="hover:text-gray-600 dark:hover:text-gray-200 transition"
                      title="Copy response"
                    >
                      <i className="fas fa-copy text-xs"></i>
                    </button>
                  </div>
                )}

                {msg.suggestedQuestions && !isStreaming && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(q)}
                        className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-750 hover:bg-gray-200 text-primary dark:text-primaryLight border border-gray-200 dark:border-gray-700 transition"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isStreaming && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary dark:text-primaryLight flex items-center justify-center text-sm mr-2.5 shrink-0 mt-1">
              <i className="fas fa-robot animate-pulse"></i>
            </div>
            <div className="max-w-[85%] sm:max-w-2xl p-4 rounded-lg bg-gray-100 dark:bg-gray-750 text-gray-800 dark:text-gray-200 text-sm leading-relaxed shadow-sm">
              <div className="whitespace-pre-wrap font-sans">
                {streamingContent}
                <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse align-middle"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Cards if starting */}
      {messages.length <= 1 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <p className="text-xs font-semibold text-gray-500 mb-2">Suggested Academic Prompts:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.id}
                onClick={() => handleSend(qp.prompt)}
                className="text-left p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary text-xs transition"
              >
                <div className="font-semibold text-gray-800 dark:text-gray-200">{qp.title}</div>
                <p className="text-gray-500 truncate mt-0.5">{qp.prompt}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prompt Input */}
      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isStreaming}
            placeholder="Ask Campus AI about courses, lecture notes, proofs, or homework..."
            className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isStreaming}
            className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 disabled:opacity-50 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 shrink-0"
          >
            <i className="fas fa-paper-plane text-xs"></i>
            <span>Send</span>
          </button>
        </form>
      </div>

    </div>
  );
};
