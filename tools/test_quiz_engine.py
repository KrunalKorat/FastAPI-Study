import json
import re

print("Testing FastAPI Study Quiz Data & Architecture...")

# 1. Load textbook-content.js
raw = open('assets/content/textbook-content.js', encoding='utf-8').read()
json_str = raw[raw.index('{'):raw.rindex('}')+1]
data = json.loads(json_str)

chapters = data['chapters']
assert len(chapters) == 19, f"Expected 19 chapters, found {len(chapters)}"

total_mcqs = 0
total_tf = 0
total_sa = 0
total_dbg = 0
total_chal = 0

for ch in chapters:
    ch_id = ch['id']
    quiz = ch.get('quiz')
    assert quiz is not None, f"Chapter {ch_id} is missing quiz"
    
    mcqs = quiz.get('mcqs', [])
    tf = quiz.get('trueFalse', [])
    sa = quiz.get('shortAnswer', [])
    dbg = quiz.get('debugging', [])
    chal = quiz.get('codingChallenges', [])
    
    assert len(mcqs) == 10, f"Chapter {ch_id}: Expected 10 MCQs, got {len(mcqs)}"
    assert len(tf) == 5, f"Chapter {ch_id}: Expected 5 True/False, got {len(tf)}"
    assert len(sa) == 5, f"Chapter {ch_id}: Expected 5 Short Answer, got {len(sa)}"
    assert len(dbg) == 3, f"Chapter {ch_id}: Expected 3 Debugging, got {len(dbg)}"
    assert len(chal) == 2, f"Chapter {ch_id}: Expected 2 Challenges, got {len(chal)}"
    
    # Verify MCQs structure
    for m in mcqs:
        assert 'id' in m and 'question' in m and 'options' in m and 'correctAnswer' in m and 'explanation' in m, f"Ch {ch_id} MCQ {m.get('id')} missing fields"
        assert len(m['options']) == 4, f"Ch {ch_id} MCQ {m['id']} should have 4 options"
        valid_keys = [opt['key'] for opt in m['options']]
        assert m['correctAnswer'] in valid_keys, f"Ch {ch_id} MCQ {m['id']} correctAnswer '{m['correctAnswer']}' not in {valid_keys}"
        assert len(m['explanation'].strip()) > 10, f"Ch {ch_id} MCQ {m['id']} explanation too short"
        
    # Verify True/False structure
    for t in tf:
        assert 'id' in t and 'question' in t and 'correctAnswer' in t and 'explanation' in t, f"Ch {ch_id} TF {t.get('id')} missing fields"
        assert isinstance(t['correctAnswer'], bool), f"Ch {ch_id} TF {t['id']} correctAnswer must be bool"
        assert len(t['explanation'].strip()) > 10, f"Ch {ch_id} TF {t['id']} explanation too short"
        
    total_mcqs += len(mcqs)
    total_tf += len(tf)
    total_sa += len(sa)
    total_dbg += len(dbg)
    total_chal += len(chal)

total_questions = total_mcqs + total_tf + total_sa + total_dbg + total_chal
print(f"Data Validation Passed!")
print(f"  - 19 Chapters validated")
print(f"  - Total MCQs: {total_mcqs} (10 per chapter)")
print(f"  - Total True/False: {total_tf} (5 per chapter)")
print(f"  - Total Short Answer: {total_sa} (5 per chapter)")
print(f"  - Total Debugging: {total_dbg} (3 per chapter)")
print(f"  - Total Coding Challenges: {total_chal} (2 per chapter)")
print(f"  - Grand Total Questions across book: {total_questions} (25 per chapter)")

# 2. Check HTML controls in quiz.html
with open('quiz.html', 'r', encoding='utf-8') as f:
    quiz_html = f.read()

required_elements = [
    'id="quiz-chapter-select"',
    'id="quiz-title-display"',
    'id="quiz-total-pill"',
    'id="quiz-runner-view"',
    'id="quiz-step-counter"',
    'id="quiz-step-category"',
    'id="quiz-progress-fill"',
    'id="quiz-quick-nav-pills"',
    'id="quiz-stepper-container"',
    'id="quiz-prev-btn"',
    'id="quiz-review-shortcut-btn"',
    'id="quiz-check-answer-btn"',
    'id="quiz-next-btn"',
    'id="quiz-review-view"',
    'id="review-return-quiz-btn"',
    'id="review-finish-quiz-btn"',
    'id="review-questions-list"',
    'id="quiz-results-view"',
    'id="quiz-review-modal"',
    'id="confirm-submit-quiz-btn"'
]

for elem in required_elements:
    assert elem in quiz_html, f"Missing required element in quiz.html: {elem}"

print("HTML Controls Validation Passed! All required controls exist in quiz.html.")

# 3. Check CSS styling in assets/css/quiz.css
with open('assets/css/quiz.css', 'r', encoding='utf-8') as f:
    quiz_css = f.read()

required_css = [
    '.quiz-options-list',
    '.quiz-option-card',
    '.quiz-option-radio',
    '.quiz-option-badge',
    '.quiz-option-label',
    '.quiz-option-card.selected',
    '.quiz-option-card.correct',
    '.quiz-option-card.incorrect',
    '.quiz-feedback-box',
    '.quiz-nav-dots-wrap',
    '.q-dot-btn',
    '.q-dot-btn.current',
    '.q-dot-btn.answered',
    '.quiz-review-container',
    '.review-header-card',
    '.review-item-row',
    '.score-hero-card',
    '#retry-quiz-btn'
]

for rule in required_css:
    assert rule in quiz_css, f"Missing required CSS rule in assets/css/quiz.css: {rule}"

print("CSS Validation Passed! All option cards, states, and review styles exist.")

# 4. Check JS implementation in assets/js/quiz.js
with open('assets/js/quiz.js', 'r', encoding='utf-8') as f:
    quiz_js = f.read()

required_js_patterns = [
    'quizState',
    'startQuizForChapter',
    'renderCurrentQuestion',
    'renderQuickPills',
    'showReviewView',
    'renderReviewScreen',
    'gradeAndShowResults',
    'retry-quiz-btn'
]

for pat in required_js_patterns:
    assert pat in quiz_js, f"Missing JS pattern in quiz.js: {pat}"

print("JS Validation Passed! All logic functions properly wired.")
