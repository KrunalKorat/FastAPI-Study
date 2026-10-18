import urllib.request
import json

with open('tools/playlist_metadata.json', 'r', encoding='utf-8') as f:
    videos = json.load(f)

print(f"Testing oEmbed for all {len(videos)} videos...")
results = []

for v in videos:
    vid = v['id']
    oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    req = urllib.request.Request(oembed_url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            results.append((v['part'], vid, True, data.get('title', ''), 'OK'))
            print(f"Part {v['part']} [{vid}]: Embeddable! Title: {data.get('title')[:40]}...")
    except Exception as e:
        results.append((v['part'], vid, False, v['title'], str(e)))
        print(f"Part {v['part']} [{vid}]: Failed oEmbed -> {e}")

all_ok = all(r[2] for r in results)
print(f"\nAll 19 videos embeddable check: {all_ok}")
