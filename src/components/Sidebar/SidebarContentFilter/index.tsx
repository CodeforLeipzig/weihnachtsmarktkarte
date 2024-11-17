import { FC, useState } from "react";
import classNames from "classnames";
import ExpandablePanel from "@components/ExpandablePanel";
import { SwitchWrapper } from "@components/SwitchWrapper";
import { FilterDate } from "@components/FilterDate";
import { SidebarHeader } from "@components/Sidebar/SidebarHeader";
import { SidebarBody } from "@components/Sidebar/SidebarBody";
import { FullTextFilter, SearchCheckboxes } from "@components/SearchCheckbox";

export interface SidebarContentFilterType {
  marketsData: any;
  setMarketId: (d: string | null | number) => void;
  setMarketData: (d: any) => void;
  setZoomToCenter: (d: any) => void;
  setMapZoom: (d: any) => void;
  marketFilterInternational: boolean;
  setMarketFilterInternational: (enabled: boolean) => void;
  marketFilterAccessible: boolean;
  setMarketFilterAccessible: (enabled: boolean) => void;
  marketFilterCosts: boolean;
  setMarketFilterCosts: (enabled: boolean) => void;
  marketFilterDate: Date | undefined;
  setMarketFilterDate: (date: Date | undefined) => void;
  marketFilterTime: boolean;
  setMarketFilterTime: (time: boolean) => void;
  marketFilterAction: boolean;
  setMarketFilterAction: (enabled: boolean) => void;
  marketFilterTrain: boolean;
  setMarketFilterTrain: (enabled: boolean) => void;
  marketFilterFulltext: any;
  setMarketFilterFulltext: (data: FullTextFilter) => void;
}

