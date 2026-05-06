import https from 'node:https';

const url = 'https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&generator=search&gsrsearch=filetype:bitmap%20%22mozart%20l%27opera%20rock%22&gsrnamespace=6&gsrlimit=10&format=json';

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
    try {
      const json = JSON.parse(data);
      const pages = json.query.pages;
      for (const key in pages) {
        if (pages[key].imageinfo && pages[key].imageinfo[0] && pages[key].imageinfo[0].url) {
          console.log(pages[key].imageinfo[0].url);
        }
      }
    } catch (e) {
      console.error(e);
    }
  });
});
