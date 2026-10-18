/**
 * FastAPI Study — Chapter Quiz Controller (quiz.js)
 * Interactive question stepper, instant grading, and review mode.
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
    chapterId: 5,
    questionsList: [],
    answers: {},       // questionKey -> value
    currentStep: 0,
    isSubmitted: false
  };

  function initQuiz() {
    if (!window.FASTAPI_STUDY_DATA) {
      console.error('FastAPI Study data pack not loaded!');
      return;
    }

    // Parse URL parameter ?ch=X
    const urlParams = new URLSearchParams(window.location.search);
    const chParam = parseInt(urlParams.get('ch'), 10);
    if (!isNaN(chParam) && chParam >= 5 && chParam <= 18) {
      quizState.chapterId = chParam;
    } else {
      quizState.chapterId = 5;
    }

    // Populate Chapter Selector Dropdown
    populateChapterDropdown();

    // Load and Start Quiz for chapter
    startQuizForChapter(quizState.chapterId);

    // Setup Modal Confirmation Handlers
    setupReviewModal();
  }

  // Populate Chapter Dropdown with available quizzes (Chapters 5 to 18)
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

    // Reset memory state
    quizState.answers = {};
    quizState.currentStep = 0;
    quizState.isSubmitted = false;

    // Build unified linear list of questions
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

    // Update Header
    updateQuizHeader(chapter);

    // Switch view to Runner
    document.getElementById('quiz-runner-view').style.display = 'block';
    document.getElementById('quiz-results-view').style.display = 'none';

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

  // Render Current Question Card in Stepper
  function renderCurrentQuestion() {
    const container = document.getElementById('quiz-stepper-container');
    if (!container) return;

    const q = quizState.questionsList[quizState.currentStep];
    const total = quizState.questionsList.length;
    const progressPercent = ((quizState.currentStep + 1) / total) * 100;

    // Update Step Counters
    document.getElementById('quiz-step-counter').textContent = `Question ${quizState.currentStep + 1} of ${total}`;
    document.getElementById('quiz-step-category').textContent = q.category;
    document.getElementById('quiz-progress-fill').style.width = `${progressPercent}%`;

    // Render Question Body
    let qBodyHtml = `
      <div class="question-text-title">${escapeHtml(q.question)}</div>
    `;

    // Render Answer Input depending on type
    if (q.type === 'mcq') {
      qBodyHtml += `<div class="options-list-grid">`;
      q.options.forEach(opt => {
        const isSelected = quizState.answers[q.key] === opt.key ? 'selected' : '';
        qBodyHtml += `
          <div class="option-card ${isSelected}" data-key="${opt.key}" tabindex="0" role="radio" aria-checked="${isSelected === 'selected'}">
            <span class="option-radio-key">${opt.key}</span>
            <span class="option-label-text">${escapeHtml(opt.text)}</span>
          </div>
        `;
      });
      qBodyHtml += `</div>`;
    } else if (q.type === 'tf') {
      const selectedVal = quizState.answers[q.key];
      qBodyHtml += `
        <div class="tf-options-row">
          <button class="tf-btn ${selectedVal === true ? 'selected' : ''}" data-val="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>True</span>
          </button>
          <button class="tf-btn ${selectedVal === false ? 'selected' : ''}" data-val="false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            <span>False</span>
          </button>
        </div>
      `;
    } else {
      // Subjective text area (Short answer, Debugging, Challenge)
      const currentText = quizState.answers[q.key] || '';
      qBodyHtml += `
        <div>
          <textarea class="subjective-input-area" placeholder="Type your notes or solution here to compare with the authoritative model answer after submission...">${escapeHtml(currentText)}</textarea>
          <p class="subjective-help-note">This question is evaluated against the authoritative textbook model answer during the results review.</p>
        </div>
      `;
    }

    container.innerHTML = qBodyHtml;

    // Attach Input Event Listeners
    if (q.type === 'mcq') {
      container.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', () => {
          const key = card.getAttribute('data-key');
          quizState.answers[q.key] = key;
          renderCurrentQuestion();
          renderQuickPills();
        });
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
          }
        });
      });
    } else if (q.type === 'tf') {
      container.querySelectorAll('.tf-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-val') === 'true';
          quizState.answers[q.key] = val;
          renderCurrentQuestion();
          renderQuickPills();
        });
      });
    } else {
      const textarea = container.querySelector('.subjective-input-area');
      if (textarea) {
        textarea.addEventListener('input', (e) => {
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
        nextBtn.innerHTML = `<span>Review & Submit</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
      } else {
        nextBtn.innerHTML = `<span>Next</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
      }
    }

    // Render Quick Navigation Dots
    renderQuickPills();
  }

  // Render Jump Dots
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
        <button class="q-dot-btn ${answeredClass} ${currentClass}" data-step="${idx}" title="Jump to Question ${idx + 1}">
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

  // Stepper Button Handlers
  document.addEventListener('DOMContentLoaded', () => {
    const prevBtn = document.getElementById('quiz-prev-btn');
    const nextBtn = document.getElementById('quiz-next-btn');
    const reviewBtn = document.getElementById('quiz-review-shortcut-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (quizState.currentStep > 0) {
          quizState.currentStep--;
          renderCurrentQuestion();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (quizState.currentStep < quizState.questionsList.length - 1) {
          quizState.currentStep++;
          renderCurrentQuestion();
        } else {
          openReviewModal();
        }
      });
    }

    if (reviewBtn) {
      reviewBtn.addEventListener('click', () => {
        openReviewModal();
      });
    }
  });

  // Setup Review & Submit Modal
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

  function openReviewModal() {
    const modal = document.getElementById('quiz-review-modal');
    if (!modal) return;

    const total = quizState.questionsList.length;
    let answeredCount = 0;
    quizState.questionsList.forEach(q => {
      if (quizState.answers[q.key] !== undefined && quizState.answers[q.key] !== '') {
        answeredCount++;
      }
    });

    document.getElementById('modal-answered-count').textContent = answeredCount;
    document.getElementById('modal-unanswered-count').textContent = total - answeredCount;

    modal.classList.add('open');
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

    // Hide Runner, Show Results
    document.getElementById('quiz-runner-view').style.display = 'none';
    const resultsView = document.getElementById('quiz-results-view');
    resultsView.style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Render Score Hero Card
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
            <span>Retry Quiz</span>
          </button>
          <a href="textbook.html?ch=${quizState.chapterId}" class="btn btn-primary">
            <span>Return to Chapter ${quizState.chapterId}</span>
          </a>
          ${quizState.chapterId < 18 ? `
            <a href="quiz.html?ch=${quizState.chapterId + 1}" class="btn btn-secondary">
              <span>Next Chapter Quiz (Ch ${quizState.chapterId + 1}) →</span>
            </a>
          ` : ''}
        </div>
      </div>
    `;

    // Render Detailed Question-by-Question Review List
    let reviewHtml = `
      <div class="results-review-section">
        <div class="review-section-heading">
          <h3>Question-by-Question Detailed Review</h3>
          <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: normal;">Authoritative explanations from textbook answer key</span>
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
                <strong>Explanation & Key Takeaway:</strong>
                ${escapeHtml(q.explanation)}
              </div>
            ` : ''}
          </div>
        `;
      } else {
        // Subjective Question Review (Short Answer, Debugging, Challenge)
        const userNotes = userAns ? userAns.trim() : '(No response entered)';
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
                <div class="ans-col-val" style="color: var(--color-info);">Compare with Model Solution below</div>
              </div>
            </div>

            <div class="review-explanation-box">
              <strong>Official Model Solution & Architectural Analysis:</strong>
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