export const SidebarContentFilter: FC<SidebarContentFilterType> = ({
  marketsData,
  setMarketId,
  setMarketData,
  setZoomToCenter,
  setMapZoom,
  marketFilterInternational,
  setMarketFilterInternational,
  marketFilterAccessible,
  setMarketFilterAccessible,
  marketFilterCosts,
  setMarketFilterCosts,
  marketFilterDate,
  setMarketFilterDate,
  marketFilterTime,
  setMarketFilterTime,
  marketFilterAction,
  setMarketFilterAction,
  marketFilterTrain,
  setMarketFilterTrain,
  marketFilterFulltext,
  setMarketFilterFulltext,
}) => {
  function resetFilter() {
    setMarketFilterCosts(false);
    setMarketFilterInternational(false);
    setMarketFilterAccessible(false);
    setMarketFilterDate(undefined);
    setMarketFilterTime(false);
    setMarketFilterAction(false);
    setMarketFilterTrain(false);
    setMarketFilterFulltext({
      searchInName: true,
      searchInDescription: true,
      searchInStreet: true,
      searchInDistrict: true,
      searchInCity: true,
      searchInOrganizer: true,
    });
  }

  function onMarketSelect(m: any) {
    setMarketId(m.id);
    setMarketData(m);
    setZoomToCenter([m.lng, m.lat]);
    setMapZoom(12);
  }

  function onMarketSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setMarketFilterFulltext({
      ...marketFilterFulltext,
      "filter": e.currentTarget.value,
    });
  }

  return (
    <>
      <SidebarHeader text="Weihnachtsmärkte entdecken" />

      <SidebarBody>
        <>
          <ExpandablePanel title={"Datum"} open={true}>
            <p className="text-sm pb-2 sm:pb-4">
              Wann möchtest du auf einen Weihnachtsmarkt gehen? Wähle einen
              Tag.{" "}
            </p>
            <div className="justify-center flex pb-2">
              <FilterDate
                marketFilterDate={marketFilterDate}
                setMarketFilterDate={setMarketFilterDate}
              />
            </div>
          </ExpandablePanel>
          <hr className="my-2 border-lightblue/70" />
          <ExpandablePanel title={"Abends offen"} open={true}>
            <SwitchWrapper
              text={"Appetit auf gebrannte Mandeln zum Feierabend? Zeige Märkte die nach 19 Uhr offen haben."}
              enabled={marketFilterTime}
              setEnabled={setMarketFilterTime}
            />
          </ExpandablePanel>
          <hr className="my-2 border-lightblue/70" />
          <ExpandablePanel title={"Eintritt frei"} open={true}>
            <SwitchWrapper
              text={"Keine Lust auf Eintritt zahlen? Zeige Märkte, die immer kostenfrei sind."}
              enabled={marketFilterCosts}
              setEnabled={setMarketFilterCosts}
            />
          </ExpandablePanel>
          <hr className="my-2 border-lightblue/70" />
          <ExpandablePanel title={"Themen-Märkte"} open={true}>
            <SwitchWrapper
              text={"Du magst es speziell? Zeige Märkte mit historischem, internationalem oder ökologischem Fokus."}
              enabled={marketFilterInternational}
              setEnabled={setMarketFilterInternational}
            />
          </ExpandablePanel>
          <hr className="my-2 border-lightblue/70" />
          <ExpandablePanel title={"Barrierefrei"} open={true}>
            <SwitchWrapper
              text={"Zeige Märkte an, die barrierefrei sind."}
              enabled={marketFilterAccessible}
              setEnabled={setMarketFilterAccessible}
            />
          </ExpandablePanel>
          <hr className="my-2 border-lightblue/70" />
          <ExpandablePanel title={"Action bitte"} open={true}>
            <SwitchWrapper
              text={"Nur Glühwein trinken ist dir zu langweilig? Zeige Märkte mit besonderen Attraktionen."}
              enabled={marketFilterAction}
              setEnabled={setMarketFilterAction}
            />
          </ExpandablePanel>
          <hr className="my-2 border-lightblue/70" />
          <ExpandablePanel title={"Kurze Wege"} open={true}>
            <SwitchWrapper
              text={"Mit den Öffis unterwegs? Zeige Märkte mit kurzen Wegen zu S-Bahn- oder Straßenbahnstationen."}
              enabled={marketFilterTrain}
              setEnabled={setMarketFilterTrain}
            />
          </ExpandablePanel>
          <hr className="my-2 border-lightblue/70" />
          <ExpandablePanel title={"Volltextsuche"} open={true}>
            <div className="justify-left flex pb-2">
              <input
                type="text"
                style={{ background: "black" }}
                value={(marketFilterFulltext && marketFilterFulltext.filter) ||
                  ""}
                onInput={onMarketSearch}
              />
            </div>
            <div style={{ paddingBottom: "5px" }}>Suche in:</div>
            <SearchCheckboxes
              marketFilterFulltext={marketFilterFulltext}
              setMarketFilterFulltext={setMarketFilterFulltext}
            />
          </ExpandablePanel>
          <ExpandablePanel title={"Gefundene Märkte"} open={true}>
            <ul>
              {marketsData
                .sort((a: any, b: any) =>
                  a.shortname.localeCompare(b.shortname)
                )
                .filter((market: any) => !market.hideFeature && !market.inaktiv)
                .map((market: any) => (
                  <li key={market.id.toString()} className="px-4">
                    <p
                      className="pl-3 pr-8 py-2 hover:bg-gold hover:text-white text-sm  flex-1 cursor-pointer"
                      title={market.shortname}
                      onClick={() =>
                        onMarketSelect(market)}
                    >
                      {" "}
                      {market.shortname}
                    </p>
                    <hr className=" border-lightblue/70"></hr>
                  </li>
                ))}
            </ul>
          </ExpandablePanel>

          <div className="mt-8"></div>

          {(marketFilterTrain ||
            marketFilterAction ||
            marketFilterInternational ||
            marketFilterAccessible ||
            marketFilterCosts ||
            marketFilterTime ||
            marketFilterDate ||
            (marketFilterFulltext && marketFilterFulltext.filter &&
              marketFilterFulltext.filter.length > 0)) && (
            <button
              className="block mr-auto ml-auto sticky bottom-4 mb-8 xmas-btn px-4 bg-darkblue text-gold hover:bg-gold hover:text-lightblue p-2 text-bold rounded border-2 border-gold hover:border-gold"
              onClick={resetFilter}
            >
              Filter zurücksetzen
            </button>
          )}
        </>
      </SidebarBody>
    </>
  );
};
