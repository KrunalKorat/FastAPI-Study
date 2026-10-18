/**
 * FastAPI Study — Chapter Quiz Controller (quiz.js)
 * Fully interactive question stepper, accessible radio options,
 * comprehensive review screen, instant verified grading, and in-memory retry.
 * 
 * ABSOLUTE PRIVACY GUARANTEE:
 * Active quiz state and answers reside strictly in JavaScript memory.
 * NO localStorage, NO sessionStorage, NO IndexedDB, NO cookies, NO remote API calls.
 * All attempts disappear on page reload or navigation.
 */

(function () {
  'use strict';

  // Strictly in-memory state: cleared on reload or chapter change
  let quizState = {
    chapterId: 1,
    questionsList: [],
    answers: {},           // questionKey -> value ('A', 'B', true, false, string)
    checkedQuestions: {},  // questionKey -> boolean (whether question feedback was inspected)
    currentStep: 0,
    isSubmitted: false
  };

  function initQuiz() {
    if (!window.FASTAPI_STUDY_DATA) {
      console.error('FastAPI Study data pack not loaded!');
      return;
    }

    // Parse URL parameter ?ch=X (1 to 19)
    const urlParams = new URLSearchParams(window.location.search);
    const chParam = parseInt(urlParams.get('ch'), 10);
    if (!isNaN(chParam) && chParam >= 1 && chParam <= 19) {
      quizState.chapterId = chParam;
    } else {
      quizState.chapterId = 1;
    }

    // Populate Chapter Selector Dropdown (All 19 Chapters)
    populateChapterDropdown();

    // Start Quiz for Chapter
    startQuizForChapter(quizState.chapterId);

    // Setup Event Listeners for Stepper, Review & Confirmation
    setupGlobalQuizEvents();
  }

  // Populate Chapter Dropdown with all available chapters (1 to 19)
  function populateChapterDropdown() {
    const selectEl = document.getElementById('quiz-chapter-select');
    if (!selectEl) return;

    const chapters = window.FASTAPI_STUDY_DATA.chapters;
    let optionsHtml = '';

    chapters.forEach(ch => {
      if (ch.available && ch.quiz) {
        const isSelected = ch.id === quizState.chapterId ? 'selected' : '';
        optionsHtml += `<option value="${ch.id}" ${isSelected}>Chapter ${ch.id}: ${ch.cleanTitle}</option>`;
      }
    });

    selectEl.innerHTML = optionsHtml;

    selectEl.addEventListener('change', (e) => {
      const newChId = parseInt(e.target.value, 10);
      if (newChId !== quizState.chapterId) {
        quizState.chapterId = newChId;
        window.history.pushState({ ch: newChId }, '', `quiz.html?ch=${newChId}`);
        startQuizForChapter(quizState.chapterId);
      }
    });
  }

  // Start or Reset Quiz for Chapter
  function startQuizForChapter(chapterId) {
    const chapters = window.FASTAPI_STUDY_DATA.chapters;
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter || !chapter.quiz) return;

    // Reset memory state completely
    quizState.answers = {};
    quizState.checkedQuestions = {};
    quizState.currentStep = 0;
    quizState.isSubmitted = false;

    // Build unified linear list of all 25 questions
    const qList = [];
    const quiz = chapter.quiz;

    // 1. Multiple-Choice Questions (10)
    if (quiz.mcqs && quiz.mcqs.length > 0) {
      quiz.mcqs.forEach(m => {
        qList.push({
          key: `mcq_${m.id}`,
          type: 'mcq',
          category: 'Multiple-Choice Question',
          num: m.id,
          question: m.question,
          options: m.options,
          correctAnswer: m.correctAnswer,
          explanation: m.explanation,
          isGradable: true
        });
      });
    }

    // 2. True or False Questions (5)
    if (quiz.trueFalse && quiz.trueFalse.length > 0) {
      quiz.trueFalse.forEach(tf => {
        qList.push({
          key: `tf_${tf.id}`,
          type: 'tf',
          category: 'True or False',
          num: tf.id,
          question: tf.question,
          correctAnswer: tf.correctAnswer,
          explanation: tf.explanation,
          isGradable: true
        });
      });
    }

    // 3. Short-Answer Questions (5)
    if (quiz.shortAnswer && quiz.shortAnswer.length > 0) {
      quiz.shortAnswer.forEach(sa => {
        qList.push({
          key: `sa_${sa.id}`,
          type: 'short_answer',
          category: 'Short-Answer Reflection',
          num: sa.id,
          question: sa.question,
          modelAnswer: sa.modelAnswer,
          isGradable: false
        });
      });
    }

    // 4. Code Reading & Debugging Questions (3)
    if (quiz.debugging && quiz.debugging.length > 0) {
      quiz.debugging.forEach(dbg => {
        qList.push({
          key: `dbg_${dbg.id}`,
          type: 'debugging',
          category: 'Code Reading & Debugging',
          num: dbg.id,
          question: dbg.prompt,
          modelSolution: dbg.modelSolution,
          isGradable: false
        });
      });
    }

    // 5. Practical Coding Challenges (2)
    if (quiz.codingChallenges && quiz.codingChallenges.length > 0) {
      quiz.codingChallenges.forEach(chal => {
        qList.push({
          key: `chal_${chal.id}`,
          type: 'challenge',
          category: 'Practical Coding Challenge',
          num: chal.id,
          question: chal.prompt,
          isGradable: false
        });
      });
    }

    quizState.questionsList = qList;

    // Update Header Text and Pills
    updateQuizHeader(chapter);

    // Switch view to Question Runner
    showRunnerView();

    // Render Current Step
    renderCurrentQuestion();
  }

  function updateQuizHeader(chapter) {
    document.title = `Quiz: Chapter ${chapter.id} — FastAPI Study`;
    const titleEl = document.getElementById('quiz-title-display');
    const partEl = document.getElementById('quiz-part-display');
    const totalPill = document.getElementById('quiz-total-pill');

    if (titleEl) titleEl.textContent = `Chapter ${chapter.id}: ${chapter.cleanTitle}`;
    if (partEl) partEl.textContent = chapter.partTitle;
    if (totalPill) {
      const gradableCount = quizState.questionsList.filter(q => q.isGradable).length;
      totalPill.textContent = `${quizState.questionsList.length} Questions (${gradableCount} Auto-Graded)`;
    }
  }

  // Switch between Runner, Review, and Results views
  function showRunnerView() {
    const runner = document.getElementById('quiz-runner-view');
    const review = document.getElementById('quiz-review-view');
    const results = document.getElementById('quiz-results-view');
    if (runner) runner.style.display = 'block';
    if (review) review.style.display = 'none';
    if (results) results.style.display = 'none';
  }

  function showReviewView() {
    const runner = document.getElementById('quiz-runner-view');
    const review = document.getElementById('quiz-review-view');
    const results = document.getElementById('quiz-results-view');
    if (runner) runner.style.display = 'none';
    if (review) review.style.display = 'block';
    if (results) results.style.display = 'none';

    renderReviewScreen();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showResultsView() {
    const runner = document.getElementById('quiz-runner-view');
    const review = document.getElementById('quiz-review-view');
    const results = document.getElementById('quiz-results-view');
    if (runner) runner.style.display = 'none';
    if (review) review.style.display = 'none';
    if (results) results.style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Render Current Question Card in Stepper
  function renderCurrentQuestion() {
    const container = document.getElementById('quiz-stepper-container');
    if (!container) return;

    const q = quizState.questionsList[quizState.currentStep];
    const total = quizState.questionsList.length;
    const progressPercent = ((quizState.currentStep + 1) / total) * 100;

    // Update Step Counters
    const stepCounterEl = document.getElementById('quiz-step-counter');
    const stepCategoryEl = document.getElementById('quiz-step-category');
    const progressFillEl = document.getElementById('quiz-progress-fill');

    if (stepCounterEl) stepCounterEl.textContent = `Question ${quizState.currentStep + 1} of ${total}`;
    if (stepCategoryEl) stepCategoryEl.textContent = q.category;
    if (progressFillEl) progressFillEl.style.width = `${progressPercent}%`;

    const isChecked = quizState.checkedQuestions[q.key] === true;
    const userVal = quizState.answers[q.key];

    // Build Question Body HTML
    let qBodyHtml = `
      <div class="question-text-title">${escapeHtml(q.question)}</div>
    `;

    // 1. Multiple Choice Questions
    if (q.type === 'mcq') {
      qBodyHtml += `<div class="quiz-options-list" role="radiogroup" aria-label="Multiple Choice Options">`;
      q.options.forEach(opt => {
        const isSelected = userVal === opt.key;
        let stateClass = isSelected ? 'selected' : '';

        // If user requested instant feedback or quiz is submitted, highlight correctness
        if (isChecked || quizState.isSubmitted) {
          if (opt.key === q.correctAnswer) {
            stateClass += ' correct';
          } else if (isSelected && opt.key !== q.correctAnswer) {
            stateClass += ' incorrect';
          }
        }

        qBodyHtml += `
          <label class="quiz-option-card ${stateClass}" for="opt-${q.key}-${opt.key}">
            <input type="radio" 
                   id="opt-${q.key}-${opt.key}" 
                   name="quiz-answer-${q.key}" 
                   value="${opt.key}" 
                   class="quiz-option-radio"
                   ${isSelected ? 'checked' : ''}
                   ${quizState.isSubmitted ? 'disabled' : ''}>
            <span class="quiz-option-badge">${opt.key}</span>
            <span class="quiz-option-label">${escapeHtml(opt.text)}</span>
          </label>
        `;
      });
      qBodyHtml += `</div>`;
    }
    // 2. True or False Questions
    else if (q.type === 'tf') {
      const isTrueSelected = userVal === true;
      const isFalseSelected = userVal === false;

      let trueClass = isTrueSelected ? 'selected' : '';
      let falseClass = isFalseSelected ? 'selected' : '';

      if (isChecked || quizState.isSubmitted) {
        if (q.correctAnswer === true) {
          trueClass += ' correct';
          if (isFalseSelected) falseClass += ' incorrect';
        } else {
          falseClass += ' correct';
          if (isTrueSelected) trueClass += ' incorrect';
        }
      }

      qBodyHtml += `
        <div class="quiz-options-list" role="radiogroup" aria-label="True or False Options">
          <label class="quiz-option-card ${trueClass}" for="opt-${q.key}-true">
            <input type="radio" 
                   id="opt-${q.key}-true" 
                   name="quiz-answer-${q.key}" 
                   value="true" 
                   class="quiz-option-radio"
                   ${isTrueSelected ? 'checked' : ''}
                   ${quizState.isSubmitted ? 'disabled' : ''}>
            <span class="quiz-option-badge">T</span>
            <span class="quiz-option-label">True</span>
          </label>
          <label class="quiz-option-card ${falseClass}" for="opt-${q.key}-false">
            <input type="radio" 
                   id="opt-${q.key}-false" 
                   name="quiz-answer-${q.key}" 
                   value="false" 
                   class="quiz-option-radio"
                   ${isFalseSelected ? 'checked' : ''}
                   ${quizState.isSubmitted ? 'disabled' : ''}>
            <span class="quiz-option-badge">F</span>
            <span class="quiz-option-label">False</span>
          </label>
        </div>
      `;
    }
    // 3. Subjective (Short Answer, Debugging, Practical Challenge)
    else {
      const currentText = userVal || '';
      qBodyHtml += `
        <div>
          <textarea class="subjective-input-area" 
                    placeholder="Type your notes, solution code, or analysis here..."
                    ${quizState.isSubmitted ? 'readonly' : ''}>${escapeHtml(currentText)}</textarea>
          <p class="subjective-help-note">Responses are retained in memory. Compare your notes with the authoritative textbook solution during review.</p>
        </div>
      `;
    }

    // Feedback Box if checked or submitted
    if (isChecked || quizState.isSubmitted) {
      if (q.isGradable) {
        const isCorrect = userVal === q.correctAnswer;
        qBodyHtml += `
          <div class="quiz-feedback-box ${isCorrect ? 'correct' : 'incorrect'}">
            <div class="feedback-header">
              ${isCorrect ? '✓ Correct Answer!' : '✗ Incorrect Response'}
            </div>
            <div class="feedback-explanation">
              ${escapeHtml(q.explanation)}
            </div>
          </div>
        `;
      } else {
        const solutionText = q.modelSolution || q.modelAnswer || 'Review the chapter implementation guidelines for this challenge.';
        qBodyHtml += `
          <div class="quiz-feedback-box correct">
            <div class="feedback-header">
              Authoritative Model Solution &amp; Architectural Analysis
            </div>
            <div class="feedback-explanation">
              <div class="model-solution-code">${escapeHtml(solutionText)}</div>
            </div>
          </div>
        `;
      }
    }

    container.innerHTML = qBodyHtml;

    // Attach Event Listeners to Answer Choices
    if (q.type === 'mcq') {
      container.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          if (quizState.isSubmitted) return;
          quizState.answers[q.key] = e.target.value;
          // Reset checked state when answer changes so user can re-check
          delete quizState.checkedQuestions[q.key];
          renderCurrentQuestion();
          renderQuickPills();
        });
      });
    } else if (q.type === 'tf') {
      container.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          if (quizState.isSubmitted) return;
          quizState.answers[q.key] = (e.target.value === 'true');
          delete quizState.checkedQuestions[q.key];
          renderCurrentQuestion();
          renderQuickPills();
        });
      });
    } else {
      const textarea = container.querySelector('.subjective-input-area');
      if (textarea) {
        textarea.addEventListener('input', (e) => {
          if (quizState.isSubmitted) return;
          quizState.answers[q.key] = e.target.value;
          renderQuickPills();
        });
      }
    }

    // Update Bottom Action Buttons
    const prevBtn = document.getElementById('quiz-prev-btn');
    const nextBtn = document.getElementById('quiz-next-btn');

    if (prevBtn) {
      prevBtn.disabled = quizState.currentStep === 0;
    }

    if (nextBtn) {
      if (quizState.currentStep === total - 1) {
        nextBtn.innerHTML = `<span>Review &amp; Finish</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
      } else {
        nextBtn.innerHTML = `<span>Next</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
      }
    }

    // Render Quick Navigation Dots (1 to 25)
    renderQuickPills();
  }

  // Render Jump Dots Bar (1 to 25)
  function renderQuickPills() {
    const container = document.getElementById('quiz-quick-nav-pills');
    if (!container) return;

    let html = '';
    quizState.questionsList.forEach((q, idx) => {
      const isAnswered = quizState.answers[q.key] !== undefined && quizState.answers[q.key] !== '';
      const isCurrent = idx === quizState.currentStep;
      const answeredClass = isAnswered ? 'answered' : '';
      const currentClass = isCurrent ? 'current' : '';

      html += `
        <button class="q-dot-btn ${answeredClass} ${currentClass}" data-step="${idx}" title="Jump to Question ${idx + 1}" aria-label="Question ${idx + 1} ${isAnswered ? '(Answered)' : ''}">
          ${idx + 1}
        </button>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.q-dot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        quizState.currentStep = parseInt(btn.getAttribute('data-step'), 10);
        renderCurrentQuestion();
      });
    });
  }

  // Setup Global Quiz Stepper & Navigation Events
  function setupGlobalQuizEvents() {
    const prevBtn = document.getElementById('quiz-prev-btn');
    const nextBtn = document.getElementById('quiz-next-btn');
    const reviewBtn = document.getElementById('quiz-review-shortcut-btn');
    const checkBtn = document.getElementById('quiz-check-answer-btn');

    // Previous Button
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (quizState.currentStep > 0) {
          quizState.currentStep--;
          renderCurrentQuestion();
        }
      });
    }

    // Next Button
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (quizState.currentStep < quizState.questionsList.length - 1) {
          quizState.currentStep++;
          renderCurrentQuestion();
        } else {
          // On last question, transition to Review Screen
          showReviewView();
        }
      });
    }

    // Check Answer Button (Instant validation and explanation)
    if (checkBtn) {
      checkBtn.addEventListener('click', () => {
        const q = quizState.questionsList[quizState.currentStep];
        const userVal = quizState.answers[q.key];

        if (userVal === undefined || userVal === '') {
          // Alert user to select an answer first
          const container = document.getElementById('quiz-stepper-container');
          let warnEl = container.querySelector('.quiz-feedback-box.warning');
          if (!warnEl) {
            warnEl = document.createElement('div');
            warnEl.className = 'quiz-feedback-box warning';
            warnEl.innerHTML = '<strong>Selection Required:</strong> Please choose an answer option before checking.';
            container.appendChild(warnEl);
          }
          return;
        }

        quizState.checkedQuestions[q.key] = true;
        renderCurrentQuestion();
      });
    }

    // Review Shortcut Button
    if (reviewBtn) {
      reviewBtn.addEventListener('click', () => {
        showReviewView();
      });
    }

    // Review Screen Action Buttons
    const reviewReturnBtn = document.getElementById('review-return-quiz-btn');
    const reviewBottomReturnBtn = document.getElementById('review-bottom-return-btn');
    const reviewFinishBtn = document.getElementById('review-finish-quiz-btn');
    const reviewBottomFinishBtn = document.getElementById('review-bottom-finish-btn');

    if (reviewReturnBtn) {
      reviewReturnBtn.addEventListener('click', () => {
        showRunnerView();
        renderCurrentQuestion();
      });
    }
    if (reviewBottomReturnBtn) {
      reviewBottomReturnBtn.addEventListener('click', () => {
        showRunnerView();
        renderCurrentQuestion();
      });
    }

    if (reviewFinishBtn) {
      reviewFinishBtn.addEventListener('click', handleFinishClick);
    }
    if (reviewBottomFinishBtn) {
      reviewBottomFinishBtn.addEventListener('click', handleFinishClick);
    }

    // Confirmation Modal Handlers
    setupReviewModal();
  }

  function handleFinishClick() {
    const total = quizState.questionsList.length;
    let answeredCount = 0;
    quizState.questionsList.forEach(q => {
      if (quizState.answers[q.key] !== undefined && quizState.answers[q.key] !== '') {
        answeredCount++;
      }
    });

    if (answeredCount < total) {
      openReviewModal(answeredCount, total);
    } else {
      gradeAndShowResults();
    }
  }

  // Setup Review & Submit Confirmation Modal
  function setupReviewModal() {
    const modal = document.getElementById('quiz-review-modal');
    const closeBtn = document.getElementById('review-modal-close-btn');
    const submitBtn = document.getElementById('confirm-submit-quiz-btn');

    if (!modal) return;

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('open');
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        modal.classList.remove('open');
        gradeAndShowResults();
      });
    }
  }

  function openReviewModal(answeredCount, total) {
    const modal = document.getElementById('quiz-review-modal');
    if (!modal) return;

    document.getElementById('modal-answered-count').textContent = answeredCount;
    document.getElementById('modal-unanswered-count').textContent = total - answeredCount;

    modal.classList.add('open');
  }

  // Render Full Question Review Screen
  function renderReviewScreen() {
    const listContainer = document.getElementById('review-questions-list');
    const summaryEl = document.getElementById('review-summary-display');
    const partEl = document.getElementById('review-part-display');
    const titleEl = document.getElementById('review-title-display');

    const total = quizState.questionsList.length;
    let answeredCount = 0;

    quizState.questionsList.forEach(q => {
      if (quizState.answers[q.key] !== undefined && quizState.answers[q.key] !== '') {
        answeredCount++;
      }
    });

    if (summaryEl) {
      summaryEl.textContent = `You have completed ${answeredCount} of ${total} questions. Click any question below to review or modify your response.`;
    }
    if (partEl) {
      partEl.textContent = `Chapter ${quizState.chapterId} Assessment`;
    }
    if (titleEl) {
      titleEl.textContent = `Question-by-Question Review`;
    }

    if (!listContainer) return;

    let itemsHtml = '';
    quizState.questionsList.forEach((q, idx) => {
      const userAns = quizState.answers[q.key];
      const isAnswered = userAns !== undefined && userAns !== '';

      let answerPreviewText = 'Not answered yet';
      if (isAnswered) {
        if (q.type === 'mcq') {
          const opt = q.options.find(o => o.key === userAns);
          answerPreviewText = `Selected: ${userAns}) ${opt ? opt.text : ''}`;
        } else if (q.type === 'tf') {
          answerPreviewText = `Selected: ${userAns ? 'True' : 'False'}`;
        } else {
          answerPreviewText = `Response recorded (${userAns.trim().length} chars)`;
        }
      }

      itemsHtml += `
        <div class="review-item-row">
          <div class="review-item-details">
            <div class="review-item-meta">
              <span class="review-q-tag">Q${idx + 1}</span>
              <span class="review-cat-tag">${q.category}</span>
              <span class="review-status-pill ${isAnswered ? 'answered' : 'unanswered'}">
                ${isAnswered ? '✓ Answered' : '○ Unanswered'}
              </span>
            </div>
            <div class="review-item-prompt">${escapeHtml(q.question)}</div>
            <div class="review-item-ans-preview" style="color: ${isAnswered ? 'var(--color-primary)' : 'var(--text-muted)'};">
              ${escapeHtml(answerPreviewText)}
            </div>
          </div>
          <div>
            <button class="btn btn-secondary btn-sm review-jump-btn" data-step="${idx}" aria-label="Go to Question ${idx + 1}">
              <span>Edit Question ${idx + 1}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      `;
    });

    listContainer.innerHTML = itemsHtml;

    // Attach Jump Handlers to Return to That Specific Question
    listContainer.querySelectorAll('.review-jump-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetStep = parseInt(btn.getAttribute('data-step'), 10);
        quizState.currentStep = targetStep;
        showRunnerView();
        renderCurrentQuestion();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  // Grade Quiz & Render Authoritative Results Screen
  function gradeAndShowResults() {
    quizState.isSubmitted = true;

    const gradableQuestions = quizState.questionsList.filter(q => q.isGradable);
    let correctCount = 0;

    gradableQuestions.forEach(q => {
      const userAns = quizState.answers[q.key];
      if (q.type === 'mcq') {
        if (userAns === q.correctAnswer) {
          correctCount++;
        }
      } else if (q.type === 'tf') {
        if (userAns === q.correctAnswer) {
          correctCount++;
        }
      }
    });

    const totalGradable = gradableQuestions.length;
    const scorePercent = totalGradable > 0 ? Math.round((correctCount / totalGradable) * 100) : 100;

    // Show Results View
    showResultsView();

    const resultsView = document.getElementById('quiz-results-view');
    if (!resultsView) return;

    // Determine Performance Headline
    let performanceHeadline = 'Excellent Mastery!';
    let performanceSubline = 'You demonstrated thorough understanding of the technical architecture in this chapter.';
    if (scorePercent < 60) {
      performanceHeadline = 'Good Effort — Review Key Concepts';
      performanceSubline = 'Carefully study the line-by-line explanations and official answer key below to solidify your knowledge.';
    } else if (scorePercent < 85) {
      performanceHeadline = 'Great Performance!';
      performanceSubline = 'You have a solid command of this chapter. Review the few missed questions below to reach full mastery.';
    }

    // Circular SVG circumference = 2 * PI * 54 ≈ 339.29
    const circumference = 339.29;
    const strokeOffset = circumference - (scorePercent / 100) * circumference;

    let heroHtml = `
      <div class="score-hero-card">
        <div class="score-ring-wrap">
          <svg class="score-ring-svg" viewBox="0 0 120 120">
            <circle class="score-circle-bg" cx="60" cy="60" r="54"></circle>
            <circle class="score-circle-progress" id="score-circle-anim" cx="60" cy="60" r="54" style="stroke-dashoffset: ${circumference}"></circle>
          </svg>
          <div class="score-percentage-text">${scorePercent}%</div>
        </div>

        <h2 class="score-headline">${performanceHeadline}</h2>
        <p class="score-subline">${performanceSubline}</p>

        <div class="score-stats-row">
          <div class="score-stat-col">
            <strong>${correctCount} / ${totalGradable}</strong>
            <span>Correct Answers</span>
          </div>
          <div class="score-stat-col">
            <strong>${totalGradable - correctCount}</strong>
            <span>Incorrect</span>
          </div>
          <div class="score-stat-col">
            <strong>0% Saved</strong>
            <span>Zero Persistence</span>
          </div>
        </div>

        <div class="results-action-bar">
          <button class="btn btn-secondary" id="retry-quiz-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
            <span>Retry Quiz</span>
          </button>
          <a href="textbook.html?ch=${quizState.chapterId}" class="btn btn-primary">
            <span>Read Chapter ${quizState.chapterId} Textbook</span>
          </a>
          ${quizState.chapterId < 19 ? `
            <a href="quiz.html?ch=${quizState.chapterId + 1}" class="btn btn-secondary">
              <span>Next Chapter Quiz (Ch ${quizState.chapterId + 1}) →</span>
            </a>
          ` : ''}
        </div>
      </div>
    `;

    // Render Detailed Question-by-Question Review List for ALL 25 questions
    let reviewHtml = `
      <div class="results-review-section">
        <div class="review-section-heading">
          <h3>Question-by-Question Detailed Review</h3>
          <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: normal;">Authoritative explanations verified against official FastAPI technical specifications</span>
        </div>
    `;

    quizState.questionsList.forEach((q, idx) => {
      const userAns = quizState.answers[q.key];

      if (q.isGradable) {
        let isCorrect = false;
        let userDisplay = '';
        let correctDisplay = '';

        if (q.type === 'mcq') {
          isCorrect = userAns === q.correctAnswer;
          const userOpt = q.options.find(o => o.key === userAns);
          const correctOpt = q.options.find(o => o.key === q.correctAnswer);
          userDisplay = userAns ? `${userAns}) ${userOpt ? userOpt.text : ''}` : '(No answer selected)';
          correctDisplay = `${q.correctAnswer}) ${correctOpt ? correctOpt.text : ''}`;
        } else if (q.type === 'tf') {
          isCorrect = userAns === q.correctAnswer;
          userDisplay = userAns !== undefined ? (userAns ? 'True' : 'False') : '(No answer selected)';
          correctDisplay = q.correctAnswer ? 'True' : 'False';
        }

        reviewHtml += `
          <div class="review-item-card ${isCorrect ? 'correct' : 'incorrect'}">
            <div class="review-card-top">
              <span class="review-q-num">Question ${idx + 1} • ${q.category}</span>
              <span class="review-status-tag ${isCorrect ? 'correct' : 'incorrect'}">
                ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
              </span>
            </div>

            <div class="review-question-text">${escapeHtml(q.question)}</div>

            <div class="review-answers-comparison">
              <div>
                <div class="ans-col-label">Your Response:</div>
                <div class="ans-col-val ${isCorrect ? 'correct-text' : 'incorrect-text'}">${escapeHtml(userDisplay)}</div>
              </div>
              <div>
                <div class="ans-col-label">Authoritative Correct Answer:</div>
                <div class="ans-col-val correct-text">${escapeHtml(correctDisplay)}</div>
              </div>
            </div>

            ${q.explanation ? `
              <div class="review-explanation-box">
                <strong>Explanation &amp; Technical Reference:</strong>
                ${escapeHtml(q.explanation)}
              </div>
            ` : ''}
          </div>
        `;
      } else {
        // Subjective Question Review (Short Answer, Debugging, Practical Challenge)
        const userNotes = (userAns && typeof userAns === 'string') ? userAns.trim() : '(No response entered)';
        const solutionText = q.modelSolution || q.modelAnswer || 'Review the chapter implementation guidelines for this challenge.';

        reviewHtml += `
          <div class="review-item-card subjective">
            <div class="review-card-top">
              <span class="review-q-num">Question ${idx + 1} • ${q.category}</span>
              <span class="review-status-tag subjective">Self-Evaluation</span>
            </div>

            <div class="review-question-text">${escapeHtml(q.question)}</div>

            <div class="review-answers-comparison">
              <div>
                <div class="ans-col-label">Your Notes / Response:</div>
                <div class="ans-col-val">${escapeHtml(userNotes)}</div>
              </div>
              <div>
                <div class="ans-col-label">Status:</div>
                <div class="ans-col-val" style="color: var(--color-primary);">Compare with Model Solution below</div>
              </div>
            </div>

            <div class="review-explanation-box">
              <strong>Official Model Solution &amp; Architectural Analysis:</strong>
              <div class="model-solution-code">${escapeHtml(solutionText)}</div>
            </div>
          </div>
        `;
      }
    });

    reviewHtml += `</div>`;

    resultsView.innerHTML = heroHtml + reviewHtml;

    // Animate Circular Progress Ring
    setTimeout(() => {
      const circleAnim = document.getElementById('score-circle-anim');
      if (circleAnim) {
        circleAnim.style.strokeDashoffset = strokeOffset;
      }
    }, 100);

    // Attach Retry Button Handler
    const retryBtn = document.getElementById('retry-quiz-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        startQuizForChapter(quizState.chapterId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  document.addEventListener('DOMContentLoaded', initQuiz);
})();
