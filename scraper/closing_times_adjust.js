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

    const from = parseDate(fromStr);
    const to = parseDate(toStr);
    console.log(feature.properties.name);
    //console.log("from " + fromStr + ": " + from);
    //console.log("to " + toStr + ": " + to);
    const weekday = resolveWeekday(from);
    //console.log(weekday);
    
    if (fromStr === toStr) {
      const weekdayAccs = [sunday, monday, tuesday, wednesday, thursday, friday, saturday];
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
      if (!!feature["closed-exc"]) {
        console.log("** ERROR: closed-exc " + feature["closed-exc"] + " should be null");
      }
      if (!!feature["closed-exc-readable"]) {
        console.log("** ERROR: closed-exc-readable " + feature["closed-exc-readable"] + " should be null");
      }
      if (!!feature["hours-exc"]) {
        console.log("** ERROR: hours-exc " + feature["hours-exc"] + " should be 0");
      }
      if (!!feature["hours-exc-readable"]) {
        console.log("** ERROR: hours-exc-readable " + feature["hours-exc-readable"] + " should be null");
      }
    } else {
      if (from.getTime() > to.getTime()) {
        console.log("** ERROR: from " + from + "should be before " + toStr);
      }
    }
  });
});

const parseDate = (str) => {
    const parts = str.split(".");
    const formattedDate = ("20" + parts[2]) + "-" + parts[1] + "-" + parts[0];
    return new Date(Date.parse(formattedDate));
}

const resolveWeekday = (date) => {
    const dayOfWeek = date.getDay();   
    return !isNaN(dayOfWeek) && weekdays[dayOfWeek];
}