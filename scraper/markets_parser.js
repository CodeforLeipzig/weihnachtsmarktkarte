fs = require('fs')

const readFileAsPromise = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

const parseLeipzigDe = async () => {
  return readFileAsPromise('./markets_leipzig_de.txt')
    .then((data) => {
      const entries = data.split('\n\n')
      const markets = []
      for (var i = 0; i < entries.length; i++) {
        const lines = entries[i].split('\n')
        const dateAndTime = lines[0].split(' • ')
        const date = dateAndTime[0]?.split(' - ')
        const location = lines[1]
        const name = lines[2]
        const description = lines[3]
        markets.push({
          Name: name,
          Von: date[0],
          Bis: date[1],
          Zeit: dateAndTime[1]?.replace(': ', ':'),
          Ort: location,
          Beschreibung: description,
          source:
            'https://www.leipzig.de/freizeit-kultur-und-tourismus/veranstaltungen-und-termine/weihnachten/weihnachtsmaerkte/',
          source_desc: 'Stadt Leipzig',
        })
      }
      return markets
    })
    .catch((err) => {
      throw err
    })
}

const parseLeipzigLeben = async () => {
  return readFileAsPromise('./markets_leipzig_leben.json')
    .then((data) => {
      return data
    })
    .catch((err) => {
      throw err
    })
}

const parseJson = async (jsonFile) => {
  return readFileAsPromise(jsonFile)
    .then((data) => {
      return JSON.parse(data)
    })
    .catch((err) => {
      throw err
    })
}

const jsonToCsv = (data) => {
  const keys = Object.keys(data[0])
  const lines = []
  const header = keys.join(';')
  lines.push(header)
  for (var i = 0; i < data.length; i++) {
    const line = keys.map((curr) => data[i][curr]).join(';')
    lines.push(line)
  }
  return lines.reduce((prev, curr) => prev + '\n' + curr)
}

const jsonToGeojson = (data) => {
  const entries = []
  for (var i = 0; i < data.length; i++) {
    const props = data[i]
    const entry = {
      type: 'Feature',
      properties: props,
      geometry: {
        type: 'Point',
        coordinates: [props.lng, props.lat],
      },
    }
    entries.push(JSON.stringify(entry, null, 2))
  }
  const main = JSON.stringify(
    {
      type: 'FeatureCollection',
      name: 'markets',
      crs: {
        type: 'name',
        properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' },
      },
      features: [],
    },
    null,
    2
  )
  return main.replace(
    '"features": []',
    '"features": [' + entries.reduce((prev, curr) => prev + ',' + curr) + ']'
  )
}

const geojsonToJson = (data) => {
  return data.features.map((d) => d.properties)
}

const groupByLoc = (data) => {
  const map = new Map()
  data.map((entry) => {
    const key = entry.Ort + '__' + entry.Name
    const existing = map.get(key)
    if (existing) {
      existing.push(entry)
    } else {
      map.set(key, [entry])
    }
  })
  return map
}

const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

const getDate = (dateStr) => {
  const parts = dateStr.split('.')
  return new Date(parts[2], parts[1] - 1, parts[0])
}

const getWeekDay = (date) => weekdays[date.getDay()]

const groupToJson = ({ id, grouped }) => {
  const group = grouped[0]
  const dateMap = grouped.map((gr) => {
    return { dateStr: gr.Von, date: getDate(gr.Von) }
  })
  const fromDate = Math.min(dateMap.map((entry) => entry.date.getTime()))
  const from = dateMap.filter((entry) => entry.date.getTime() === fromDate)[0]
    ?.dateStr
  const toDate = Math.max(dateMap.map((entry) => entry.date.getTime()))
  const to = dateMap.filter((entry) => entry.date.getTime() === toDate)[0]
    ?.dateStr
  const json = {
    id: id,
    name: group.Name,
    shortname: group.Name,
    strasse: null,
    plz_ort: null,
    bezirk: null,
    veranstalter: group.Ort,
    von: from || group.Von,
    bis: to || group.Von,
    oeffnungszeiten: group.Zeit?.replace(': ', ':').replace(' - ', '-'),
    email: null,
    w3: null,
    bemerkungen: null,
    lat: null,
    lng: null,
    rss_titel: group.Name,
    rss_beschreibung: group.Beschreibung || null,
    barrierefrei: null,
    'immer-kostenlos': 1,
    Mo: 0,
    Di: 0,
    Mi: 0,
    Do: 0,
    Fr: 0,
    Sa: 0,
    So: 0,
    'closed-exc': 0,
    'closed-exc-readable': null,
    'hours-exc': 0,
    'hours-exc-readable': null,
    ignore: 0,
    merged: null,
    international: 0,
    action: 0,
    image: null,
    urheberschaft: null,
    train: null,
    train_distance: null,
    short_distance: 0,
    ignore: false,
  }
  for (gr of grouped) {
    const date = getDate(gr.Von)
    const weekDay = getWeekDay(date)
    json[weekDay] = group.Zeit?.replace(': ', ':').replace(' - ', '-')
  }
  return json
}

