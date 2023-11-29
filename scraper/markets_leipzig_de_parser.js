const cheerio = require('cheerio')
const fs = require('fs')

const getHtml = async (url) => {
    const res = await fetch(url)
    return res.text();
}

const handleDetails = (content) => {
    const adaptedContent = content.substring(content.indexOf("<body"), content.length);
    const $ = cheerio.load("<html>" + adaptedContent)
    const table = $('.cal_meta_singleview');
    const ical = $('.cal_export_singleview > div > a').first();
    const otherDateSection = $('#eventdetail-additionaldates-accordeon');
    const otherDates = otherDateSection.map(function () {
        return $(this).find("a").map(function () {
            return {
                "date": $(this).text().trim(),
                "link": "https://www.leipzig.de" + $(this).attr('href')
            }
        }).toArray()
    }).toArray()
    const locationSection = $('.cal_location_singleview').first()
    const address = locationSection.find('.cal_address_location').text().trim().split(' 04');
    const street = address[0];
    const zipcode = address[1] && ('04' + address[1].split(' ')[0]);
    const city = address[1] && (address[1].split(' ')[1]);

    return {
        date: table.find('.date').first().text().trim().replace('Datum ', ''),
        time: table.find('.time').first().text().trim().replace('Uhrzeit ', ''),
        location: table.find('.location').first().text().trim().replace('Veranstaltungsort ', ''),
        ical: "https://www.leipzig.de" + ical.attr('href'),
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

    const config = events.map(function () {
        const eventDate = $(this).find('.event-date').first().text().trim().split(' ');
        return {
            url: "https://www.leipzig.de" + $(this).attr('href').trim(),
            from: eventDate[0].trim(),
            to: eventDate[2]?.trim(),
            location: $(this).find('.events_meta > strong').first().text().trim(),
            summary: $(this).find('.summary > h3').first().text().trim(),
            description: $(this).find('.description_teaser').first().text().trim()
        }
    }).toArray();

    Promise.all(config.map(async c => {
        const details = await getHtml(c.url).then(c => handleDetails(c));
        return {
            ...c,
            details
        }
    })).then(c => {
        const configObj = {
            markets: c
        }
        fs.writeFileSync('./markets_leipzig_de.json', JSON.stringify(configObj, null, 2), 'utf-8')
    });
}

const getUniqueLocations = () => {
    const config = require('./markets_leipzig_de.json').markets.map(m => m.details.location)

    const groupBy = (data, keyFun, valueFun) =>
        data.reduce((acc, curr) => {
            const key = keyFun(curr);
            const value = valueFun(curr);
            const valueList = acc[key] || [];
            if (valueList.filter(v => v.properties.name == value.name).length == 0) {
                valueList.push(value);
            }
            acc[key] = valueList;
            return acc;
        }, {});

    const keyFun = l => l.city + "__" + l.zipcode + '__' + l.street;
    const valueFun = l => ({
        type: 'feature',
        properties: {
            name: l.name,
            street: l.street,
            zipcode: l.zipcode,
            city: l.city,
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                12,
                51
            ]
        }
    });

    const locs = groupBy(config, keyFun, valueFun);
    const sortedKeys = Object.keys(locs).sort();
    sortedKeys.forEach(element => {
        console.log(locs[element][0])
    });
}

getHtml("https://www.leipzig.de/freizeit-kultur-und-tourismus/veranstaltungen-und-termine/weihnachten/weihnachtsmaerkte/").then(
    content => scrape(content)
)
getUniqueLocations();