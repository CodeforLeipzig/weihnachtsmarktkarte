const fs = require('fs')
const path = require('path')
const Papa = require('papaparse')
const ical = require('ical-generator')

const xmarketsPathCSV = path.join(process.cwd(), 'public/markets.csv')
const xmarketsCSV = fs.readFileSync(xmarketsPathCSV, 'utf-8')
var data = Papa.parse(xmarketsCSV, { header: true }).data.filter(
  (d) => d.lat && d.lng && d.ignore !== '1'
)
const allowedIds = []
data.forEach((element, i) => {
  allowedIds.push(Number(element.id))
  element.lng = Number(element.lng.replace(',', '.'))
  element.lat = Number(element.lat.replace(',', '.'))
  element.inaktiv = false
  element.hideFeature = false
})

const parseDate = (str) => {
  const segments = str.split('.')
  const year = Number(segments[2])
  return new Date(
    year < 100 ? Number(`20${year}`) : year,
    Number(segments[1]) - 1,
    Number(segments[0])
  )
}

for (let marketData of data) {
  const calendar = new ical.ICalCalendar({ name: marketData.name })
  calendar.method(ical.ICalCalendarMethod.REQUEST)
  const allDatesBetween = (startDateStr, endDateStr) => {
    const dates = []
    const dateMove = parseDate(startDateStr)
    const endDate = parseDate(endDateStr)
    while (dateMove <= endDate) {
      dates.push(new Date(dateMove))
      dateMove.setDate(dateMove.getDate() + 1)
    }
    return dates
  }

  const allDates = allDatesBetween(
    marketData.von,
    marketData.bis || marketData.von
  )
  const weekDayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
  var seq = 0
  for (let date of allDates) {
    const day = weekDayNames[date.getDay()]
    const weekday = marketData[day]
    if (!weekday) break
    const opening = marketData[day].split('-')
    if (opening.length < 2) break
    const start = opening[0]
    const startTime = start.split(':')
    if (startTime.length < 2) break
    date.setHours(startTime[0])
    date.setMinutes(startTime[1])
    const endDate = new Date(date)
    const end = opening[1]
    const endTime = end.split(':')
    if (endTime.length < 2) break
    endDate.setHours(endTime[0])
    endDate.setMinutes(endTime[1])
    calendar.createEvent({
      sequence: seq++,
      start: date,
      end: endDate,
      summary: marketData.name,
      description: marketData.description,
      location: `${marketData.strasse}, ${marketData.plz_ort}`,
      url: marketData.w3,
    })
    const calStr = calendar.toString()
    fs.writeFileSync(`public/ics/${marketData.id}.ics`, calStr, 'utf-8')
  }
}
