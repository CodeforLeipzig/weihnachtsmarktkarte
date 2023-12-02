import { FC, ReactElement, useState, ReactNode } from 'react'
import classNames from 'classnames'

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
  selectedFields?: string[];
  marketFilterFulltext: FullTextFilter;
  setMarketFilterFulltext: (data: FullTextFilter) => void;
}

export interface SearchCheckboxType {
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
      {pairs.map(pair => (
        <div className="justify-left flex pb-2">
          <PartialSearchCheckboxes
            selectedFields={pair}
            marketFilterFulltext={marketFilterFulltext}
            setMarketFilterFulltext={setMarketFilterFulltext}
          />
        </div>
      ))}
    </>
  )
}

export const PartialSearchCheckboxes: FC<SearchCheckboxesType> = ({
  selectedFields,
  marketFilterFulltext,
  setMarketFilterFulltext
}) => {
  return (
    <>
      {selectedFields?.map((field: string) => (
        <SearchCheckbox
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
  field,
  label,
  marketFilterFulltext,
  setMarketFilterFulltext
}) => {
  return (
    <>
      <input type="checkbox" id={`${field}Cb`}
        checked={marketFilterFulltext && marketFilterFulltext[field]}
        onChange={(_) => setMarketFilterFulltext({
          ...marketFilterFulltext,
          [`${field}`]: marketFilterFulltext && !marketFilterFulltext[field]
        })}
      />
      <label htmlFor={`${field}Cb`}>{label}</label>
    </>
  )
}