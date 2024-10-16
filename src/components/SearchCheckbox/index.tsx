import { FC } from 'react'

export interface FullTextFilter {
  filter?: string;
  searchInName?: boolean;
  searchInDescription?: boolean;
  searchInStreet?: boolean;
  searchInDistrict?: boolean;
  searchInCity?: boolean;
  searchInOrganizer?: boolean;
}

export interface SearchCheckboxesType {
  index?: number,
  selectedFields?: string[];
  marketFilterFulltext: FullTextFilter;
  setMarketFilterFulltext: (data: FullTextFilter) => void;
}

export interface SearchCheckboxType {
  index: string;
  field: string;
  label: string;
  marketFilterFulltext: FullTextFilter;
  setMarketFilterFulltext: (data: FullTextFilter) => void;
}

const fields = [
  "searchInName",
  "searchInDescription",
  "searchInOrganizer",
  "searchInStreet",
  "searchInDistrict",
  "searchInCity",
]

const fieldToLabel: Map<string, string> = new Map([
  ["searchInName", "Name"],
  ["searchInDescription", "Beschreibung"],
  ["searchInOrganizer", "Veranstalter"],
  ["searchInCity", "Stadt"],
  ["searchInDistrict", "Bezirk"],
  ["searchInStreet", "Straße"],
])

export const SearchCheckboxes: FC<SearchCheckboxesType> = ({
  marketFilterFulltext,
  setMarketFilterFulltext
}) => {
  const pairs = [
    fields.slice(0, 2),
    fields.slice(2, 4),
    fields.slice(4, 6)
  ]
  return (
    <>
      {pairs.map((pair, index) => (
        <div key={`search-box-line${index}`} className="justify-left flex pb-2">
          <PartialSearchCheckboxes
            selectedFields={pair}
            index={index}
            marketFilterFulltext={marketFilterFulltext}
            setMarketFilterFulltext={setMarketFilterFulltext}
          />
        </div>
      ))}
    </>
  )
}

export const PartialSearchCheckboxes: FC<SearchCheckboxesType> = ({
  index,
  selectedFields,
  marketFilterFulltext,
  setMarketFilterFulltext
}) => {
  return (
    <>
      {selectedFields?.map((field: string, innerIndex: number) => (
        <SearchCheckbox
          index={`${index}-${innerIndex}`}
          key={`searchbox-${index}-${innerIndex}`}
          field={field} label={fieldToLabel.get(field) || "unbekannt"}
          marketFilterFulltext={marketFilterFulltext}
          setMarketFilterFulltext={setMarketFilterFulltext}
        />
      ))
      }
    </>
  )
}

export const SearchCheckbox: FC<SearchCheckboxType> = ({
  index,
  field,
  label,
  marketFilterFulltext,
  setMarketFilterFulltext
}) => {
  const mapping = new Map<string, boolean | undefined>([
    ["searchInName", marketFilterFulltext?.searchInName],
    ["searchInDescription", marketFilterFulltext?.searchInDescription],
    ["searchInStreet", marketFilterFulltext?.searchInStreet],
    ["searchInDistrict", marketFilterFulltext?.searchInDistrict],
    ["searchInCity", marketFilterFulltext?.searchInCity],
    ["searchInOrganizer", marketFilterFulltext?.searchInOrganizer],
  ]);
  const checked = mapping.get(field)
  return (
    <>
      <input key={`searchbox-ìnput-${index}`} type="checkbox" id={`${field}Cb`}
        checked={marketFilterFulltext && checked}
        onChange={(_) => setMarketFilterFulltext({
          ...marketFilterFulltext,
          [`${field}`]: marketFilterFulltext && !checked
        })}
      />
      <label key={`searchbox-ìnput-label-${index}`} htmlFor={`${field}Cb`}>{label}</label>
    </>
  )
}