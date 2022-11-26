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

const parseMarketWmf = async () => {
  return readFileAsPromise('./markets_wmf.json')
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
    bezirk: null,
    name: group.Name,
    shortname: group.Name,
    strasse: null,
    plz_ort: null,
    von: from || group.Von,
    bis: to || group.Von,
    veranstalter: group.Ort,
    oeffnungszeiten: group.Zeit?.replace(': ', ':').replace(' - ', '-'),
    email: null,
    w3: null,
    bemerkungen: null,
    lat: null,
    lng: null,
    'RSS-Titel': group.Name,
    'RSS-Beschreibung': group.Beschreibung || null,
    'immer-kostenlos': 1,
    Mo: 0,
    Di: 0,
    Mi: 0,
    Do: 0,
    Fr: 0,
    Sa: 0,
    So: 0,
    'closed-exc': null,
    'hours-exc': null,
    ignore: null,
    merged: null,
    international: 0,
    action: 0,
    image: null,
    urheberschaft: null,
    train: null,
    train_distance: null,
    short_distance: 0,
  }
  for (gr of grouped) {
    const date = getDate(gr.Von)
    const weekDay = getWeekDay(date)
    json[weekDay] = group.Zeit?.replace(': ', ':').replace(' - ', '-')
  }
  return json
}

const c1 = parseLeipzigDe()
const c2 = parseLeipzigLeben()
const c3 = parseMarketWmf()

c1.then((data) => {
  const grouped = groupByLoc(data)
  var index = 0
  const collected = []
  for (const value of grouped.values()) {
    collected.push(groupToJson({ id: index, grouped: value }))
    index++
  }
  const sorted = collected.sort((a, b) => a.name.localeCompare(b.name))
  fs.writeFile(
    'output.json',
    '[' + sorted.map((entry) => JSON.stringify(entry, null, 2)).join(',') + ']',
    (err) => {
      if (err) throw err
    }
  )
})

c3.then((data) => {
  const csvContent = jsonToCsv(data)
  fs.writeFile('markets.csv', csvContent, (err) => {
    if (err) throw err
  })
})
