const cheerio = require("cheerio");
const fs = require("fs");

const getHtml = async (url) => {
  const res = await fetch(url);
  return res.text();
};

const scrape = async (content) => {
  const $ = cheerio.load(content, null, false)
  const events = $(".wp-block-media-text__content");
  const markets = events
    .map(function () {
      const children = $(this).children();
      const nameTag = children.next();
      const name = $(this).children(".wp-block-heading").first().text();
      const contentTag = children.next();
      const result = [];
      let nodes = contentTag.contents().toArray();
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].tagName === 'strong') {
          const tag = $(nodes[i]).text().trim();
          let value = '';
          let j = i + 1;
          while (j < nodes.length && !(nodes[j].tagName === 'strong')) {
            value += $.html(nodes[j]) || $(nodes[j]).text();
            j++;
          }
          value = cheerio.load(`<div>${value}</div>`)('div').text().trim();
          result.push({ tag, value });
        } else if (nodes[i].tagName === 'a') {
          result.push({ tag: 'a', value: nodes[i].attribs['href'] });
        }
      }
      const location = result.find(entry => entry.tag === 'Wo?')?.value;
      const date = result[0].tag.replace(". November 2025", ".11.25").replace(". Dezember 2025", ".12.25").replace(". Januar 2026", ".01.26").replace(". November", ".11.25").replace(". Dezember", ".12.25").replace(". Januar", ".01.26");
      const when = result[0].value.replace("// ", "").replace(" Uhr", "").replace(" bis ", "-").replace(" - ", "-");
      const parts = when.split("-")
      const start = parts[0].indexOf(":") >=0 ? parts[0] : parts[0] + ":00";
      const end = parts.length > 1 ? parts[1].indexOf(":") >=0 ? parts[1] : parts[1] + ":00" : "";
      const description = result.find(entry => entry.tag === 'Was?')?.value;
      const w3c = result.find(entry => entry.tag === 'a')?.value;
      return {
        name,
        description,
        location,
        time: end ? start + "-" + end : when,
        date,
        w3c,
      };
    })
    .toArray();
  const configObj = {
    markets,
  };
  fs.writeFileSync(
    "./markets_leipzig_leben.json",
    JSON.stringify(configObj, null, 2),
    "utf-8",
  );
};

const content = fs.readFileSync(
  "/Users/joerg_p/Desktop/62 Weihnachtsmärkte in Leipzig 2025 _ Alle Orte & Termine.html",
  "utf-8",
);
scrape(content);
