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
    const key = entry['Ort']
    const existing = map.get(key)
    if (existing) {
      existing.push(entry)
    } else {
      map.set(key, [entry])
    }
  })
  return map
}

const c1 = parseLeipzigDe()
const c2 = parseLeipzigLeben()
const c3 = parseMarketWmf()

c1.then((data) => console.log(groupByLoc(data)))

c3.then((data) => console.log(jsonToCsv(data)))
