// Notify IndexNow (Bing, Yandex, Seznam, Naver…) that pages changed.
// Usage: node scripts/indexnow.mjs            -> every URL in the live sitemap
//        node scripts/indexnow.mjs <url> ...  -> just those URLs
// The key file is public/9c09c21bdb71ae8fe3df1e3df8628e5f.txt.
const KEY = "9c09c21bdb71ae8fe3df1e3df8628e5f";
const HOST = "www.aeorank.tech";

let urls = process.argv.slice(2);
if (urls.length === 0) {
  const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log(`IndexNow: ${res.status} for ${urls.length} URLs`);
