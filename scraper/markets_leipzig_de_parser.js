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
  "Kleinzschocher": "Windorfer Straße 49",
  "Zuckelhausener Teich": "Zuckelhausener Ring 17",
  "Rathausplatz Markkleeberg": "Rathausplatz",
  "Marktplatz Markranstädt": "Marktplatz 1",
  "Marktplatz Taucha": "Marktplatz Taucha",
  "Leipziger Innenstadt": "Markt",
  "Lauersche Str. ": "Kees'scher Park 1",
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

const parseDate = (str) => {
  const segments = str.split(".");
  const year = segments[2];
  return new Date(
    (year.length == 2) ? `20${year}` : year,
    Number(segments[1]) - 1,
    segments[0],
  );
};
const formatDate = (dt) => {
  const dayStr = ("0" + dt.getDate()).slice(-2);
  const monthStr = ("0" + (dt.getMonth() + 1)).slice(-2);
  const yearStr = ("" + dt.getYear()).slice(-2);
  return `${dayStr}.${monthStr}.${yearStr}`;
};

const updateFromToDates = () => {
  const existing = require("./markets_wmf.json");
  const leipzigde = require("./markets_leipzig_de.json").markets;
  for (market of leipzigde) {
    const splitted = market.details?.date?.split("-");
    const marketFromDate = (splitted && splitted.length > 0) &&
      parseDate(splitted[0].trim());
    const marketToDate = (splitted && splitted.length > 1) &&
      parseDate(splitted[1].trim());
    const found = existing.filter((exist) =>
      exist.strasse == resolveStreet(
        market.details?.location.street,
        market.details.location.name,
      )
    );
    if (found.length > 0) {
      for (elem of found) {
        const bis = elem.bis && parseDate(elem.bis);
        if (!bis || bis < new Date(2024, 10, 1) || marketToDate > bis) {
          elem.bis = formatDate(marketToDate);
        }
        const von = elem.von && parseDate(elem.von);
        if (!von || von < new Date(2024, 10, 1) || marketFromDate < von) {
          elem.von = formatDate(marketFromDate);
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

const updateWeekDays = () => {
  const existing = require("./markets_wmf.json");
  const leipzigde = require("./markets_leipzig_de.json").markets;
  const weekDayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const minDate = (dates) =>
    dates && dates.length > 0 &&
    dates.reduce((prev, curr) => prev.localeCompare(curr) > 0 ? curr : prev);
  const maxDate = (dates) =>
    (dates && dates.length > 0)
      ? dates.reduce((prev, curr) => prev.localeCompare(curr) < 0 ? curr : prev)
      : "23:59";
  const mostFreqDates = (dates) => {
    const map = dates.reduce(
      (acc, e) => {
        acc[e] = (acc[e] || 0) + 1;
        return acc;
      },
      {},
    );
    const keys = Object.keys(map);
    const maxOccurKey = keys && keys.length > 0 &&
      keys.reduce((prev, curr) => map[prev] < map[curr] ? curr : prev);
    const maxOccur = map[maxOccurKey];
    console.log(`${keys}: ${maxOccur} - ${map}`);
    return maxOccur && keys.filter((key) => map[key] === maxOccur);
  };
  const allDatesBetween = (startDateStr, endDateStr) => {
    const dates = [];
    const dateMove = parseDate(startDateStr);
    const endDate = parseDate(endDateStr);
    while (dateMove <= endDate) {
      var strDate = formatDate(dateMove);
      dates.push(strDate);
      dateMove.setDate(dateMove.getDate() + 1);
    }
    return dates;
  };
  for (market of existing) {
    const days = {};
    const weekdaysList = {};
    const weekdays = {};
    const found = leipzigde.filter((exist) =>
      market.strasse == resolveStreet(
        exist.details?.location.street,
        exist.details.location.name,
      )
    );
    if (found.length > 0) {
      for (elem of found) {
        const marketDateRaw = elem.details?.date;
        const date = parseDate(marketDateRaw);
        const marketDate = formatDate(date);
        const day = weekDayNames[date.getDay()];
        const parts = elem.details?.time?.split(" - ");
        days[marketDate] = {
          "start": parts.length > 0 && parts[0],
          "end": parts.length > 1 && parts[1],
        };
        const weekday = weekdaysList[day];
        if (weekday) {
          weekday.push(marketDate);
        } else {
          weekdaysList[day] = [marketDate];
        }
      }
      const minStart = minDate(mostFreqDates(
        Object.keys(days).map((day) => days[day].start).filter((day) => !!day),
      ));
      const maxEnd = maxDate(mostFreqDates(
        Object.keys(days).map((day) => days[day].end).filter((day) => !!day),
      ));
      for (weekDayName of weekDayNames) {
        const data = weekdaysList[weekDayName];
        const reduced = data && {
          start: minDate(
            data.map((date) => days[date].start).filter((day) => !!day),
          ),
          end: maxDate(
            data.map((date) => days[date].end).filter((day) => !!day),
          ),
        };
        market[weekDayName] = (reduced && reduced.start)
          ? `${reduced.start}-${reduced.end || "23:59"}`
          : 0;
      }
      const fromToStr = (min, max) => `${min}-${max}`;
      if (minStart) {
        const globalOpenTime = fromToStr(minStart, maxEnd);
        market["oeffnungszeiten"] = globalOpenTime;
        const allDates = allDatesBetween(market.von, market.bis);
        const closed = [];
        const hours = [];
        for (date of allDates) {
          if (!days[date]) {
            closed.push(date);
          } else {
            const dayData = days[date];
            const dayOpenStr = fromToStr(dayData.start, dayData.end || "23:59");
            if (dayOpenStr != globalOpenTime) {
              hours.push(`${date}=${dayOpenStr}`);
            }
          }
        }
        market["closed-exc"] = closed.length > 0 ? closed.join(",") : 0;
        market["hours-exc"] = hours.length > 0 ? hours.join(",") : 0;
      }

      // "closed-exc": "04.11.24,11.11.24,18.11.24,25.11.24,02.12.24,09.12.24,16.12.24,23.12.24,30.12.24,06.01.25,13.01.25",
      // "closed-exc-readable": "montags",
      // "hours-exc": "01.12.24=11:00-18:00"
      // "hours-exc-readable": "sonntags nur bis 19 Uhr",
    }
  }
  fs.writeFileSync(
    "./markets_wmf.json",
    JSON.stringify(existing, null, 2),
    "utf-8",
  );
};

/*getHtml(
  "https://www.leipzig.de/freizeit-kultur-und-tourismus/veranstaltungen-und-termine/weihnachten/weihnachtsmaerkte/",
).then((content) => scrape(content));*/
getUniqueLocations();
updateDescription();
updateFromToDates();
updateWeekDays();
findMissingDescriptions();
