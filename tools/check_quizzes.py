import json

raw = open('assets/content/textbook-content.js', encoding='utf-8').read()
json_str = raw[raw.index('{'):raw.rindex('}')+1]
data = json.loads(json_str)

for ch in data['chapters']:
    q = ch.get('quiz', {})
    mcqs = len(q.get('mcqs', []))
    tf = len(q.get('trueFalse', []))
    sa = len(q.get('shortAnswer', []))
    dbg = len(q.get('debugging', []))
    chal = len(q.get('codingChallenges', []))
    total = mcqs + tf + sa + dbg + chal
    print(f"Chapter {ch['id']}: MCQs={mcqs}, TF={tf}, SA={sa}, DBG={dbg}, Chal={chal} | Total={total}")
