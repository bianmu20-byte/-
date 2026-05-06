import https from 'node:https';

const url = 'https://www.pexels.com/search/gothic%20portrait/';

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const regex = /(https:\/\/images\.pexels\.com\/photos\/\d+\/pexels-photo-\d+\.jpeg\?auto=compress&cs=tinysrgb&w=\d+)/g;
    const matches = data.match(regex);
    if (matches) {
       console.log(Array.from(new Set(matches)).slice(0, 5).join('\n'));
    } else {
       console.log("No matches found.");
    }
  });
}).on('error', (e) => {
  console.error(e);
});
