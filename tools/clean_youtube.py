import re

# 1. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '    <!-- YOUTUBE VIDEO CURRICULUM SECTION (ALWAYS AT THE END) -->'
end_marker = '</section>\n  </main>'

replacement = """    <!-- RECOMMENDED LEARNING RESOURCES SECTION -->
    <section class="resources-section" id="resources" aria-labelledby="resources-heading">
      <div class="resources-container">
        <div class="resources-card">
          <div class="resources-header">
            <span class="section-label">Supplementary Resources</span>
            <h2 id="resources-heading" class="resources-title">Recommended FastAPI Study Resources</h2>
            <p class="resources-desc">
              FastAPI Study provides complete self-contained digital textbook chapters and interactive chapter quizzes for comprehensive independent study. If you would like supplementary visual walk-throughs, you can study the external YouTube tutorial series by Corey Schafer.
            </p>
          </div>
          <div class="resources-links-list">
            <a href="https://www.youtube.com/playlist?list=PL-osiE80TeTsak-c-QsVeg0YYG_0TeyXI" target="_blank" rel="noopener noreferrer" class="resource-external-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>Watch the Corey Schafer Python FastAPI Tutorial Playlist on YouTube</span>
              <span aria-hidden="true">&nearr;</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  </main>"""

start_pos = content.find(start_marker)
end_pos = content.find(end_marker)

if start_pos != -1 and end_pos != -1:
    content = content[:start_pos] + replacement + content[end_pos + len('</section>\n  </main>'):]
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("index.html: Removed video section and added clean resources card.")
else:
    print(f"index.html: Could not find markers. start_pos={start_pos}, end_pos={end_pos}")

# 2. Update assets/js/reader.js on last chapter
with open('assets/js/reader.js', 'r', encoding='utf-8') as f:
    reader_js = f.read()

old_last_card = """          <a href="index.html#youtube" class="nav-direction-card next-card">
            <span class="nav-dir-label" style="text-align: right;">Course Completion →</span>
            <span class="nav-dir-title" style="text-align: right;">19-Part Video Curriculum</span>
          </a>"""

new_last_card = """          <a href="https://www.youtube.com/playlist?list=PL-osiE80TeTsak-c-QsVeg0YYG_0TeyXI" target="_blank" rel="noopener noreferrer" class="nav-direction-card next-card">
            <span class="nav-dir-label" style="text-align: right;">Supplementary Videos →</span>
            <span class="nav-dir-title" style="text-align: right;">Corey Schafer YouTube Playlist &nearr;</span>
          </a>"""

if old_last_card in reader_js:
    reader_js = reader_js.replace(old_last_card, new_last_card)
    with open('assets/js/reader.js', 'w', encoding='utf-8') as f:
        f.write(reader_js)
    print("assets/js/reader.js: Updated chapter 19 completion card link.")
else:
    print("assets/js/reader.js: Target text not matched.")

# 3. Clean all HTML files: remove Video Curriculum navigation links
html_files = [
    'textbook.html', 'terms.html', 'quiz.html',
    'privacy-policy.html', 'license.html', 'contact.html', 'cookies.html'
]

link_patterns = [
    '        <a href="index.html#youtube" class="nav-link">Video Curriculum</a>\n',
    '        <a href="#youtube" class="nav-link">Video Curriculum</a>\n',
    '            <li><a href="index.html#youtube">Video Curriculum</a></li>\n',
    '            <li><a href="#youtube">Video Curriculum</a></li>\n',
]

for filename in html_files:
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            h_content = f.read()
        modified = False
        for pat in link_patterns:
            if pat in h_content:
                h_content = h_content.replace(pat, '')
                modified = True
        if modified:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(h_content)
            print(f"{filename}: Removed video curriculum navigation links.")
    except Exception as e:
        print(f"{filename}: Error {e}")
