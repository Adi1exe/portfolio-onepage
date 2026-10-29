"""Refresh data.js with a rolling 53-week GitHub contribution snapshot."""
from datetime import date, timedelta
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.request import Request, urlopen

USER = "Adi1exe"
USER_AGENT = "portfolio-contribution-calendar"
TIMEOUT = 30
TOOLTIP_COUNT = re.compile(r"^\s*(No|\d+)\s+contributions?\b", re.IGNORECASE)


def fetch(url):
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=TIMEOUT) as response:
        return response.read().decode("utf-8")


class ContributionParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.cells = {}
        self.tooltips = {}
        self._tooltip_id = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "td" and attrs.get("id", "").startswith("contribution-day-component-"):
            self.cells[attrs["id"]] = (attrs["data-date"], int(attrs["data-level"]))
        elif tag == "tool-tip" and "for" in attrs:
            self._tooltip_id = attrs["for"]
            self.tooltips[self._tooltip_id] = ""

    def handle_data(self, data):
        if self._tooltip_id is not None:
            self.tooltips[self._tooltip_id] += data

    def handle_endtag(self, tag):
        if tag == "tool-tip":
            self._tooltip_id = None


def main():
    today = date.today()
    start = today - timedelta(days=364)
    start -= timedelta(days=(start.weekday() + 1) % 7)  # Sunday, matching GitHub's columns.
    first_year = start.year
    last_year = today.year
    rows = {}

    for year in range(first_year, last_year + 1):
        url = (
            f"https://github.com/users/{USER}/contributions"
            f"?from={year}-01-01&to={year}-12-31"
        )
        parser = ContributionParser()
        parser.feed(fetch(url))
        yearly_rows = {}

        for cell_id, (day, level) in parser.cells.items():
            tooltip = parser.tooltips.get(cell_id)
            match = TOOLTIP_COUNT.match(tooltip or "")
            if match is None:
                raise ValueError(f"Could not read the contribution count for {day}.")
            count = 0 if match.group(1).lower() == "no" else int(match.group(1))
            parsed_day = date.fromisoformat(day)
            if parsed_day.year != year:
                raise ValueError(f"Unexpected contribution date {day} in the {year} calendar.")
            yearly_rows[parsed_day] = (level, count)

        day_count = (date(year + 1, 1, 1) - date(year, 1, 1)).days
        if len(yearly_rows) != day_count:
            raise ValueError(
                f"Expected {day_count} daily contributions for {year}, "
                f"but GitHub returned {len(yearly_rows)}."
            )
        rows.update(yearly_rows)

    lv, counts = [], []
    current_day = start
    while current_day <= today:
        level, count = rows.get(current_day, (0, 0))
        lv.append(str(level))
        counts.append(count)
        current_day += timedelta(days=1)

    data = {
        "since": start.isoformat(),
        "through": today.isoformat(),
        "start": start.isoformat(),
        "lv": "".join(lv),
        "ct": counts,
    }
    output = Path(__file__).with_name("data.js")
    output.write_text(
        "// GitHub contributions snapshot. Regenerate with: python update_contributions.py\n"
        "window.CONTRIB=" + json.dumps(data, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    print(
        f"Wrote {output.name}: {sum(counts)} contributions "
        f"from {start.isoformat()} through {today.isoformat()}."
    )
    sitemap = Path(__file__).with_name("sitemap.xml")
    if sitemap.exists():
        text = sitemap.read_text(encoding="utf-8")
        text = re.sub(r"<lastmod>.*?</lastmod>", f"<lastmod>{date.today().isoformat()}</lastmod>", text)
        sitemap.write_text(text, encoding="utf-8")

if __name__ == "__main__":
    main()
