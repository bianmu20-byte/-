import https from 'node:https';

const words = ["Mikelangelo Loconte", "Florent Mothe", "Melissa Mars", "Diane Dassigny", "Mozart l'opera rock", "Mozart l'opera"];
let done = 0;
const results = [];

words.forEach((w) => {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&generator=search&gsrsearch=filetype:bitmap%20%22${encodeURIComponent(w)}%22&gsrnamespace=6&gsrlimit=5&format=json`;

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
        const pages = json.query?.pages || {};
        for (const key in pages) {
          if (pages[key].imageinfo && pages[key].imageinfo[0] && pages[key].imageinfo[0].url) {
            results.push(pages[key].imageinfo[0].url.split('?')[0]);
          }
        }
      } catch (e) {
      }
      done++;
      if (done === words.length) {
        console.log(Array.from(new Set(results)).join('\n'));
      }
    });
  });
});
