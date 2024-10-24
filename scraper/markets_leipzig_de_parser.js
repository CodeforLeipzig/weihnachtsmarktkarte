const cheerio = require('cheerio')
const fs = require('fs')

const getHtml = async (url) => {
  const res = await fetch(url)
  return res.text()
}

const handleDetails = (content) => {
  const adaptedContent = content.substring(
    content.indexOf('<body'),
    content.length
  )
  const $ = cheerio.load('<html>' + adaptedContent)
  const table = $('.cal_meta_singleview')
  const ical = $('.cal_export_singleview > div > a').first()
  const description = $('.cal_content_singleview > p')?.text()?.trim()
  const otherDateSection = $('#eventdetail-additionaldates-accordeon')
  const otherDates = otherDateSection
    .map(function () {
      return $(this)
        .find('a')
        .map(function () {
          return {
            date: $(this).text().trim(),
            link: 'https://www.leipzig.de' + $(this).attr('href'),
          }
        })
        .toArray()
    })
    .toArray()
  const locationSection = $('.cal_location_singleview').first()
  const address = locationSection
    .find('.cal_address_location')
    .text()
    .trim()
    .split(' 04')
  const street = address[0]
  const zipcode = address[1] && '04' + address[1].split(' ')[0]
  const city = address[1] && address[1].split(' ')[1]

  return {
    date: table.find('.date').first().text().trim().replace('Datum ', ''),
    time: table.find('.time').first().text().trim().replace('Uhrzeit ', ''),
    location: table
      .find('.location')
      .first()
      .text()
      .trim()
      .replace('Veranstaltungsort ', ''),
    description,
    ical: 'https://www.leipzig.de' + ical.attr('href'),
    otherDates,
    location: {
      name: locationSection.find('h3').text().trim(),
      street,
      zipcode,
      city,
      w3c: locationSection.find('a').attr('href')?.trim(),
    },
  }
}

const scrape = async (content) => {
  const $ = cheerio.load(content)
  const events = $('.vevent > div > a')

  const config = events
    .map(function () {
      const eventDate = $(this)
        .find('.event-date')
        .first()
        .text()
        .trim()
        .split(' ')
      return {
        url: 'https://www.leipzig.de' + $(this).attr('href').trim(),
        from: eventDate[0].trim(),
        to: eventDate[2]?.trim(),
        location: $(this).find('.events_meta > strong').first().text().trim(),
        summary: $(this).find('.summary > h3').first().text().trim(),
        description: $(this).find('.description_teaser').first().text().trim(),
      }
    })
    .toArray()

  Promise.all(
    config.map(async (c) => {
      const details = await getHtml(c.url).then((c) => handleDetails(c))
      return {
        ...c,
        details,
      }
    })
  ).then((c) => {
    const configObj = {
      markets: c,
    }
    fs.writeFileSync(
      './markets_leipzig_de.json',
      JSON.stringify(configObj, null, 2),
      'utf-8'
    )
  })
}

const getUniqueLocations = () => {
  const config = require('./markets_leipzig_de.json').markets
  const knownLocations = require('./markets_wmf.json')

  const groupBy = (data, keyFun, valueFun) =>
    data.reduce((acc, curr) => {
      const key = keyFun(curr)
      const value = valueFun(curr)
      const valueList = acc[key] || []
      if (
        valueList.filter((v) => v.properties.name == value.name).length == 0
      ) {
        valueList.push(value)
      }
      acc[key] = valueList
      return acc
    }, {})

  const keyFun = (l) =>
    l.details.location.city +
    '__' +
    l.details.location.zipcode +
    '__' +
    l.details.location.street

  const resolveKnownLocationCoords = (o) => {
    const found = knownLocations.filter(
      (l) => l.w3 === o.url /*|| l.strasse === o.details?.location.street*/
    )
    const loc = found.length > 0 ? found[0] : null
    return loc && [loc.lng, loc.lat]
  }

  const valueFun = (l) => ({
    type: 'feature',
    properties: {
      name: l.details.location.name,
      url: l.url,
      street: l.details.location.street,
      zipcode: l.details.location.zipcode,
      city: l.details.location.city,
    },
    geometry: {
      type: 'Point',
      coordinates: resolveKnownLocationCoords(l),
    },
  })

  const locs = groupBy(config, keyFun, valueFun)
  const sortedKeys = Object.keys(locs).sort()
  const sortedFeatures = []
  sortedKeys.forEach((element) => {
    sortedFeatures.push(locs[element][0])
  })
  fs.writeFileSync(
    './markets_leipzig_de_know_locations.json',
    JSON.stringify(sortedFeatures, null, 2),
    'utf-8'
  )
}

const updateDescription = () => {
  const existing = require('./markets_wmf.json')
  const leipzigde = require('./markets_leipzig_de.json').markets
  for (market of leipzigde) {
    const found = existing.filter((exist) => exist.w3 === market.url)
    if (found.length > 0) {
      for (elem of found) {
        elem.rss_beschreibung = market.details?.description
      }
    }
  }
  fs.writeFileSync(
    './markets_wmf.json',
    JSON.stringify(existing, null, 2),
    'utf-8'
  )
}

const findMissingDescriptions = () => {
  const existing = require('./markets_wmf.json')
  const found = existing.filter(
    (exist) =>
      !exist.rss_beschreibung || exist.rss_beschreibung.trim().length === 0
  )
  if (found.length > 0) {
    for (elem of found) {
      console.log(`missing description for: ${elem.name}`)
    }
  }
}

getHtml(
  'https://www.leipzig.de/freizeit-kultur-und-tourismus/veranstaltungen-und-termine/weihnachten/weihnachtsmaerkte/'
).then((content) => scrape(content))

getUniqueLocations()
updateDescription()

findMissingDescriptions()
