import { FC, useEffect, useState } from "react";

import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { de } from "date-fns/locale";
import "react-day-picker/dist/style.css";

export interface FilterDateType {
  marketFilterDate: Date | undefined;
  setMarketFilterDate: (date: Date | undefined) => void;
}

export const FilterDate: FC<FilterDateType> = ({
  marketFilterDate,
  setMarketFilterDate,
}) => {
  const css = `
  .rdp-root {
    --rdp-day-height: 30px;
    --rdp-day-width: 30px;
    --rdp-accent-color: #BDA33B;
    --rdp-background-color: inherit;
    /* Switch to dark colors for dark themes */
    --rdp-accent-color-dark: #3003e1;
    --rdp-background-color-dark: #180270;
    /* Outline border for focused elements */
    --rdp-outline: 2px solid var(--rdp-accent-color);
    /* Outline border for focused and selected elements */
    --rdp-outline-selected: 2px solid rgba(0, 0, 0, 0.75);
    margin: 0;
  }

  .rdp-caption_label{
    font-size: 16px;
    margin-left: 6px;
    font-weight: normal;
  }

  .rdp-chevron {
    fill: rgb(245 248 254 / 0.9)
  }

  .rdp-button_previous {
    border-radius: 25px;
  }

  .rdp-button_next {
    border-radius: 25px;
  }

  .rdp-button_previous:hover:not([disabled]):not(.rdp-selected) {
    .rdp-chevron {
      fill: darkblue
    }
    background-color: rgb(245 248 254 / 0.9);
  }

  .rdp-button_next:hover:not([disabled]):not(.rdp-selected) {
    .rdp-chevron {
      fill: darkblue
    }
    background-color: rgb(245 248 254 / 0.9);
  }

  .rdp-day {
    border-radius: 25px;
  }

  .rdp-day_button:hover:not([disabled]):not(.rdp-selected) {
    color: darkblue;
    background-color: rgb(245 248 254 / 0.9);
  }

  .rdp-today:not(.rdp-outside) {
    color: #BDA33B;
  }
`;
  const [defaultMonth, setDefaultMonth] = useState<Date>();
  const [today, setToday] = useState<Date>();
  const fromMonth = new Date(2024, 10);
  const toDate = new Date(2025, 0, 7);

  useEffect(() => {
    const today = new Date();
    const maxOrToday = today.getTime() > toDate.getTime() ? toDate : today;
    setToday(maxOrToday);
    setDefaultMonth(new Date(maxOrToday.getFullYear(), maxOrToday.getMonth()));
  }, []);

  return (
    <>
      <div className="self-center">
        <style>{css}</style>
        <DayPicker
          mode="single"
          selected={marketFilterDate}
          // @ts-ignore
          onSelect={setMarketFilterDate}
          modifiersClassNames={{
            selected: "!bg-gold hover:bg-gold !text-darkblue",
            mouseover: "!bg-gold",
          }}
          defaultMonth={defaultMonth}
          today={today}
          fromMonth={fromMonth}
          toDate={toDate}
          locale={de}
          weekStartsOn={1}
        />
      </div>
    </>
  );
};
