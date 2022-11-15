import { FC } from 'react'
import classNames from 'classnames'
import { SidebarHeader } from '@components/Sidebar/SidebarHeader'
import { CitylabLogo } from '@components/Logos/CitylabLogo'
import { OdisLogo } from '@components/Logos/OdisLogo'
import { SenWebLogo } from '@components/Logos/SenWebLogo'
import { TsbLogo } from '@components/Logos/TsbLogo'

export interface SidebarContentInfoType {
  // marketData: any
}

export const SidebarContentInfo: FC<SidebarContentInfoType> = (
  {
    // marketData,
  }
) => {
  return (
    <>
      <SidebarHeader text="Über das Projekt" />

      <div className="px-4">
        <p className="text-sm pb-2">
          Für alle Glühweinverehrer:innen und Weihnachtsromantiker öffnen die
          ersten Weihnachtsmärkte bereits Ende Oktober. Bis Weihnachten ziehen
          dann die unterschiedlichsten Weihnachtsmärkte nach. Von traditionell
          bis international zeigt Berlin sein vielfältiges Angebot für
          Besucher:innen. Mit der Berliner Weihnachtsmarktkarte behaltet ihr
          stets den Überblick, an welchen Tagen und zu welchen Uhrzeiten die
          Weihnachtsmärkte offen haben. Entdeckt außerdem, welche
          Weihnachtsmärkte kostenlos sind und wo für euch spannende Attraktionen
          geboten sind. Falls ihr mal länger auf eure Begleitung warten müsst,
          könnt ihr dank offener Daten Sitzbänke unweit der Weihnachtsmärkte
          finden, genauso wie öffentliche Toiletten. Mit einem Klick über die
          Teilenfunktion könnt ihr euren neuen Lieblingsplatz mit anderen
          teilen.
        </p>
        <p className="text-sm pb-2">
          Diese Anwendung basiert komplett auf offenen Daten. Open Data ist
          heute ein wichtiger Bestandteil im Verwaltungshandeln Berlins und
          schafft nicht nur Transparenz und Offenheit, sondern ermöglicht auch
          Analysen und Anwendungen wie diese, um den Alltag angenehmer zu
          machen. Deshalb unterstützt und berät die{' '}
          <a
            target="blank"
            href="https://odis-berlin.de"
            className="text-gray-500 underline"
          >
            Open Data Informationsstelle{' '}
          </a>
          Berliner Behörden bei der Bereitstellung von Open Data. Mehr offene
          Daten findet ihr im{' '}
          <a
            target="blank"
            href="https://daten.berlin.de"
            className="text-gray-500 underline"
          >
            Berliner Datenportal
          </a>
          .
        </p>

        <section className="mt-4 flex flex-wrap">
          <div className="flex flex-col mr-6 mb-6">
            <span className="text-sm mb-2">Ein Projekt der</span>
            <TsbLogo className={`w-40`} />
          </div>
          <div className="flex flex-col mb-6">
            <span className="text-sm mb-2">Durchgeführt von der</span>
            <a
              href="https://odis-berlin.de/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Data Informationsstelle Berlin"
              // className={}
            >
              <OdisLogo className={`w-40`} />
            </a>
          </div>
          <div className="flex flex-col mb-6">
            <span className="text-sm mb-2">In Zusammenarbeit mit dem</span>
            <a
              href="https://www.citylab-berlin.org"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="CityLAB Berlin"
              // className={}
            >
              <CitylabLogo className={`w-36`} />
            </a>
          </div>
          <div className="flex flex-col">
            <span className="text-sm mb-2">Gefördert von</span>
            <SenWebLogo className={`w-40`} />
          </div>
        </section>
      </div>
      <footer className={classNames('mt-8 bg-gray-200 p-4', 'flex flex-wrap')}>
        <span className="text-xs w-full mb-4">
          © 2021 Technologiestiftung Berlin
        </span>
        <a
          href="https://www.technologiestiftung-berlin.de/de/impressum/"
          className={`text-xs hover:underline mr-4`}
          target="_blank"
          rel="noreferrer"
        >
          Impressum
        </a>
        <a
          href="https://www.technologiestiftung-berlin.de/de/datenschutz/"
          className={`text-xs hover:underline`}
          target="_blank"
          rel="noreferrer"
        >
          Datenschutzerklärung
        </a>
      </footer>
    </>
  )
}