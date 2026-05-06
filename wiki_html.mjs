import https from 'node:https';

const url = 'https://commons.wikimedia.org/wiki/Category:Mozart,_l%27op%C3%A9ra_rock';

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (NodeApp) bot'
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    // extract src="https://upload.wikimedia.org/wikipedia/commons/thumb/..."
    const regex = /src=["'](https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/[^"']+\/[^"']+\.jpg\/[^"']+\.jpg)["']/ig;
    let match;
    const urls = new Set();
    while ((match = regex.exec(data)) !== null) {
      urls.add(match[1]);
    }
    console.log(Array.from(urls).join('\n'));
  });
}).on('error', (e) => {
  console.error(e);
});
