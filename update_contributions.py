"""Refresh data.js from your public GitHub contribution calendar."""
import json, re, urllib.request

USER = "Adi1exe"
html = urllib.request.urlopen(f"https://github.com/users/{USER}/contributions").read().decode()
cells = re.findall(r'data-date="(\d{4}-\d{2}-\d{2})" id="(contribution-day-component-\d+-\d+)" data-level="(\d)"', html)
tips = dict(re.findall(r'for="(contribution-day-component-\d+-\d+)"[^>]*>([^<]*)', html))
rows = {}
for date, cid, level in cells:
    m = re.match(r"(\d+|No) contribution", tips[cid].strip())
    rows[date] = (int(level), 0 if m.group(1) == "No" else int(m.group(1)))
days = sorted(rows)
data = {"start": days[0], "lv": "".join(str(rows[d][0]) for d in days), "ct": [rows[d][1] for d in days]}
with open("data.js", "w") as f:
    f.write("// GitHub contributions snapshot. Regenerate with: python update_contributions.py\n")
    f.write("window.CONTRIB=" + json.dumps(data, separators=(",", ":")) + ";\n")
print("Wrote data.js:", sum(c for _, c in rows.values()), "contributions")
