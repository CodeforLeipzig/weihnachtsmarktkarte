const cheerio = require("cheerio");
const fs = require("fs");

const getHtml = async (url) => {
  const res = await fetch(url);
  return res.text();
};

const handleDetails = (content) => {
  const adaptedContent = content.substring(
    content.indexOf("<body"),
    content.length,
  );
  const $ = cheerio.load("<html>" + adaptedContent);
  const table = $(".cal_meta_singleview");
  const ical = $(".cal_export_singleview > div > a").first();
  const description = $(".cal_content_singleview > p")?.text()?.trim();
  const otherDateSection = $("#eventdetail-additionaldates-accordeon");
  const otherDates = otherDateSection
    .map(function () {
      return $(this)
        .find("a")
        .map(function () {
          return {
            date: $(this).text().trim(),
            link: "https://www.leipzig.de" + $(this).attr("href"),
          };
        })
        .toArray();
    })
    .toArray();
  const locationSection = $(".cal_location_singleview").first();
  const address = locationSection
    .find(".cal_address_location")
    .text()
    .trim()
    .split(" 04");
  const street = address[0];
  const zipcode = address[1] && "04" + address[1].split(" ")[0];
  const city = address[1] && address[1].split(" ")[1];

  return {
    date: table.find(".date").first().text().trim().replace("Datum ", ""),
    time: table.find(".time").first().text().trim().replace("Uhrzeit ", ""),
    location: table
      .find(".location")
      .first()
      .text()
      .trim()
      .replace("Veranstaltungsort ", ""),
    description,
    ical: "https://www.leipzig.de" + ical.attr("href"),
    otherDates,
    location: {
      name: locationSection.find("h3").text().trim(),
      street,
      zipcode,
      city,
      w3c: locationSection.find("a").attr("href")?.trim(),
    },
  };
};

const scrape = async (content) => {
  const $ = cheerio.load(content);
  const events = $(".vevent > div > a");

  const config = events
    .map(function () {
      const eventDate = $(this)
        .find(".event-date")
        .first()
        .text()
        .trim()
        .split(" ");
      return {
        url: "https://www.leipzig.de" + $(this).attr("href").trim(),
        from: eventDate[0].trim(),
        to: eventDate[2]?.trim(),
        location: $(this).find(".events_meta > strong").first().text().trim(),
        summary: $(this).find(".summary > h3").first().text().trim(),
        description: $(this).find(".description_teaser").first().text().trim(),
      };
    })
    .toArray();

  Promise.all(
    config.map(async (c) => {
      const details = await getHtml(c.url).then((c) => handleDetails(c));
      return {
        ...c,
        details,
      };
    }),
  ).then((c) => {
    const configObj = {
      markets: c,
    };
    fs.writeFileSync(
      "./markets_leipzig_de.json",
      JSON.stringify(configObj, null, 2),
      "utf-8",
    );
  });
};

const streetMappings = {
  "Eisenacher Straße 72": "Eisenacher Str. 72",
  "Menckestr. 23": "Menckestraße 23",
  "Aurelienstr. 54": "Aurelienstraße 54",
  "Nikolai-Rumjanzew-Straße 100 (Zufahrt Schönauer Straße)":
    "Nikolai-Rumjanzew-Straße 100",
  "Kochstr. 132": "Kochstraße 132",
  "Vollhardtstr. 16": "Vollhardtstraße 16",
  "Park Miltitz": "Geschwister-Scholl-Str. 8a",
  "Kleinzschocher":
    "Baumannstr. 16, Eythraer Str. 8, Windorfer Str. 44, 45 a und 55, Gießerstr. 75, Creuziger Str. 2, Luckaer Str. 16, Panitzstr. 2, Außengelände der Turnhalle Dieskaustraße 79, Pörstener Str. 9, Klarastr. 35",
  "Zuckelhausener Teich": "Zuckelhausener Teich",
  "Rathausplatz Markkleeberg": "Rathausplatz",
  "Marktplatz Markranstädt": "Marktplatz 1",
  "Marktplatz Taucha": "Marktplatz Taucha",
  "Leipziger Innenstadt": "Markt",
  "Lauersche Str. ": "Lauersche Str.",
  "Zwenkauer See": "An der Mole 1",
  "Marktplatz Liebertwolkwitz": "Markt 11",
  "Thaerstr. 39": "Thaerstraße 39",
};

const resolveStreet = (street, name) => {
  return streetMappings[street] || streetMappings[name] || street;
};

