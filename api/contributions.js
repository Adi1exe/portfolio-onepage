const QUERY = `query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

module.exports = async (_req, res) => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(503).json({ error: 'GitHub contributions are not configured.' });

  try {
    const today = new Date().toISOString().slice(0, 10);
    const sunday = new Date(`${today}T00:00:00Z`);
    sunday.setUTCDate(sunday.getUTCDate() - 364);
    sunday.setUTCDate(sunday.getUTCDate() - sunday.getUTCDay());
    const start = sunday.toISOString().slice(0, 10);
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'aditya-portfolio-contributions',
      },
      body: JSON.stringify({
        query: QUERY,
        variables: {
          login: process.env.GITHUB_USER || 'Adi1exe',
          from: `${start}T00:00:00Z`,
          to: `${today}T23:59:59Z`,
        },
      }),
    });
    const result = await response.json();
    if (!response.ok || result.errors) throw new Error('GitHub contribution query failed.');

    const calendar = result.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) throw new Error('GitHub user was not found.');
    const days = calendar.weeks.flatMap((week) => week.contributionDays)
      .filter((day) => day.date >= start && day.date <= today);
    const levels = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({
      start,
      through: today,
      total: calendar.totalContributions,
      days: days.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: levels[day.contributionLevel] ?? 0,
      })),
    });
  } catch (_error) {
    return res.status(502).json({ error: 'Could not load GitHub contributions.' });
  }
};
