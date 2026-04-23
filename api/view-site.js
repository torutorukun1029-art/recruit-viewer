const { list } = require('@vercel/blob');

module.exports = async (req, res) => {
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0];
  
  try {
    const { blobs } = await list({ prefix: `domains/${host}.json` });
    if (blobs.length === 0) return res.status(404).send('サイトが見つかりません: ' + host);

    const mappingRes = await fetch(blobs[0].url);
    const mapping = await mappingRes.json();

    if (mapping.status === 'stopped') {
      return res.status(200).send('<h1>公開停止中</h1>');
    }

    const siteRes = await fetch(mapping.blobUrl);
    if (!siteRes.ok) return res.status(404).send('サイトが見つかりません');

    const html = await siteRes.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch(e) {
    return res.status(500).send('エラー: ' + e.message);
  }
};
