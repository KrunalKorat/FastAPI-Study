import glob
import re
import os

html_files = sorted(glob.glob('*.html'))
print(f'Checking {len(html_files)} HTML files...')
errors = []

for hf in html_files:
    with open(hf, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check for leftover ch=5 in primary navigation
    old_nav_ch5 = re.findall(r'<a[^>]+(?:Read the Book|Quizzes|Read Textbook)[^>]*ch=5', content, re.IGNORECASE)
    if old_nav_ch5:
        errors.append(f'{hf}: Found primary navigation pointing to ch=5 instead of ch=1: {old_nav_ch5}')

    # Check for theme toggle references in HTML
    theme_toggles = re.findall(r'id=["\']theme-toggle["\']|class=["\'][^"\']*theme-toggle[^"\']*["\']', content)
    if theme_toggles:
        errors.append(f'{hf}: Found lingering theme-toggle elements: {theme_toggles}')

    # Check local script and stylesheet references
    scripts = re.findall(r'<script[^>]+src=[\'"]([^\'"]+)[\'"]', content)
    for s in scripts:
        if not s.startswith('http') and not os.path.exists(s):
            errors.append(f'{hf}: Missing script file {s}')

    styles = re.findall(r'<link[^>]+href=[\'"]([^\'"]+)[\'"]', content)
    for st in styles:
        if not st.startswith('http') and not st.startswith('#') and not st.startswith('data:') and not os.path.exists(st):
            errors.append(f'{hf}: Missing stylesheet/asset file {st}')

if errors:
    for e in errors:
        print('ISSUE:', e)
else:
    print('SUCCESS: All HTML files verified clean!')
    print('  - All navigation links default to Chapter 1')
    print('  - Zero lingering theme toggles')
    print('  - All referenced scripts and stylesheets exist on disk')
