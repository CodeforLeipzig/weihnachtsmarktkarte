import { FC } from 'react'
import classNames from 'classnames'
import { SidebarHeader } from '@components/Sidebar/SidebarHeader'
import { SidebarBody } from '@components/Sidebar/SidebarBody'

import { CitylabLogo } from '@components/Logos/CitylabLogo'
import { OdisLogo } from '@components/Logos/OdisLogo'
import { TsbLogo } from '@components/Logos/TsbLogo'
import { Accordion } from '@components/Accordion'
import { SenInLogo } from '@components/Logos/SenInLogo'

export interface SidebarContentInfoType { }

export const SidebarContentInfo: FC<SidebarContentInfoType> = ({ }) => {
  return (
    <>
      <SidebarHeader text="Über den Finder" />

      <SidebarBody>
        <p className="text-sm pt-2 pb-2">
          Von klassisch über kiezig bis krawallig: Bei den Leipziger
          Weihnachtsmärkten ist für jeden Geschmack etwas dabei. Einige der über 60 Weihnachtsmärkte sind dabei nur für wenige Tage geöffnet. Mit dem
          Leipziger Weihnachtsmarkt-Finder behältst du stets den Überblick, an
          welchen Tagen und zu welchen Uhrzeiten welche Weihnachtsmärkte zu
          einem Besuch einladen. Entdecke außerdem, welche Weihnachtsmärkte
          kostenlos sind, wo es spannende Attraktionen und Programm zu erleben gibt und mehr. Zoom in die Karte rein, um Haltestationen zu öffentlichen Verkehrsmitteln und Standorte von nahegelegenen öffentlichen Toiletten zu sehen. Mit einem Klick über die Teilen-Funktion kannst du den Link zu deinem Lieblingsweihnachtsmarkt kopieren und an Freund:innen verschicken.
        </p>

        <Accordion items={[{
          id: '1', title: 'Woher kommen die Daten?', content:
            <>
              <p className="text-sm pb-2">
                Diese Anwendung basiert komplett auf offenen Daten.
                Die gezeigten Weihnachtsmärkte stammen aus dem Datensatz{' '}
                <a
                  target="blank"
                  href="https://www.leipzig.de/freizeit-kultur-und-tourismus/veranstaltungen-und-termine/weihnachten/weihnachtsmaerkte/"
                  className="text-gold"
                >
                  Leipziger Weihnachtsmärkte 2022 von Leipzig.de{' '}
                </a> sowie{' '}
                <a
                  target="blank"
                  href="https://www.leipzig-leben.de/weihnachtsmaerkte-leipzig-2022/"
                  className="text-gold"
                >
                  Leipziger Weihnachtsmärkte 2022 vom Blog Leipzig-Leben.de{' '}
                </a>. Es besteht kein Anspruch auf Vollständigkeit.
                Weihnachtsmärkte die unter 400m Luftlinie entfernt zu Haltestellen liegen
                werden entsprechend bei der Filterung “Kurze Wege” ausgegeben. Die verarbeiteten Daten und die Skripte zur
                Datenprozessierung sind in{' '}
                <a
                  target="blank"
                  href="https://github.com/codeforleipzig/weihnachtsmarktkarte"
                  className="text-gold"
                >
                  GitHub-Repository{' '}
                </a>zu finden. Die Hintergrundkarte basiert auf der{' '}
                <a
                  target="blank"
                  href="https://www.openstreetmap.de"
                  className="text-gold"
                >
                  OpenStreetMap{' '}
                </a>.
              </p>
            </>
        }]} />

        <Accordion items={[{
          id: '2', title: 'Was ist Open Data?', content:
            <>
              <p className="text-sm pb-2">
                Offene Daten definieren sich dadurch, dass sie in einem offenen und maschinenlesbaren Format vorliegen,
                unter einer freien Lizenz nutzbar sind, der Zugang diskriminierungsfrei und kostenlos ist und die Daten
                an einem zentralen Ort dauerhaft auffindbar sind. Open Data ist heute ein wichtiger Bestandteil im Verwaltungshandeln
                Leipzigs und schafft nicht nur Transparenz und Offenheit, sondern ermöglicht auch Analysen und Anwendungen wie
                diese, um den Alltag angenehmer zu machen. Mehr offene Daten findest du im{' '}
                <a
                  target="blank"
                  href="https://opendata.leipzig.de"
                  className="text-gold"
                >
                  Leipziger OpenData-Portal
                </a>.
              </p>
            </>
        }]} />

        <Accordion items={[{
          id: '3', title: 'Wie kann ich mitmachen?', content:
            <>
              <p className="text-sm pb-2">
                Du möchtest aktiv werden und dazu beitragen, dass der Weihnachtsmarkt-Finder im besten Glanz erscheint?
                Der Code ist{' '}
                <a
                  target="blank"
                  href="https://github.com/codeforleipzig/weihnachtsmarktkarte"
                  className="text-gold"
                >
                  Open Source {' '}
                </a>und jede:r kann nutzen. So kannst du das Projekt duplizieren und selbst weiterentwickeln oder du machst direkt Vorschläge für Verbesserungen und neue Funktionen.
                Sicher ist dir auch aufgefallen, dass viele Weihnachtsmärkte lediglich ein Platzhalter-Bild haben.
                Dies liegt daran, dass wir nur auf Bilder zurückgreifen wollen, die in Wikimedia Commons liegen,
                dem zentralen und offenen Medienarchiv. Also knips ein Bild von deinem nächsten Weihnachtsmarktbesuch
                und veröffentliche es unter einer freien Lizenz auf{' '}
                <a
                  target="blank"
                  href="https://commons.wikimedia.org/wiki/Commons:First_steps/Uploading_files/de"
                  className="text-gold"
                >
                  Wikimedia
                </a>!
              </p>
            </>
        }]} />

        <Accordion items={[{
          id: '4', title: 'Was ist mit anderen Städten?', content:
            <>
              <p className="text-sm pb-2">
                Der “Leipziger Weihnachtsmarkt-Finder” ist ein Open-Source-Projekt und läuft unter einer MIT Lizenz.
                Dementsprechend kann die Idee, aber auch der Quellcode für die Umsetzung in anderen Städten kostenlos genutzt, angepasst
                und weiterentwickelt werden. Wenn Du dich dafür interessierst, schau gerne in unserem{' '}
                <a
                  target="blank"
                  href="https://github.com/codeforleipzig/weihnachtsmarktkarte"
                  className="text-gold"
                >
                  GitHub-Repository{' '}
                </a>vorbei.
              </p>
            </>
        }]} />

        <Accordion items={[{
          id: '5', title: 'Über uns',
          content:
            <>
              <p className="text-sm pb-2">
                Der “Leipziger Weihnachtsmarkt-Finder” wurde vom{' '}
                <a
                  target="blank"
                  href="https://www.codefor.de/leipzig"
                  className="text-gold"
                >
                  OKLab Leipzig{' '}
                </a> abgeleitet vom <a
                  target="blank"
                  href="https://www.codefor.de/leipzig"
                  className="text-gold"
                >
                  Berliner Weihnachtsmarkt-Finder{' '}
                </a>, welcher ein Projekt der{' '}
                <a
                  target="blank"
                  href="https://odis-berlin.de"
                  className="text-gold"
                >
                  Open Data Informationsstelle{' '}
                </a> ist, entstanden in Zusammenarbeit mit dem CityLAB Berlin. Die ODIS wird von der Berliner Senatsverwaltung für Inneres,
                Digitalisierung und Sport und der Investitionsbank Berlin aus den Mitteln des Landes Berlin gefördert und
                ist ein Projekt der{' '}
                <a
                  target="blank"
                  href="https://www.technologiestiftung-berlin.de"
                  className="text-gold"
                >
                  Technologiestiftung Berlin
                </a>. Seit 2018 begleiten wir als ODIS die Stadt auf dem Weg zu einer partizipativen, nachhaltigen und
                datengetriebenen Gesellschaft mit dem Schwerpunkt auf die Bereitstellung und Nutzung offener Daten.
                Du hast Feedback oder willst mehr erfahren? Schau dich auf unserer Webseite um oder kontaktiere uns unter{' '}
                <a href="mailto:leipzig@codefor.de"
                  className="text-gold"
                >leipzig@codefor.de</a>.
              </p>
            </>
        }]} />

        <Accordion items={[{
          id: '2', title: `I don’t speak German: What's going on here?`, content:
            <>
              <p className="text-sm pb-2">
                The Leipzig Christmas Market Finder shows all of Leipzig’s Christmas markets embedded in an
                interactive map of the city. You can filter the markets by date and attributes like free entry,
                themed markets with special attractions or proximity to public transport. Once you have found
                a Christmas market, you can also share it with your friends and colleagues.
                Based itself on open data, this application demonstrates the importance and usefulness of opening
                the data held by Leipzig’s public administration. Beyond creating transparency and openness,
                it allows users to explore the city and come together to spread the Christmas cheer! You can find more open data in the{' '}
                <a
                  target="blank"
                  href="https://opendata.leipzig.de"
                  className="text-gold"
                >
                  Leipzig Open Data Portal
                </a>. Feel free to contact us{' '}
                <a href="mailto:leipzig@codefor.de"
                  className="text-gold"
                >leipzig@codefor.de</a>.
              </p>
            </>
        }]} />

        <section className="mt-6 flex flex-wrap">
          <div className="flex flex-col mr-6 mb-6">
            <span className="text-sm mb-3">Ein Projekt der</span>
            <TsbLogo className={`w-30`} />
          </div>
          <div className="flex flex-col mb-2">
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
          {/* <div className="flex flex-col mb-6">
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
          </div> */}
        </section>        
      </SidebarBody>

      <footer className={classNames('mt-8 p-4', 'flex flex-wrap')}>
        <span className="text-xs w-full mb-4">
          © 2022 Technologiestiftung Berlin
        </span>
        <a
          href="https://codefor.de/impressum/"
          className={`text-xs hover:underline mr-4`}
          target="_blank"
          rel="noreferrer"
        >
          Impressum
        </a>
        <a
          href="https://codefor.de/datenschutz/"
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
