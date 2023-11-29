const cheerio = require('cheerio')
const fs = require('fs')

const getHtml = async (url) => {
    const res = await fetch(url)
    return res.text();
}


const scrape = async (content) => {
    const $ = cheerio.load(content)
    const events = $('.wp-block-heading')
    const markets = events.map(function () {
        const name = $(this).text();
        const desc = $(this).next()
        const descTextComplete = desc.text().trim();
        const whereSegments = descTextComplete.split("Wo? ")
        const descText = (whereSegments.length > 1) ? whereSegments[0] : descTextComplete;
        const description = descText.replace("Was? ", "");
        var nextSegment, location, when;
        if (whereSegments.length > 1) {
            nextSegment = desc;
            const whenSegments = whereSegments[1].split("Wann? ")
            location = whereSegments[0]
            if (whenSegments.length > 1) {
                when = whenSegments[1];
            }
        } else {
            nextSegment = desc.next();
        }
        if (!location) {
            location = nextSegment.text().replace("Wo? ", "")
            const whenSegments = location.split("Wann? ")
            if (whenSegments.length > 1) {
                location = whenSegments[0]
                when = whenSegments[1];
            }
            nextSegment = nextSegment.next();
        }
        if (!when) {
            when = nextSegment.text().replace("Wann? ", "")
            nextSegment = nextSegment.next();
        }
        const date = nextSegment.text();
        const w3c = nextSegment.next().find("a").first().attr("href")
        return {
            name,
            description,
            location,
            time: when,
            date,
            w3c
        }
    }).toArray();
    const configObj = {
        markets
    }
    fs.writeFileSync('./markets_leipzig_leben.json', JSON.stringify(configObj, null, 2), 'utf-8')
}


const content = fs.readFileSync("C:/Users/Joerg/Desktop/leipzig-leben.html", 'utf-8')
scrape(content)
