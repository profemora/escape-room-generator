import { EscapeRoomData } from "../types";

export const generateEscapeRoomHtml = (data: EscapeRoomData, isPreview: boolean = false): string => {
  // We need to serialize the data to inject it into the script
  const serializedData = JSON.stringify(data).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title} - Escape Room</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;600&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              pastel: {
                bg: '#FFF5E4',
                card: '#FFFFFF',
                primary: '#FFB3BA', // Red/Pink
                secondary: '#BAFFC9', // Green
                accent: '#BAE1FF', // Blue
                warning: '#FFFFBA', // Yellow
                text: '#5D5D5D'
              }
            },
            fontFamily: {
              sans: ['Nunito', 'sans-serif'],
              display: ['Fredoka', 'sans-serif'],
            }
          }
        }
      }
    </script>
    <style>
        body { background-color: #FFF5E4; color: #5D5D5D; }
        .slide-in { animation: slideIn 0.5s ease-out; }
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .correct-anim { animation: pulseGreen 0.5s; }
        .wrong-anim { animation: shakeRed 0.5s; }
        @keyframes pulseGreen { 0% { transform: scale(1); } 50% { transform: scale(1.05); background-color: #BAFFC9; } 100% { transform: scale(1); } }
        @keyframes shakeRed { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        
        /* Drag and Drop Styles */
        .word-chip {
            cursor: grab;
            user-select: none;
            transition: transform 0.1s;
        }
        .word-chip:active {
            cursor: grabbing;
            transform: scale(1.05);
        }
        .gap-slot {
            display: inline-block;
            min-width: 100px;
            min-height: 2.5rem;
            vertical-align: middle;
            background-color: #FFF;
            border: 2px dashed #CBD5E1;
            border-radius: 0.5rem;
            margin: 0 0.25rem;
            padding: 0.25rem;
            transition: all 0.2s;
            text-align: center;
        }
        .gap-slot.drag-over {
            background-color: #E2E8F0;
            border-color: #94A3B8;
        }
        .gap-slot.filled {
            border-style: solid;
            background-color: #F8FAFC;
        }
        .gap-slot.correct {
            border-color: #4ADE80;
            background-color: #F0FDF4;
        }
        .gap-slot.wrong {
            border-color: #F87171;
            background-color: #FEF2F2;
        }
    </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-center p-4 bg-pastel-bg">

    ${isPreview ? '<div class="fixed top-0 left-0 w-full bg-yellow-400 text-yellow-900 text-center py-2 font-bold z-50 shadow-md">TEACHER PREVIEW MODE - Navigation is unlocked</div>' : ''}

    <div id="app" class="w-full max-w-4xl ${isPreview ? 'mt-10' : ''}">
        <!-- Dynamic Content Will Be Injected Here -->
    </div>

    <script>
        const gameData = ${serializedData};
        const isPreview = ${isPreview};
        
        let state = {
            step: 0, // 0: Intro, 1: MCQ1, 2: MCQ2, 3: Match1, 4: Match2, 5: FillGap, 6: OpenQ, 7: Success
            scores: {},
            mcq1Selections: {}, // Separate state for Set 1
            mcq2Selections: {}, // Separate state for Set 2
            currentMatchSelections: { left: null, right: null, found: [] },
            gapPlacements: {}, // { gapIndex: 'wordText' }
            openQRevealed: [false, false]
        };

        const app = document.getElementById('app');

        function render() {
            app.innerHTML = '';
            
            if (state.step === 0) renderIntro();
            else if (state.step === 1) renderMCQ(gameData.mcqSet1, 'Challenge 1: The First Test', 'mcq1Selections');
            else if (state.step === 2) renderMCQ(gameData.mcqSet2, 'Challenge 2: The Second Obstacle', 'mcq2Selections');
            else if (state.step === 3) renderMatching(gameData.matchingSet1, 'Challenge 3: Connect Concepts');
            else if (state.step === 4) renderMatching(gameData.matchingSet2, 'Challenge 4: Build Sentences');
            else if (state.step === 5) renderFillGap(gameData.fillGap, 'Challenge 5: Missing Words');
            else if (state.step === 6) renderOpenQuestions(gameData.openQuestions, 'Challenge 6: The Final Gate');
            else if (state.step === 7) renderSuccess();
        }

        // --- RENDERERS ---

        function renderIntro() {
            const div = document.createElement('div');
            div.className = 'bg-white rounded-3xl shadow-xl p-8 text-center slide-in border-b-8 border-pastel-primary';
            div.innerHTML = \`
                <h1 class="text-4xl md:text-6xl font-display font-bold text-pastel-primary mb-6">\${gameData.title}</h1>
                <p class="text-xl text-gray-600 mb-8 leading-relaxed">\${gameData.introText}</p>
                <button onclick="nextStep()" class="bg-pastel-primary hover:bg-red-300 text-white font-bold py-4 px-10 rounded-full text-xl transition transform hover:scale-105 shadow-md">
                    Start Adventure
                </button>
            \`;
            app.appendChild(div);
        }

        function renderMCQ(questions, title, stateKey) {
            const currentSelections = state[stateKey];
            const container = document.createElement('div');
            container.className = 'bg-white rounded-3xl shadow-xl p-6 md:p-10 slide-in border-b-8 border-pastel-accent';
            
            let html = \`
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-3xl font-display font-bold text-pastel-accent">\${title}</h2>
                    <span class="bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm font-bold">\${questions.length} Questions</span>
                </div>
                <div class="space-y-8">
            \`;

            questions.forEach((q, idx) => {
                const isCorrect = currentSelections[idx] === q.correctIndex;
                const isSelected = currentSelections[idx] !== undefined;
                const statusClass = isSelected ? (isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50') : 'border-transparent';

                html += \`
                    <div class="p-4 rounded-xl border-2 \${statusClass} transition-all">
                        <p class="font-bold text-lg mb-3">\${idx + 1}. \${q.question}</p>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            \${q.options.map((opt, optIdx) => \`
                                <button 
                                    onclick="handleMcqSelect('\${stateKey}', \${idx}, \${optIdx})"
                                    class="text-left p-3 rounded-lg border border-gray-200 hover:bg-blue-50 transition \${currentSelections[idx] === optIdx ? 'bg-blue-100 ring-2 ring-blue-300' : ''}"
                                >
                                    \${opt}
                                </button>
                            \`).join('')}
                        </div>
                    </div>
                \`;
            });

            const allCorrect = questions.every((q, i) => currentSelections[i] === q.correctIndex);

            html += \`
                </div>
                <div class="mt-8 flex justify-end gap-3">
                    <button id="checkBtn" onclick="checkMcq('\${stateKey}', \${questions.length})" class="bg-pastel-accent hover:bg-blue-300 text-white font-bold py-3 px-8 rounded-full text-lg transition shadow-md \${allCorrect ? 'hidden' : ''}">
                        Check Answers
                    </button>
                    <button onclick="nextStep()" class="bg-green-400 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full text-lg transition shadow-md \${allCorrect || isPreview ? '' : 'hidden'}">
                        \${isPreview && !allCorrect ? 'Skip (Preview) ->' : 'Next Challenge ->'}
                    </button>
                </div>
            \`;
            
            container.innerHTML = html;
            app.appendChild(container);
        }

        function renderMatching(pairs, title) {
            // Flatten and shuffle for display
            if (!state.shuffledLeft) {
                state.shuffledLeft = pairs.map((p, i) => ({ val: p.left, id: i })).sort(() => Math.random() - 0.5);
                state.shuffledRight = pairs.map((p, i) => ({ val: p.right, id: i })).sort(() => Math.random() - 0.5);
            }

            const container = document.createElement('div');
            container.className = 'bg-white rounded-3xl shadow-xl p-6 md:p-10 slide-in border-b-8 border-pastel-secondary';
            
            let html = \`
                <h2 class="text-3xl font-display font-bold text-green-500 mb-6">\${title}</h2>
                <p class="mb-4 text-gray-500">Select an item on the left, then find its match on the right.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-3">
                        <h3 class="font-bold text-center text-gray-400 mb-2">Column A</h3>
                        \${state.shuffledLeft.map(item => {
                            const isFound = state.currentMatchSelections.found.includes(item.id);
                            const isSelected = state.currentMatchSelections.left === item.id;
                            let classes = "w-full p-4 rounded-xl border-2 transition text-left cursor-pointer ";
                            if (isFound) classes += "bg-green-100 border-green-300 opacity-50 cursor-default";
                            else if (isSelected) classes += "bg-yellow-100 border-yellow-300 ring-2 ring-yellow-200 transform scale-105";
                            else classes += "bg-gray-50 border-gray-200 hover:bg-gray-100";
                            
                            return \`<div onclick="handleMatchSelect('left', \${item.id})" class="\${classes}">\${item.val}</div>\`;
                        }).join('')}
                    </div>
                    <div class="space-y-3">
                        <h3 class="font-bold text-center text-gray-400 mb-2">Column B</h3>
                        \${state.shuffledRight.map(item => {
                             const isFound = state.currentMatchSelections.found.includes(item.id);
                             const isSelected = state.currentMatchSelections.right === item.id;
                             let classes = "w-full p-4 rounded-xl border-2 transition text-left cursor-pointer ";
                             if (isFound) classes += "bg-green-100 border-green-300 opacity-50 cursor-default";
                             else if (isSelected) classes += "bg-yellow-100 border-yellow-300 ring-2 ring-yellow-200 transform scale-105";
                             else classes += "bg-gray-50 border-gray-200 hover:bg-gray-100";
                            
                            return \`<div onclick="handleMatchSelect('right', \${item.id})" class="\${classes}">\${item.val}</div>\`;
                        }).join('')}
                    </div>
                </div>
                <div class="mt-8 flex justify-end">
                    <button onclick="nextStep()" class="bg-pastel-secondary hover:bg-green-400 text-white font-bold py-3 px-8 rounded-full text-lg transition shadow-md \${state.currentMatchSelections.found.length === pairs.length || isPreview ? '' : 'hidden'}">
                        \${isPreview && state.currentMatchSelections.found.length !== pairs.length ? 'Skip (Preview) ->' : 'Proceed ->'}
                    </button>
                </div>
            \`;

            container.innerHTML = html;
            app.appendChild(container);
        }

        function renderFillGap(data, title) {
            const container = document.createElement('div');
            container.className = 'bg-white rounded-3xl shadow-xl p-6 md:p-10 slide-in border-b-8 border-pastel-orange';
            
            // Available words bank (answers + distractors shuffled)
            const allWords = [...data.answers, ...(data.distractors || [])].sort();
            
            // Filter out words that are already placed in a gap
            const placedWords = Object.values(state.gapPlacements);
            const availableWords = allWords.filter(w => {
                 // Logic to allow duplicates if the same word appears multiple times
                 const totalCount = allWords.filter(aw => aw === w).length;
                 const placedCount = placedWords.filter(pw => pw === w).length;
                 return placedCount < totalCount;
            });

            // Prepare text parts
            const parts = data.textWithPlaceholders.split('[GAP]');
            
            let textHtml = '';
            parts.forEach((part, i) => {
                textHtml += \`<span>\${part}</span>\`;
                if (i < parts.length - 1) {
                    const filledWord = state.gapPlacements[i];
                    let slotClass = 'gap-slot';
                    if (filledWord) slotClass += ' filled';
                    
                    // Check logic classes
                    if (state.gapChecked && filledWord) {
                        const isCorrect = filledWord.toLowerCase().trim() === data.answers[i].toLowerCase().trim();
                        slotClass += isCorrect ? ' correct' : ' wrong';
                    }

                    textHtml += \`<span 
                        id="gap-\${i}" 
                        class="\${slotClass}"
                        ondrop="drop(event, \${i})" 
                        ondragover="allowDrop(event)"
                        onclick="returnWord(\${i})"
                        title="\${filledWord ? 'Click to remove' : ''}"
                    >\${filledWord || ''}</span>\`;
                }
            });
            
            // Check if all correct (for hiding/showing buttons on re-render)
            let correctCount = 0;
            const answers = data.answers;
            for(let i=0; i<answers.length; i++) {
                if (state.gapPlacements[i]?.toLowerCase().trim() === answers[i].toLowerCase().trim()) {
                    correctCount++;
                }
            }
            const allCorrect = correctCount === answers.length;

            let html = \`
                <h2 class="text-3xl font-display font-bold text-orange-400 mb-6">\${title}</h2>
                <p class="mb-4 text-gray-500 italic">Drag words from the bank below and drop them into the empty slots.</p>
                
                <div class="leading-loose text-lg text-justify p-6 bg-gray-50 rounded-xl border border-gray-100 mb-8" style="line-height: 2.5rem;">
                    \${textHtml}
                </div>

                <div id="wordBank" class="bg-orange-50 p-6 rounded-xl flex flex-wrap gap-3 justify-center min-h-[100px] border-2 border-orange-100 border-dashed \${allCorrect ? 'hidden' : ''}" ondrop="dropToBank(event)" ondragover="allowDrop(event)">
                    \${availableWords.map((w, idx) => \`
                        <div 
                            id="word-\${w}-\${idx}" 
                            class="word-chip bg-white border border-orange-200 px-4 py-2 rounded-full text-gray-700 font-bold shadow-sm hover:shadow-md hover:scale-105" 
                            draggable="true" 
                            ondragstart="drag(event, '\${w}')"
                        >
                            \${w}
                        </div>
                    \`).join('')}
                </div>

                <div class="mt-8 flex justify-end gap-3">
                     <button id="checkGapBtn" onclick="checkGaps(\${data.answers.length})" class="bg-orange-300 hover:bg-orange-400 text-white font-bold py-3 px-8 rounded-full text-lg transition shadow-md \${allCorrect ? 'hidden' : ''}">
                        Check Answers
                    </button>
                    <button id="nextGapBtn" onclick="nextStep()" class="bg-green-400 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full text-lg transition shadow-md \${allCorrect || isPreview ? '' : 'hidden'}">
                         \${isPreview && !allCorrect ? 'Skip (Preview) ->' : 'Next Challenge ->'}
                    </button>
                </div>
            \`;

            container.innerHTML = html;
            app.appendChild(container);
        }

        function renderOpenQuestions(questions, title) {
            const container = document.createElement('div');
            container.className = 'bg-white rounded-3xl shadow-xl p-6 md:p-10 slide-in border-b-8 border-purple-300';
            
            let html = \`
                <h2 class="text-3xl font-display font-bold text-purple-400 mb-6">\${title}</h2>
                <div class="space-y-8">
            \`;

            questions.forEach((q, idx) => {
                const isRevealed = state.openQRevealed[idx];
                html += \`
                    <div class="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                        <p class="font-bold text-lg mb-4">\${idx + 1}. \${q.question}</p>
                        <textarea class="w-full p-4 rounded-xl border-2 border-purple-200 focus:border-purple-400 outline-none h-32 mb-4" placeholder="Write your answer here..."></textarea>
                        
                        <div class="\${isRevealed ? '' : 'hidden'} bg-green-50 p-4 rounded-xl border border-green-200 mb-4 transition-all">
                            <p class="text-sm font-bold text-green-600 mb-1">Model Answer:</p>
                            <p class="text-gray-700 italic">\${q.modelAnswer}</p>
                        </div>

                        <button onclick="revealAnswer(\${idx})" class="\${isRevealed ? 'hidden' : ''} bg-purple-300 text-white px-6 py-2 rounded-full font-bold hover:bg-purple-400 transition">
                            Show Answer
                        </button>
                         <button onclick="markReviewed(\${idx})" class="\${isRevealed && !state.openQReviewed?.[idx] ? '' : 'hidden'} bg-green-400 text-white px-6 py-2 rounded-full font-bold hover:bg-green-500 transition">
                            Got It
                        </button>
                         <span class="\${state.openQReviewed?.[idx] ? '' : 'hidden'} text-green-500 font-bold ml-2">✓ Reviewed</span>
                    </div>
                \`;
            });

             const allReviewed = questions.every((q, i) => state.openQReviewed?.[i]);

            html += \`
                </div>
                <div class="mt-8 flex justify-end">
                    <button onclick="nextStep()" class="bg-purple-400 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full text-lg transition shadow-md \${allReviewed || isPreview ? '' : 'hidden'}">
                        \${isPreview && !allReviewed ? 'Skip (Preview) ->' : 'Finish Escape Room ->'}
                    </button>
                </div>
            \`;

            container.innerHTML = html;
            app.appendChild(container);
        }

        function renderSuccess() {
            const container = document.createElement('div');
            container.className = 'bg-white rounded-3xl shadow-xl p-10 text-center slide-in border-b-8 border-yellow-300 max-w-2xl';
            container.innerHTML = \`
                <div class="text-6xl mb-6">🎉 🏆 🎉</div>
                <h1 class="text-4xl md:text-5xl font-display font-bold text-yellow-500 mb-6">ESCAPE SUCCESSFUL!</h1>
                <p class="text-xl text-gray-600 mb-8 leading-relaxed">Congratulations! You have completed all challenges and unlocked the final door.</p>
                <button onclick="location.reload()" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-8 rounded-full text-lg transition">
                    Play Again
                </button>
            \`;
            app.appendChild(container);
        }

        // --- LOGIC ---

        function nextStep() {
            state.step++;
            state.shuffledLeft = null; // Reset matching shuffle for next set
            state.currentMatchSelections = { left: null, right: null, found: [] }; // Reset matching state
            render();
            window.scrollTo(0,0);
        }

        window.handleMcqSelect = (stateKey, qIdx, optIdx) => {
            state[stateKey][qIdx] = optIdx;
            render();
        };

        window.checkMcq = (stateKey, total) => {
             const keys = Object.keys(state[stateKey]);
             if (keys.length < total) {
                 alert("Please answer all questions before proceeding!");
                 return;
             }
             render(); // Re-render checks correctness inside the renderer
        };

        window.handleMatchSelect = (side, id) => {
            // If already found, ignore
            if (state.currentMatchSelections.found.includes(id)) return;

            // Set selection
            if (side === 'left') state.currentMatchSelections.left = id;
            if (side === 'right') state.currentMatchSelections.right = id;

            // Check match
            if (state.currentMatchSelections.left !== null && state.currentMatchSelections.right !== null) {
                const l = state.currentMatchSelections.left;
                const r = state.currentMatchSelections.right;
                
                // Since id is the index in the original array, if left ID == right ID, it's a match
                if (l === r) {
                    state.currentMatchSelections.found.push(l);
                    state.currentMatchSelections.left = null;
                    state.currentMatchSelections.right = null;
                } else {
                    // Mismatch
                    setTimeout(() => {
                        state.currentMatchSelections.left = null;
                        state.currentMatchSelections.right = null;
                        render();
                    }, 500);
                }
            }
            render();
        };

        // --- DND LOGIC ---

        window.allowDrop = (ev) => {
            ev.preventDefault();
        };

        window.drag = (ev, word) => {
            ev.dataTransfer.setData("text", word);
        };

        window.drop = (ev, gapIndex) => {
            ev.preventDefault();
            const word = ev.dataTransfer.getData("text");
            if (word) {
                // If there was already a word here, it just goes back to pool implicitly on re-render
                state.gapPlacements[gapIndex] = word;
                state.gapChecked = false; // Reset check status on change
                render();
            }
        };

        window.dropToBank = (ev) => {
            ev.preventDefault();
            // Dragging to bank logic not strictly needed if we re-render bank based on availability
            // But if we support drag FROM gap TO bank:
            // We can add logic later. For now, click-to-return handles 'Gap -> Bank'
        };

        window.returnWord = (gapIndex) => {
            if (state.gapPlacements[gapIndex]) {
                delete state.gapPlacements[gapIndex];
                state.gapChecked = false;
                render();
            }
        };
        
        window.checkGaps = (total) => {
             state.gapChecked = true;
             // Check happens in render logic to colorize
             render(); 
        }

        window.revealAnswer = (idx) => {
            state.openQRevealed[idx] = true;
            render();
        }

        window.markReviewed = (idx) => {
            if (!state.openQReviewed) state.openQReviewed = {};
            state.openQReviewed[idx] = true;
            render();
        }

        // Init
        render();
    </script>
</body>
</html>`;
}