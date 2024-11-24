import { FC, ReactNode } from "react";
import { useCopyToClipboard } from "@lib/hooks/useCopyToClipboard";

import { SidebarHeader } from "@components/Sidebar/SidebarHeader";
import { SidebarBody } from "@components/Sidebar/SidebarBody";
import { MarketInfo } from "@components/MarketInfo";
import {
  Calendar,
  Clock,
  Copy,
  Euro,
  GeoMarker,
  Globe,
  Info,
} from "@components/Icons/";
import ical, { ICalCalendarMethod } from "ical-generator";

export interface SidebarMarketType {
  marketData: any;
}

export interface TimeExeptionType {
  hoursExc: string;
}

export const SidebarMarket: FC<SidebarMarketType> = ({ marketData }) => {
  const days = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const daysHelper = {
    Mo: "Montag",
    Di: "Dienstag",
    Mi: "Mittwoch",
    Do: "Donnerstag",
    Fr: "Freitag",
    Sa: "Samstag",
    So: "Sonntag",
  };

  const { copyToClipboard, hasCopied } = useCopyToClipboard();
  const hasImage = marketData.image;

  const TimeExeption: FC<TimeExeptionType> = ({ hoursExc }) => {
    return (
      <div className="text-sm italic pt-2 text-gray-500">
        <p>* Ausnahmen: {hoursExc}</p>
      </div>
    );
  };

  const getDepartureQueryUrl = () => {
    const now = new Date();
    const departureDate = `${now.getDate()}.${now.getMonth() + 1
      }.${now.getFullYear()}`;
    const departureTime = `${now.getHours()}:${now.getMinutes()}`;
    const journeyTarget = `${marketData.strasse}, ${marketData.plz_ort}`;
    return encodeURI(
      `https://www.insa.de/fahrplanauskunft/insa-fahrplanauskunft?scrollTo=webapp&start=1&P=TP&journeyProducts=1023&Z=${journeyTarget}&time=${departureTime}&date=${departureDate}&timeSel=depart`,
    );
  };

  const calendar = ical({ name: "my first iCal" });
  calendar.method(ICalCalendarMethod.REQUEST);

  const parseDate = (str: string) => {
    const segments = str.split(".");
    const year = Number(segments[2]);
    return new Date(
      (year < 100) ? Number(`20${year}`) : year,
      Number(segments[1]) - 1,
      Number(segments[0]),
    );
  };

  const allDatesBetween = (
    startDateStr: string,
    endDateStr: string,
  ): Date[] => {
    const dates = [];
    const dateMove = parseDate(startDateStr);
    const endDate = parseDate(endDateStr);
    while (dateMove <= endDate) {
      dates.push(new Date(dateMove));
      dateMove.setDate(dateMove.getDate() + 1);
    }
    return dates;
  };

  const allDates = allDatesBetween(
    marketData.von,
    marketData.bis || marketData.von,
  );
  const weekDayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  for (let date of allDates) {
    const day = weekDayNames[date.getDay()];
    const weekday = marketData[day];
    if (!weekday) break;
    const opening = marketData[day].split("-");
    if (opening.length < 2) break;
    const start = opening[0];
    const startTime = start.split(":");
    if (startTime.length < 2) break;
    date.setHours(startTime[0]);
    date.setMinutes(startTime[1]);
    const endDate = new Date(date);
    const end = opening[1];
    const endTime = end.split(":");
    if (endTime.length < 2) break;
    endDate.setHours(endTime[0]);
    endDate.setMinutes(endTime[1]);
    calendar.createEvent({
      start: date,
      end: endDate,
      summary: marketData.name,
      description: marketData.description,
      location: `${marketData.strasse}, ${marketData.plz_ort}`,
      url: marketData.w3,
    });
  }
  return (
    <>
      <SidebarHeader text={marketData.name} fontSize="text-lg" />
      <SidebarBody>
        <img
          className="bg-darkblue w-full h-[200px]"
          src={marketData.image === ""
            ? "./images/placeholder.png"
            : "./images/" + marketData.image}
          alt=""
        />

        <p className="text-xs text-gray-500 mt-1">
          <div
            dangerouslySetInnerHTML={{
              __html: marketData.urheberschaft
                ? marketData.urheberschaft
                : "freestocks.org, CC BY-SA 4.0 via Wikimedia Commons",
            }}
          />
        </p>
        <div className="mb-2"></div>

        <div className="flex flex-row-reverse">
          <div
            className="cursor-pointer xmas-btn px-4 py-1.5 border-gold text-gold hover:text-lightblue hover:bg-gold p-1 text-bold rounded border-2 hover:border-gold"
            onClick={() => copyToClipboard(`${window.location.href}`)}
          >
            {!hasCopied && (
              <div className="text-xs mr-4 mt-1 flex float-left">
                Markt-Link kopieren
              </div>
            )} {hasCopied && (
              <div className="text-xs mr-4 mt-1 flex float-left">
                Markt-Link kopiert!
              </div>
            )} <Copy />
          </div>
        </div>

        {marketData["rss_beschreibung"]?.length > 0 && (
          <MarketInfo title="Beschreibung" icon={<Info />}>
            <p className="text-sm">{marketData["rss_beschreibung"]}</p>
          </MarketInfo>
        )}

        {marketData["veranstalter"]?.length > 0 && (
          <MarketInfo title="Veranstalter" icon={<Info />}>
            <p className="text-sm">{marketData["veranstalter"]}</p>
          </MarketInfo>
        )}

        <MarketInfo
          title={marketData["closed-exc"] !== "0" ? "Datum *" : "Datum"}
          icon={<Calendar />}
        >
          <p className="text-sm pb-2">
            {marketData.von === marketData.bis && <span>{marketData.von}</span>}
            {marketData.von !== marketData.bis && (
              <span>
                {marketData.von} bis {marketData.bis}
              </span>
            )}
          </p>

          {marketData["closed-exc"] !== "0" && (
            <p className="text-sm italic pt-0 text-gray-500">
              * geschlossen: {marketData["closed-exc-readable"] ||
                (!!marketData["closed-exc"]
                  ? marketData["closed-exc"].split(",").map(
                    (c: string) => c.substring(0, 6),
                  )
                  : "").join(", ")}
            </p>
          )}
        </MarketInfo>

        <MarketInfo
          title={marketData["hours-exc-readable"] !== "0"
            ? "Öffnungszeiten *"
            : "Öffnungszeiten"}
          icon={<Clock />}
        >
          <ul className="columns-2 text-sm gap-0">
            <li className="font-bold pb-2">Wochentag</li>
            {days.map((day: string, i: number) => (
              <li key={"day" + i}>
                {daysHelper[day as keyof typeof daysHelper]}
              </li>
            ))}
            <li className="font-bold pb-2">Uhrzeit</li>
            {days.map((day: string, i: number) => (
              <li key={"time" + i}>
                {marketData[day] === "0" ? "-" : marketData[day]}
              </li>
            ))}
          </ul>

          {marketData["hours-exc-readable"] && (
            <TimeExeption hoursExc={marketData["hours-exc-readable"]} />
          )}

          {calendar.events.length > 0 && (
            <p className="mt-2">
              <a
                title={`Kalendereintrag ${marketData.name}`}
                download="event.ics"
                className="text-sm underline"
                target="_blank"
                href={`data:text/calendar,${calendar.toString()}`}
              >
                Termin exportieren
              </a>
            </p>
          )}
        </MarketInfo>

        <MarketInfo title="Eintritt" icon={<Euro />}>
          <p className="text-sm">
            {marketData["immer-kostenlos"] === "1"
              ? "Kostenlos"
              : "(Teilweise) Kostenpflichtig"}
          </p>
        </MarketInfo>

        <MarketInfo title="Anfahrt" icon={<GeoMarker />}>
          <p className="text-sm pb-1.5">
            {marketData.strasse}, {marketData.plz_ort}
          </p>
          <p className="text-sm">{marketData.train}</p>
          <p className="mt-2">
            <div
              className="text-sm underline cursor-pointer"
              onClick={() => window.open(getDepartureQueryUrl(), "_blank")}
            >
              Fahrplanauskunft
            </div>
          </p>
        </MarketInfo>

        {marketData.bemerkungen !== "" && (
          <MarketInfo title="Informationen" icon={<Info />}>
            <p className="text-sm">
              <div
                dangerouslySetInnerHTML={{ __html: marketData.bemerkungen }}
              />
            </p>
          </MarketInfo>
        )}

        {marketData.w3 !== "" && (
          <MarketInfo title="Webseite" icon={<Globe />}>
            <a
              className="text-sm underline"
              href={marketData.w3}
              target="_blank"
            >
              {(() => {
                const link = new URL(marketData.w3).hostname;
                return link.length < 60 ? link : link.substring(0, 60) + "...";
              })()}
            </a>
          </MarketInfo>
        )}

        <div className="mb-10"></div>
      </SidebarBody>
    </>
  );
};
