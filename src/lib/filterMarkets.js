const daysHelper = {
  1: 'Mo',
  2: 'Di',
  3: 'Mi',
  4: 'Do',
  5: 'Fr',
  6: 'Sa',
  0: 'So',
}

function toDate(string) {
  const dateArray = string.trim().split('.')
  const newString =
    '20' + dateArray[2] + '-' + dateArray[1] + '-' + dateArray[0] + 'T00:00:00'
  return new Date(newString)
}

function checkOpenOnDay(date, d) {
  if (d[daysHelper[date.getDay()]] === '0') {
    return false
  } else {
    return true
  }
}

function isBeforeDate(todayOrSelected, dateStr) {
  if (todayOrSelected) {
    todayOrSelected.setHours(0, 0, 0, 0);
  }
  return (
    todayOrSelected &&
    dateStr &&
    toDate(dateStr.trim()).getTime() < todayOrSelected.getTime()
  )
}

function openOnDate(date, d) {
  //check for exceptions
  if (d['closed-exc'] !== '0') {
    const exeptions = d['closed-exc'].split(',')
    let isExeption = false
    exeptions.forEach((e) => {
      if (e === '') {
        isExeption = false
        return
      }
      if (toDate(e.trim()).toISOString() === date.toISOString()) {
        isExeption = true
      }
    })
    if (isExeption) {
      return false
    }
  }

  if (d['hours-exc'] !== '0') {
    let open = false
    d['hours-exc'].split(',').forEach((dt) => {
      const dateAndTime = dt.trim().split('=')
      if (toDate(dateAndTime[0]).toISOString() === date.toISOString()) {
        open = true
      }
    })
    if (open) {
      return true
    }
  }

  if (!checkOpenOnDay(date, d)) {
    return false
  }

  // check von bis
  if (date >= toDate(d.von) && date <= toDate(d.bis)) {
    return true
  }

  return false
}

function lastHour(timeString) {
  return timeString.split('-')[1].split(':')[0]
}

function openLate(d, date) {
  let openLate = false
  const late = 19
  if (!date) {
    Object.values(daysHelper).forEach((day) => {
      if (d[day] !== '0') {
        if (lastHour(d[day]) > late) {
          openLate = true
        }
      }
    })
    return openLate
  } else {
    const openingTimeOnDay = d[daysHelper[date.getDay()]]
    if (openingTimeOnDay === '0') {
      openLate = false
    } else {
      openLate = lastHour(openingTimeOnDay) > late
    }
    if (d['hours-exc'] !== '0') {
      d['hours-exc'].split(',').forEach((dt) => {
        const dateAndTime = dt.trim().split('=')
        if (toDate(dateAndTime[0]).toISOString() === date.toISOString()) {
          openLate = lastHour(dateAndTime[1]) > late
        }
      })
    }

    return openLate
  }
}

export function filterMarkets(
  data,
  todayOrSelected,
  marketFilterInternational,
  marketFilterAccessible,
  marketFilterCosts,
  marketFilterDate,
  marketFilterAction,
  marketFilterTrain,
  marketFilterTime,
  marketFilterFulltext,
) {
  data.forEach((d) => {
    d.inaktiv = false
    d.hideFeature = false
    if (isBeforeDate(todayOrSelected, d['bis'])) {
      d.hideFeature = true
      return
    }
    if (marketFilterCosts && d['immer-kostenlos'] === '0') {
      d.inaktiv = true
      return
    }
    if (marketFilterAccessible && d['barrierefrei'] === '0') {
      d.inaktiv = true
      return
    }
    if (marketFilterInternational && d['international'] === '0') {
      d.inaktiv = true
      return
    }
    if (marketFilterAction && d['action'] === '0') {
      d.inaktiv = true
      return
    }
    if (marketFilterTrain && d['short_distance'] === '0') {
      d.inaktiv = true
      return
    }
    if (marketFilterDate && !openOnDate(marketFilterDate, d)) {
      d.inaktiv = true
      return
    }
    if (marketFilterTime && !openLate(d, marketFilterDate)) {
      d.inaktiv = true
      return
    }
    if (marketFilterFulltext && marketFilterFulltext.filter) {
      const filterLower = marketFilterFulltext.filter.toLowerCase();
      const checks = [
        (text) => marketFilterFulltext.searchInName && (d.name.toLowerCase().indexOf(text) >= 0 || d.shortname.toLowerCase().indexOf(text) >= 0),
        (text) => marketFilterFulltext.searchInDescription && d.rss_beschreibung && d.rss_beschreibung.toLowerCase().indexOf(text) >= 0,
        (text) => marketFilterFulltext.searchInStreet && d.strasse && d.strasse.toLowerCase().indexOf(text) >= 0,
        (text) => marketFilterFulltext.searchInDistrict && d.bezirk && d.bezirk.toLowerCase().indexOf(text) >= 0,
        (text) => marketFilterFulltext.searchInCity && d.plz_ort && d.plz_ort.toLowerCase().indexOf(text) >= 0,
        (text) => marketFilterFulltext.searchInOrganizer && d.veranstalter && d.veranstalter.toLowerCase().indexOf(text) >= 0,
      ]
      const found = checks.map((check) => check(filterLower)).filter(res => res);
      if (found.length === 0) {
        d.inaktiv = true
      }
      return
    }
  })

  return data
}
