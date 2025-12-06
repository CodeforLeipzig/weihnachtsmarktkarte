fs = require("fs");

const readFileAsPromise = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const parseJson = async (jsonFile) => {
  return readFileAsPromise(jsonFile)
    .then((data) => {
      return JSON.parse(data);
    })
    .catch((err) => {
      throw err;
    });
};

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

parseJson("./markets.geojson").then((data) => {
  data.features.forEach(feature => {
    const fromStr = feature.properties.von;
    const toStr = feature.properties.bis;
    const generalOpen = feature.properties.oeffnungszeiten;
    const monday = feature.properties.Mo;
    const tuesday = feature.properties.Di;
    const wednesday = feature.properties.Mi;
    const thursday = feature.properties.Do;
    const friday = feature.properties.Fr;
    const saturday = feature.properties.Sa;
    const sunday = feature.properties.So;
    const weekdayAccs = [sunday, monday, tuesday, wednesday, thursday, friday, saturday];

    const closedExc = feature.properties["closed-exc"];
    const closedExcReadable = feature.properties["closed-exc-readable"];
    const hoursExc = feature.properties["hours-exc"];
    const hoursExcReadable = feature.properties["hours-exc-readable"];

    const from = parseDate(fromStr);
    const to = parseDate(toStr);
    console.log(feature.properties.name);
    //console.log("from " + fromStr + ": " + from);
    //console.log("to " + toStr + ": " + to);
    const weekday = resolveWeekday(from);
    //console.log(weekday);
    
    if (fromStr === toStr) {
      const weekdayIndex = weekdays.indexOf(weekday);
      for (var i=0; i<weekdays.length; i++) {
        if (i !== weekdayIndex) {
          if (weekdayAccs[i] !== 0) {
            console.log("** ERROR: weekday " + weekdays[i] + " should be 0");
          }
        } else {
          if (weekdayAccs[i] === 0) {
            console.log("** ERROR: weekday " + weekdays[i] + " should not be 0");
          } else if (weekdayAccs[i] !== generalOpen) {
            console.log("** ERROR: oeffnungszeiten " + generalOpen + " should match weekdays " + weekdayAccs[i]);
          }
        }
      }
      if (!!closedExc) {
        console.log("** ERROR: closed-exc " + closedExc + " should be 0");
      }
      if (!!closedExcReadable) {
        console.log("** ERROR: closed-exc-readable " + closedExcReadable + " should be null");
      }
      if (!!hoursExc) {
        console.log("** ERROR: hours-exc " + hoursExc + " should be 0");
      }
      if (!!hoursExcReadable) {
        console.log("** ERROR: hours-exc-readable " + hoursExcReadable + " should be null");
      }
    } else {
      if (from.getTime() > to.getTime()) {
        console.log("** ERROR: from " + from + "should be before " + toStr);
      }
      const closingDays = [];
      const closingHours = [];
      for (var i=1; i<90; i++) {
        const next = new Date(from.getTime());
        next.setDate(from.getDate() + i);
        if (next.getTime() > to.getTime()) {
          break;
        }
        const weekdayAcc = weekdayAccs[next.getDay()];
        if (weekdayAcc === 0) {
          const nextStr = formatDate(next);
          closingDays.push(nextStr);
        }
      }
      for (var i=0; i<90; i++) {
        const next = new Date(from.getTime());
        next.setDate(from.getDate() + i);
        if (next.getTime() > to.getTime()) {
          break;
        }
        const weekdayAcc = weekdayAccs[next.getDay()];
        if (weekdayAcc !== 0 && weekdayAcc !== generalOpen) {
          const nextStr = formatDate(next);
          closingHours.push(nextStr + "=" + weekdayAcc);
        }
      }
      const expectedClosingDays = closingDays.length ? closingDays.join(",") : 0; 
      if (expectedClosingDays !== closedExc) {
        console.log("** ERROR: closed-exc " + closedExc + " should match expected " + expectedClosingDays);
      }
      const expectedClosingHours = closingHours.length ? closingHours.join(",") : 0; 
      if (expectedClosingHours !== hoursExc) {
        console.log("** ERROR: hours-exc " + hoursExc + " should match expected " + expectedClosingHours);
      }
    }
  });
});

const parseDate = (str) => {
    const parts = str.split(".");
    const formattedDate = ("20" + parts[2]) + "-" + parts[1] + "-" + parts[0];
    return new Date(Date.parse(formattedDate));
}

const formatDate = (date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const twoDigits = (val) => (val < 10 ? ("0" + val) : val);
  return twoDigits(day) + "." + twoDigits(month) + "." + (date.getFullYear()-2000);
}

const resolveWeekday = (date) => {
    const dayOfWeek = date.getDay();   
    return !isNaN(dayOfWeek) && weekdays[dayOfWeek];
}