const getUniqueLocations = () => {
  const config = require("./markets_leipzig_de.json").markets;
  const knownLocations = require("./markets_wmf.json");

  const groupBy = (data, keyFun, valueFun) =>
    data.reduce((acc, curr) => {
      const key = keyFun(curr);
      const value = valueFun(curr);
      const valueList = acc[key] || [];
      if (
        valueList.filter((v) => v.properties.name == value.name).length == 0
      ) {
        valueList.push(value);
      }
      acc[key] = valueList;
      return acc;
    }, {});

  const keyFun = (l) =>
    l.details.location.city +
    "__" +
    l.details.location.zipcode +
    "__" +
    resolveStreet(l.details.location.street, l.details.location.name);

  const resolveKnownLocationCoords = (o) => {
    const found = knownLocations.filter(
      (l) =>
        /*l.w3 === o.url,*/ /*||*/ l.strasse ===
          resolveStreet(o.details?.location?.street, o.details?.location?.name),
    );
    const loc = found.length > 0 ? found[0] : null;
    return loc && [loc.lng, loc.lat];
  };

  const valueFun = (l) => ({
    type: "feature",
    properties: {
      name: l.details.location.name,
      url: l.url,
      street: resolveStreet(
        l.details?.location.street,
        l.details.location.name,
      ),
      zipcode: l.details.location.zipcode || l.details.street?.split(" ")[0],
      city: l.details.location.city || l.details.street?.split(" ")[1],
    },
    geometry: {
      type: "Point",
      coordinates: resolveKnownLocationCoords(l),
    },
  });

  const locs = groupBy(config, keyFun, valueFun);
  const sortedKeys = Object.keys(locs).sort();
  const sortedFeatures = [];
  sortedKeys.forEach((element) => {
    sortedFeatures.push(locs[element][0]);
  });
  fs.writeFileSync(
    "./markets_leipzig_de_know_locations.json",
    JSON.stringify(sortedFeatures, null, 2),
    "utf-8",
  );
};

const updateDescription = () => {
  const existing = require("./markets_wmf.json");
  const leipzigde = require("./markets_leipzig_de.json").markets;
  for (market of leipzigde) {
    const found = existing.filter((exist) =>
      exist.strasse == resolveStreet(
        market.details?.location.street,
        market.details.location.name,
      )
    );
    if (found.length > 0) {
      for (elem of found) {
        elem.w3 = market.url;
        elem.rss_beschreibung = market.details?.description;
      }
    }
  }
  fs.writeFileSync(
    "./markets_wmf.json",
    JSON.stringify(existing, null, 2),
    "utf-8",
  );
};

const findMissingDescriptions = () => {
  const existing = require("./markets_wmf.json");
  const found = existing.filter(
    (exist) =>
      !exist.rss_beschreibung || exist.rss_beschreibung.trim().length === 0,
  );
  if (found.length > 0) {
    for (elem of found) {
      console.log(`missing description for: ${elem.name}`);
    }
  }
};

const updateFromToDates = () => {
  const existing = require("./markets_wmf.json");
  const leipzigde = require("./markets_leipzig_de.json").markets;
  for (market of leipzigde) {
    const marketDate = market.details?.date;
    const found = existing.filter((exist) =>
      exist.strasse == resolveStreet(
        market.details?.location.street,
        market.details.location.name,
      )
    );
    if (found.length > 0) {
      for (elem of found) {
        if (
          !elem.bis || (elem.bis.indexOf(".23") > 0) ||
          (elem.bis.indexOf(".11.") > 0 && marketDate.indexOf(".12.") > 0) ||
          (elem.bis.indexOf(".11.") > 0 && marketDate.indexOf(".11.") > 0 &&
            elem.bis.localeCompare(marketDate) < 0) ||
          (elem.bis.indexOf(".12.") > 0 && marketDate.indexOf(".12.") > 0 &&
            elem.bis.localeCompare(marketDate) < 0)
        ) {
          elem.bis = marketDate.replace(".2024", ".24");
        }
        if (
          !elem.von || (elem.von.indexOf(".23") > 0) ||
          (elem.von.indexOf(".12.") > 0 && marketDate.indexOf(".11.") > 0) ||
          (elem.von.indexOf(".11.") > 0 && marketDate.indexOf(".11.") > 0 &&
            elem.von.localeCompare(marketDate) > 0) ||
          (elem.von.indexOf(".12.") > 0 && marketDate.indexOf(".12.") > 0 &&
            elem.von.localeCompare(marketDate) > 0)
        ) {
          elem.von = marketDate.replace(".2024", ".24");
        }
      }
    }
  }
  fs.writeFileSync(
    "./markets_wmf.json",
    JSON.stringify(existing, null, 2),
    "utf-8",
  );
};

getHtml(
  "https://www.leipzig.de/freizeit-kultur-und-tourismus/veranstaltungen-und-termine/weihnachten/weihnachtsmaerkte/",
).then((content) => scrape(content));
getUniqueLocations();
updateDescription();
updateFromToDates();

findMissingDescriptions();
