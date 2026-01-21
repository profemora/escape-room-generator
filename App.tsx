import React, { useState } from 'react';
import { generateEscapeRoomContent } from './services/geminiService';
import { generateEscapeRoomHtml } from './utils/htmlGenerator';
import { EscapeRoomData, GenerationStatus } from './types';
import { BookOpen, Download, Play, RefreshCw, Zap, Sparkles, BrainCircuit, Edit3 } from 'lucide-react';
import { Editor } from './Editor';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [escapeRoomData, setEscapeRoomData] = useState<EscapeRoomData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('escape_room.html');
  const [isEditing, setIsEditing] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setErrorMsg("Please enter some text to start.");
      return;
    }

    setStatus(GenerationStatus.GENERATING);
    setErrorMsg(null);

    try {
      const data = await generateEscapeRoomContent(inputText);
      updateData(data);
      setStatus(GenerationStatus.SUCCESS);
    } catch (e: any) {
      console.error(e);
      setStatus(GenerationStatus.ERROR);
      setErrorMsg(e.message || "An error occurred during generation.");
    }
  };

  const updateData = (data: EscapeRoomData) => {
    setEscapeRoomData(data);
    setFileName(`${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`);
  };

  const handleSaveEdit = (newData: EscapeRoomData) => {
    updateData(newData);
    setIsEditing(false);
  };

  const handleDownload = () => {
    if (!escapeRoomData) return;
    // Generate HTML with previewMode = false (strict rules)
    const html = generateEscapeRoomHtml(escapeRoomData, false);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePreview = () => {
    if (!escapeRoomData) return;
    // Generate HTML with previewMode = true (skipping allowed)
    const html = generateEscapeRoomHtml(escapeRoomData, true);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FFF5E4] font-sans text-gray-700 p-4 md:p-8">
      {isEditing && escapeRoomData && (
        <Editor 
          initialData={escapeRoomData} 
          onSave={handleSaveEdit} 
          onCancel={() => setIsEditing(false)} 
        />
      )}

      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-md mb-4">
            <BrainCircuit className="w-8 h-8 text-[#FFB3BA] mr-2" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Escape Room Generator
            </h1>
          </div>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Turn your notes and study texts into an interactive adventure for your students.
          </p>
        </header>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-b-8 border-[#AEC6CF] transition-all duration-300">
          
          {/* Input Section */}
          {status === GenerationStatus.IDLE || status === GenerationStatus.ERROR ? (
            <div className="p-6 md:p-10">
              <label className="block text-xl font-bold mb-4 text-gray-700 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-[#77DD77]" />
                Your Source Text
              </label>
              <textarea
                className="w-full h-64 p-5 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-[#AEC6CF] focus:ring-4 focus:ring-[#AEC6CF]/20 outline-none transition-all text-lg resize-none placeholder-gray-400"
                placeholder="Paste your notes, summary, or book chapter here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              
              {errorMsg && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  {errorMsg}
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={!inputText.trim()}
                  className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-[#FFB3BA] rounded-full hover:bg-[#ff9aa2] focus:outline-none focus:ring-offset-2 focus:ring-4 focus:ring-[#FFB3BA]/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Escape Room
                </button>
              </div>
            </div>
          ) : null}

          {/* Loading Section */}
          {status === GenerationStatus.GENERATING && (
            <div className="p-10 text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#FDFD96] border-t-[#FFB347] mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">AI is working its magic...</h2>
              <p className="text-gray-500">Creating puzzles, questions, and story.</p>
              <div className="mt-8 flex justify-center space-x-2">
                <div className="w-3 h-3 bg-[#AEC6CF] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-[#77DD77] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-[#FFB3BA] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}

          {/* Success Section */}
          {status === GenerationStatus.SUCCESS && escapeRoomData && (
            <div className="p-6 md:p-10 text-center bg-gradient-to-b from-white to-[#f9fdf9]">
              <div className="w-20 h-20 bg-[#77DD77] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Escape Room Ready!</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                The HTML file has been generated successfully. You can download it, preview it, or modify the content below.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10 flex-wrap">
                 <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center px-8 py-4 bg-white border-2 border-[#AEC6CF] text-[#AEC6CF] hover:bg-[#AEC6CF] hover:text-white rounded-full font-bold text-lg shadow-sm transition-all hover:shadow-md min-w-[200px]"
                >
                  <Edit3 className="w-5 h-5 mr-2" />
                  Edit Content
                </button>
                <button
                  onClick={handlePreview}
                  className="flex items-center justify-center px-8 py-4 bg-[#AEC6CF] hover:bg-[#9ccadd] text-white rounded-full font-bold text-lg shadow-md transition-transform hover:scale-105 min-w-[200px]"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Preview
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center px-8 py-4 bg-[#FFB347] hover:bg-[#ffaa33] text-white rounded-full font-bold text-lg shadow-md transition-transform hover:scale-105 min-w-[200px]"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download HTML
                </button>
              </div>

              <button
                onClick={() => setStatus(GenerationStatus.IDLE)}
                className="text-gray-400 hover:text-gray-600 font-medium flex items-center justify-center mx-auto transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Create New Escape Room
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm text-gray-400 font-medium">
          <div className="p-4 bg-white rounded-xl shadow-sm">
            <span className="block text-[#FFB3BA] text-xl font-bold mb-1">20</span>
            MCQ Items
          </div>
          <div className="p-4 bg-white rounded-xl shadow-sm">
            <span className="block text-[#AEC6CF] text-xl font-bold mb-1">14</span>
            Matching Pairs
          </div>
          <div className="p-4 bg-white rounded-xl shadow-sm">
            <span className="block text-[#FFB347] text-xl font-bold mb-1">8</span>
            Fill-in Gaps
          </div>
          <div className="p-4 bg-white rounded-xl shadow-sm">
            <span className="block text-[#B39EB5] text-xl font-bold mb-1">2</span>
            Open Questions
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;