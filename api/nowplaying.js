module.exports = async (req, res) => {
  const { LASTFM_USER, LASTFM_KEY } = process.env;
  if (!LASTFM_USER || !LASTFM_KEY) return res.status(200).json({});
  try {
    const r = await fetch(
      'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' +
      encodeURIComponent(LASTFM_USER) + '&api_key=' + encodeURIComponent(LASTFM_KEY) +
      '&format=json&limit=1'
    );
    const j = await r.json();
    const t = j.recenttracks && j.recenttracks.track && j.recenttracks.track[0];
    if (!t) return res.status(200).json({});
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');
    res.status(200).json({
      live: !!(t['@attr'] && t['@attr'].nowplaying === 'true'),
      name: t.name, artist: t.artist['#text'], url: t.url
    });
  } catch (e) { res.status(200).json({}); }
};