import React, { useState, useEffect } from 'react';
import { EscapeRoomData, MCQ, MatchingPair, FillGap, OpenQuestion } from './types';
import { Save, X, ChevronDown, ChevronRight, AlertCircle, Check, Trash2, Plus } from 'lucide-react';

interface EditorProps {
  initialData: EscapeRoomData;
  onSave: (data: EscapeRoomData) => void;
  onCancel: () => void;
}

export const Editor: React.FC<EditorProps> = ({ initialData, onSave, onCancel }) => {
  const [data, setData] = useState<EscapeRoomData>(JSON.parse(JSON.stringify(initialData)));
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleSave = () => {
    onSave(data);
  };

  const SectionHeader = ({ title, id, color, count }: { title: string, id: string, color: string, count?: string }) => (
    <button 
      onClick={() => toggleSection(id)}
      className={`w-full flex items-center justify-between p-4 bg-white border-l-8 ${color} rounded-lg shadow-sm hover:shadow-md transition-all mb-2`}
    >
      <div className="flex items-center font-bold text-gray-700">
        {activeSection === id ? <ChevronDown className="w-5 h-5 mr-2" /> : <ChevronRight className="w-5 h-5 mr-2" />}
        {title}
      </div>
      {count && <span className="text-sm text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-full">{count}</span>}
    </button>
  );

  // --- Update Helpers ---

  const updateField = (field: keyof EscapeRoomData, value: any) => {
    setData({ ...data, [field]: value });
  };

  const updateMCQ = (set: 'mcqSet1' | 'mcqSet2', index: number, field: keyof MCQ, value: any) => {
    const newSet = [...data[set]];
    newSet[index] = { ...newSet[index], [field]: value };
    setData({ ...data, [set]: newSet });
  };

  const updateMCQOption = (set: 'mcqSet1' | 'mcqSet2', qIndex: number, optIndex: number, value: string) => {
    const newSet = [...data[set]];
    const newOptions = [...newSet[qIndex].options];
    newOptions[optIndex] = value;
    newSet[qIndex] = { ...newSet[qIndex], options: newOptions };
    setData({ ...data, [set]: newSet });
  };

  const deleteMCQ = (set: 'mcqSet1' | 'mcqSet2', index: number) => {
    const newSet = [...data[set]];
    newSet.splice(index, 1);
    setData({ ...data, [set]: newSet });
  };

  const addMCQ = (set: 'mcqSet1' | 'mcqSet2') => {
    const newQ: MCQ = { question: 'New Question', options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'], correctIndex: 0 };
    setData({ ...data, [set]: [...data[set], newQ] });
  };

  const updateMatching = (set: 'matchingSet1' | 'matchingSet2', index: number, field: keyof MatchingPair, value: string) => {
    const newSet = [...data[set]];
    newSet[index] = { ...newSet[index], [field]: value };
    setData({ ...data, [set]: newSet });
  };

  const deleteMatching = (set: 'matchingSet1' | 'matchingSet2', index: number) => {
    const newSet = [...data[set]];
    newSet.splice(index, 1);
    setData({ ...data, [set]: newSet });
  };

  const addMatching = (set: 'matchingSet1' | 'matchingSet2') => {
    const newPair: MatchingPair = { left: 'Item', right: 'Match' };
    setData({ ...data, [set]: [...data[set], newPair] });
  };

  const updateFillGapAnswer = (index: number, value: string) => {
    const newAnswers = [...data.fillGap.answers];
    newAnswers[index] = value;
    setData({ ...data, fillGap: { ...data.fillGap, answers: newAnswers } });
  };

  const updateFillGapDistractor = (index: number, value: string) => {
    if (!data.fillGap.distractors) return;
    const newDistractors = [...data.fillGap.distractors];
    newDistractors[index] = value;
    setData({ ...data, fillGap: { ...data.fillGap, distractors: newDistractors } });
  };

  const updateOpenQ = (index: number, field: keyof OpenQuestion, value: string) => {
    const newQs = [...data.openQuestions];
    newQs[index] = { ...newQs[index], [field]: value };
    setData({ ...data, openQuestions: newQs });
  };

  // --- Renderers ---

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#FFF5E4] w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-white p-4 md:p-6 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-800">Edit Escape Room</h2>
            <p className="text-sm text-gray-500">Modify questions, answers, and text.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-bold transition">
              Cancel
            </button>
            <button onClick={handleSave} className="flex items-center px-6 py-2 rounded-full bg-[#77DD77] hover:bg-[#66cc66] text-white font-bold shadow-md transition transform hover:scale-105">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
          
          {/* General Info */}
          <SectionHeader title="General Info (Title & Intro)" id="general" color="border-l-[#FFB3BA]" />
          {activeSection === 'general' && (
            <div className="bg-white p-6 rounded-xl shadow-sm mb-4 animate-fadeIn">
              <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
              <input 
                type="text" 
                value={data.title} 
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFB3BA] outline-none mb-4"
              />
              <label className="block text-sm font-bold text-gray-700 mb-1">Intro Story</label>
              <textarea 
                value={data.introText} 
                onChange={(e) => updateField('introText', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFB3BA] outline-none h-32"
              />
            </div>
          )}

          {/* MCQ Set 1 */}
          <SectionHeader title="Challenge 1: Multiple Choice (English)" id="mcq1" color="border-l-[#AEC6CF]" count={`${data.mcqSet1.length} Qs`} />
          {activeSection === 'mcq1' && (
            <div className="space-y-4 animate-fadeIn">
              {data.mcqSet1.map((q, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm group">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-[#AEC6CF]">Question {i + 1}</span>
                    <button onClick={() => deleteMCQ('mcqSet1', i)} className="text-red-300 hover:text-red-500 transition" title="Delete Question">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={q.question} 
                    onChange={(e) => updateMCQ('mcqSet1', i, 'question', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg mb-4 focus:border-[#AEC6CF] outline-none font-medium"
                    placeholder="Question text"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name={`mcq1-${i}`}
                          checked={q.correctIndex === optIdx}
                          onChange={() => updateMCQ('mcqSet1', i, 'correctIndex', optIdx)}
                          className="w-4 h-4 text-[#AEC6CF] focus:ring-[#AEC6CF]"
                        />
                        <input 
                          type="text" 
                          value={opt} 
                          onChange={(e) => updateMCQOption('mcqSet1', i, optIdx, e.target.value)}
                          className={`flex-1 p-2 border rounded-lg text-sm ${q.correctIndex === optIdx ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}
                          placeholder={`Option ${optIdx + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
               <button onClick={() => addMCQ('mcqSet1')} className="w-full py-3 border-2 border-dashed border-[#AEC6CF] text-[#AEC6CF] rounded-xl font-bold hover:bg-[#AEC6CF] hover:text-white transition flex items-center justify-center">
                <Plus className="w-5 h-5 mr-2" />
                Add Question
              </button>
            </div>
          )}

          {/* MCQ Set 2 */}
          <SectionHeader title="Challenge 2: Multiple Choice (English)" id="mcq2" color="border-l-[#AEC6CF]" count={`${data.mcqSet2.length} Qs`} />
          {activeSection === 'mcq2' && (
            <div className="space-y-4 animate-fadeIn">
              {data.mcqSet2.map((q, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm group">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-[#AEC6CF]">Question {i + 1}</span>
                    <button onClick={() => deleteMCQ('mcqSet2', i)} className="text-red-300 hover:text-red-500 transition" title="Delete Question">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={q.question} 
                    onChange={(e) => updateMCQ('mcqSet2', i, 'question', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg mb-4 focus:border-[#AEC6CF] outline-none font-medium"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name={`mcq2-${i}`}
                          checked={q.correctIndex === optIdx}
                          onChange={() => updateMCQ('mcqSet2', i, 'correctIndex', optIdx)}
                          className="w-4 h-4 text-[#AEC6CF] focus:ring-[#AEC6CF]"
                        />
                        <input 
                          type="text" 
                          value={opt} 
                          onChange={(e) => updateMCQOption('mcqSet2', i, optIdx, e.target.value)}
                          className={`flex-1 p-2 border rounded-lg text-sm ${q.correctIndex === optIdx ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
               <button onClick={() => addMCQ('mcqSet2')} className="w-full py-3 border-2 border-dashed border-[#AEC6CF] text-[#AEC6CF] rounded-xl font-bold hover:bg-[#AEC6CF] hover:text-white transition flex items-center justify-center">
                <Plus className="w-5 h-5 mr-2" />
                Add Question
              </button>
            </div>
          )}

          {/* Matching 1 */}
          <SectionHeader title="Challenge 3: Matching (English)" id="match1" color="border-l-[#77DD77]" count={`${data.matchingSet1.length} Pairs`} />
          {activeSection === 'match1' && (
            <div className="bg-white p-6 rounded-xl shadow-sm animate-fadeIn">
              <div className="grid grid-cols-12 gap-4 font-bold text-gray-400 mb-2 px-2">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-5">Left Item</div>
                <div className="col-span-1 text-center">=</div>
                <div className="col-span-4">Right Item</div>
                <div className="col-span-1"></div>
              </div>
              {data.matchingSet1.map((pair, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 items-center mb-3 group">
                  <div className="col-span-1 text-center font-bold text-gray-300">{i + 1}</div>
                  <div className="col-span-5">
                    <input 
                      type="text" 
                      value={pair.left} 
                      onChange={(e) => updateMatching('matchingSet1', i, 'left', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#77DD77] outline-none"
                    />
                  </div>
                  <div className="col-span-1 text-center text-gray-300">↔</div>
                  <div className="col-span-4">
                    <input 
                      type="text" 
                      value={pair.right} 
                      onChange={(e) => updateMatching('matchingSet1', i, 'right', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#77DD77] outline-none"
                    />
                  </div>
                   <div className="col-span-1 flex justify-center">
                    <button onClick={() => deleteMatching('matchingSet1', i)} className="text-red-300 hover:text-red-500 transition" title="Delete Pair">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
               <button onClick={() => addMatching('matchingSet1')} className="w-full mt-4 py-3 border-2 border-dashed border-[#77DD77] text-[#77DD77] rounded-xl font-bold hover:bg-[#77DD77] hover:text-white transition flex items-center justify-center">
                <Plus className="w-5 h-5 mr-2" />
                Add Matching Pair
              </button>
            </div>
          )}

          {/* Matching 2 */}
          <SectionHeader title="Challenge 4: Matching (English)" id="match2" color="border-l-[#77DD77]" count={`${data.matchingSet2.length} Pairs`} />
          {activeSection === 'match2' && (
            <div className="bg-white p-6 rounded-xl shadow-sm animate-fadeIn">
              <div className="grid grid-cols-12 gap-4 font-bold text-gray-400 mb-2 px-2">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-5">Left Item</div>
                <div className="col-span-1 text-center">=</div>
                <div className="col-span-4">Right Item</div>
                <div className="col-span-1"></div>
              </div>
              {data.matchingSet2.map((pair, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 items-center mb-3 group">
                  <div className="col-span-1 text-center font-bold text-gray-300">{i + 1}</div>
                  <div className="col-span-5">
                    <input 
                      type="text" 
                      value={pair.left} 
                      onChange={(e) => updateMatching('matchingSet2', i, 'left', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#77DD77] outline-none"
                    />
                  </div>
                  <div className="col-span-1 text-center text-gray-300">↔</div>
                  <div className="col-span-4">
                    <input 
                      type="text" 
                      value={pair.right} 
                      onChange={(e) => updateMatching('matchingSet2', i, 'right', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#77DD77] outline-none"
                    />
                  </div>
                   <div className="col-span-1 flex justify-center">
                    <button onClick={() => deleteMatching('matchingSet2', i)} className="text-red-300 hover:text-red-500 transition" title="Delete Pair">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={() => addMatching('matchingSet2')} className="w-full mt-4 py-3 border-2 border-dashed border-[#77DD77] text-[#77DD77] rounded-xl font-bold hover:bg-[#77DD77] hover:text-white transition flex items-center justify-center">
                <Plus className="w-5 h-5 mr-2" />
                Add Matching Pair
              </button>
            </div>
          )}

          {/* Fill Gap */}
          <SectionHeader title="Challenge 5: Fill in the Gap (English)" id="fillgap" color="border-l-[#FFB347]" count="8 Gaps" />
          {activeSection === 'fillgap' && (
            <div className="bg-white p-6 rounded-xl shadow-sm animate-fadeIn space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex justify-between">
                  <span>Text with [GAP] placeholders</span>
                  <span className={`text-xs px-2 py-1 rounded ${data.fillGap.textWithPlaceholders.split('[GAP]').length - 1 === 8 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    Gap Count: {data.fillGap.textWithPlaceholders.split('[GAP]').length - 1} / 8
                  </span>
                </label>
                <textarea 
                  value={data.fillGap.textWithPlaceholders} 
                  onChange={(e) => setData({ ...data, fillGap: { ...data.fillGap, textWithPlaceholders: e.target.value } })}
                  className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFB347] outline-none h-48 font-mono text-sm leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-600 mb-3">Correct Answers (Must match order)</h3>
                  <div className="space-y-2">
                    {data.fillGap.answers.map((ans, i) => (
                      <div key={i} className="flex items-center gap-2">
                         <span className="text-gray-400 w-6 text-sm">{i+1}.</span>
                         <input 
                           type="text" 
                           value={ans} 
                           onChange={(e) => updateFillGapAnswer(i, e.target.value)}
                           className="flex-1 p-2 border border-gray-200 rounded bg-green-50 focus:border-green-400 outline-none"
                         />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-600 mb-3">Distractors (Wrong words)</h3>
                  <div className="space-y-2">
                    {data.fillGap.distractors?.map((dis, i) => (
                      <div key={i} className="flex items-center gap-2">
                         <span className="text-gray-400 w-6 text-sm">{i+1}.</span>
                         <input 
                           type="text" 
                           value={dis} 
                           onChange={(e) => updateFillGapDistractor(i, e.target.value)}
                           className="flex-1 p-2 border border-gray-200 rounded bg-red-50 focus:border-red-400 outline-none"
                         />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Open Questions */}
          <SectionHeader title="Challenge 6: Open Questions (English)" id="openq" color="border-l-[#B39EB5]" count="2 Qs" />
          {activeSection === 'openq' && (
            <div className="space-y-4 animate-fadeIn">
               {data.openQuestions.map((q, i) => (
                 <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                    <label className="block text-sm font-bold text-gray-500 mb-1">Question {i+1}</label>
                    <input 
                      type="text" 
                      value={q.question} 
                      onChange={(e) => updateOpenQ(i, 'question', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#B39EB5] outline-none mb-4"
                    />
                    <label className="block text-sm font-bold text-gray-500 mb-1">Model Answer</label>
                    <textarea 
                      value={q.modelAnswer} 
                      onChange={(e) => updateOpenQ(i, 'modelAnswer', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#B39EB5] outline-none h-24"
                    />
                 </div>
               ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};