const readInnerGeojson = () => {
  return readFileAsPromise('./markets_inner.geojson')
    .then((data) => {
      const entries = JSON.parse(data).features
      const markets = []
      var index = 500
      for (var i = 0; i < entries.length; i++) {
        const entry = entries[i]
        const coords = entry.geometry.coordinates
        const lat = coords[1]
        const lng = coords[0]
        const atts = entry.properties
        const train =
          'Augustusplatz'.localeCompare(atts.standort) == 0
            ? 'Straßenbahn 4, 7, 12, 14, 15 (oder 8, 10, 11, 14 auf Ostseite)'
            : 'S1, S2, S3, S4, S5, S5X und S6 bis "Leipzig, Markt"'
        markets.push({
          id: index,
          bezirk: 'Zentrum',
          name: 'Haus ' + atts.hausnummer,
          shortname: atts.firma,
          strasse: atts.standort,
          plz_ort: '04109 Leipzig',
          von: '28.11.23',
          bis: '23.12.23',
          veranstalter: atts.firma,
          oeffnungszeiten: '10:00-21:00',
          email: null,
          w3:
            atts.internet ||
            'https://www.leipzig.de/freizeit-kultur-und-tourismus/veranstaltungen-und-termine/eventsingle/event/leipziger-weihnachtsmarkt-2023',
          bemerkungen: null,
          lat: lat,
          lng: lng,
          rss_titel: atts.firma,
          barrierefrei: null,
          'immer-kostenlos': 1,
          Mo: '10:00-21:00',
          Di: '10:00-21:00',
          Mi: '10:00-21:00',
          Do: '10:00-21:00',
          Fr: '10:00-22:00',
          Sa: '10:00-22:00',
          So: '10:00-21:00',
          'closed-exc': 0,
          'closed-exc-readable': null,
          'hours-exc':
            '01.12.23=10:00-22:00,02.12.23=10:00-22:00,08.12.23=10:00-22:00,09.12.23=10:00-22:00,15.12.23=10:00-22:00,16.12.23=10:00-22:00,22.12.23=10:00-22:00',
          'hours-exc-readable': 'freitags und samstags bis 22 Uhr',
          ignore: 0,
          merged: null,
          international: 0,
          action: 0,
          image: null,
          urheberschaft: null,
          train: train,
          train_distance: 72,
          short_distance: 1,
          rss_beschreibung: atts.angebot,
        })
        index++
      }
      return markets
    })
    .catch((err) => {
      throw err
    })
}

const readToiletsInner = () => {
  return readFileAsPromise('./markets_inner_auxiliary.geojson')
    .then((data) => {
      const toilets = JSON.parse(data)
      const features = []
      for (feature of toilets.features) {
        const art = feature.properties.objektart
        if (art == 'WC / Behinderten-WC' || art == 'WC') {
          features.push({
            type: 'Feature',
            properties: {
              Description: 'WC',
              isHandicappedAccessible: art == 'WC / Behinderten-WC',
            },
            geometry: feature.geometry,
          })
        }
      }
      return {
        type: 'FeatureCollection',
        features: features,
      }
    })
    .catch((err) => {
      throw err
    })
}

const registry = {
  LeipzigDe: () => {
    parseLeipzigDe().then((data) => {
      const grouped = groupByLoc(data)
      var index = 0
      const collected = []
      for (const value of grouped.values()) {
        collected.push(groupToJson({ id: index, grouped: value }))
        index++
      }
      const sorted = collected.sort((a, b) => a.name.localeCompare(b.name))
      fs.writeFile(
        'output-leipzigde.json',
        '[' +
        sorted.map((entry) => JSON.stringify(entry, null, 2)).join(',') +
        ']',
        (err) => {
          if (err) throw err
        }
      )
    })
  },
  LeipzigLeben: () => parseLeipzigLeben(),
  MarketsWmf: () => {
    parseJson('./markets_wmf.json').then((data) => {
      const csvContent = jsonToCsv(data)
      fs.writeFile('markets.csv', csvContent, (err) => {
        if (err) throw err
      })
      const geojson = jsonToGeojson(data)
      fs.writeFile('markets.geojson', geojson, (err) => {
        if (err) throw err
      })
    })
  },
  MarketsGeojsonToJson: () => {
    parseJson('./markets.geojson').then((data) => {
      const json = geojsonToJson(data)
      fs.writeFile('markets_wmf.json', JSON.stringify(json, null, 2), (err) => {
        if (err) throw err
      })
    })
  },
  InnerMarketsJson: () => {
    readInnerGeojson().then((data) => {
      const sorted = data.sort((a, b) => a.name.localeCompare(b.name))
      fs.writeFile(
        'output_inner.json',
        '[' +
        sorted.map((entry) => JSON.stringify(entry, null, 2)).join(',') +
        ']',
        (err) => {
          if (err) throw err
        }
      )
    })
  },
  InnerMarketsCsv: () => {
    parseJson('./output_inner.json').then((data) => {
      const csvContent = jsonToCsv(data)
      fs.writeFile('markets_inner.csv', csvContent, (err) => {
        if (err) throw err
      })
    })
  },
  InnerToilets: () => {
    readToiletsInner().then((data) => {
      fs.writeFile('toilets.geojson', JSON.stringify(data, null, 2), (err) => {
        if (err) throw err
      })
    })
  },
}

const keys = [
  'LeipzigDe',
  'LeipzigLeben',
  'MarketsWmf',
  'MarketsGeojsonToJson',
  'InnerMarketsJson',
  'InnerMarketsCsv',
  'InnerToilets',
]

const args = process.argv || ['MarketsWmf'];
keys.filter((f) => args.indexOf(f) > 0).forEach((key) => registry[key]())
