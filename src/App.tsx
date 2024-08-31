import { useMemo, useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";

import "./App.css";

const data = [
  { id: 1, company: "Tech Innovators", contact: "John Doe", country: "USA" },
  {
    id: 2,
    company: "Creative Minds",
    contact: "Jane Smith",
    country: "Canada",
  },
  {
    id: 3,
    company: "Global Solutions",
    contact: "Michael Johnson",
    country: "UK",
  },
  {
    id: 4,
    company: "Eco Enterprises",
    contact: "Emily Davis",
    country: "Germany",
  },
  {
    id: 5,
    company: "Fintech World",
    contact: "Robert Brown",
    country: "France",
  },
  {
    id: 6,
    company: "Health First",
    contact: "Jessica Wilson",
    country: "Japan",
  },
  {
    id: 7,
    company: "Adventure Travels",
    contact: "David Martinez",
    country: "Brazil",
  },
  { id: 8, company: "Gourmet Goods", contact: "Sarah Lee", country: "India" },
  {
    id: 9,
    company: "Green Earth",
    contact: "Daniel Anderson",
    country: "Australia",
  },
  {
    id: 10,
    company: "Tech Pioneers",
    contact: "Laura Thomas",
    country: "Spain",
  },
  {
    id: 11,
    company: "Digital Dreams",
    contact: "James Taylor",
    country: "Mexico",
  },
  {
    id: 12,
    company: "Culinary Creations",
    contact: "Linda Rodriguez",
    country: "Italy",
  },
  {
    id: 13,
    company: "Fashion Forward",
    contact: "Anthony White",
    country: "South Korea",
  },
  {
    id: 14,
    company: "Home Comforts",
    contact: "Barbara Harris",
    country: "Netherlands",
  },
  {
    id: 15,
    company: "Eco Living",
    contact: "Christopher Clark",
    country: "Sweden",
  },
];

interface IFilter {
  column: string;
  where: "contains" | "equal";
  value: string | number;
  condition?: "AND" | "OR";
}

function DoubleClick({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [editable, setEditable] = useState(false);

  const [value_, setValue] = useState(value);

  const content = editable ? (
    <input
      style={{
        margin: 0,
        height: 16,
        border: "none",
        fontSize: 12,
      }}
      autoFocus
      onChange={(e) => {
        setValue(e.target.value);
      }}
      value={value_}
      onBlur={() => {
        if (value.trim() !== value_.trim()) onChange(value_);
        setEditable(false);
      }}
    />
  ) : (
    value
  );

  return <div onDoubleClick={() => setEditable(true)}>{content}</div>;
}

function App() {
  const tableData = data;
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<IFilter[]>([
    {
      column: "company",
      value: "",
      where: "contains",
      condition: "AND",
    },
  ]);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");

  const [buildedFilters, setBuildedFilters] = useState(filters);

  const columns = [
    {
      label: "Company",
      value: "company",
    },
    {
      label: "Contact",
      value: "contact",
    },
    {
      label: "Country",
      value: "country",
    },
  ];

  const validFilters = buildedFilters.filter((c) => c.column && c.value);

  const filtered = useMemo(() => {
    if (!value) return tableData;

    const lowercasedValue = value.toLowerCase();

    return tableData.filter(
      ({ company, contact, country }) =>
        company.toLowerCase().includes(lowercasedValue) ||
        contact.toLowerCase().includes(lowercasedValue) ||
        country.toLowerCase().includes(lowercasedValue)
    );
  }, [value, tableData]);

  const newFiltered = useMemo(() => {
    if (validFilters.length === 0) return filtered;

    return filtered.filter((company) => {
      let shouldInclude = validFilters[0].condition === "OR" ? false : true;

      for (const filter of validFilters) {
        const { column, value, where, condition } = filter;
        const companyValue = company[column as keyof typeof company];

        let matches = false;

        if (typeof companyValue === "string" && typeof value === "string") {
          if (where === "contains") {
            matches = companyValue.toLowerCase().includes(value.toLowerCase());
          } else if (where === "equal") {
            matches = companyValue.toLowerCase() === value.toLowerCase();
          }
        } else if (
          typeof companyValue === "number" &&
          typeof value === "number"
        ) {
          if (where === "equal") {
            matches = companyValue === value;
          }
        }

        if (condition === "OR") {
          shouldInclude = shouldInclude || matches;
        } else {
          shouldInclude = shouldInclude && matches;
        }
      }

      return shouldInclude;
    });
  }, [validFilters, filtered]);

  useOnClickOutside(popoverRef, () => {
    setFilterOpen(false);
  });
  return (
    <div>
      <div className="header">
        <input
          list="list"
          placeholder="Search"
          type="search"
          className="base"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <datalist id="list">
          {tableData.map((c) => (
            <option key={c.id} value={c.company} />
          ))}
        </datalist>

        <div className="popover">
          <button
            onClick={() => {
              setFilterOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setFilterOpen(false);
              }
            }}
            className="base"
          >
            Filter
            {validFilters.some((e) => !!e.value) && (
              <span>({validFilters.length})</span>
            )}
          </button>
          {filterOpen && (
            <div className="base popover-content" ref={popoverRef}>
              {filters.map((f, x) => (
                <div key={x} className="filter-row">
                  {x > 0 ? (
                    <select
                      className="base"
                      value={f.condition}
                      onChange={(e) => {
                        setFilters((prev) =>
                          prev.map((s, x1) =>
                            x1 === x
                              ? {
                                  ...s,
                                  condition: e.target.value as "AND" | "OR",
                                }
                              : s
                          )
                        );
                      }}
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  ) : (
                    <span>Where</span>
                  )}
                  <select
                    value={f.column}
                    className="base"
                    onChange={(e) => {
                      setFilters((prev) =>
                        prev.map((s, x1) =>
                          x1 === x ? { ...s, column: e.target.value } : s
                        )
                      );
                    }}
                  >
                    <option disabled value="">
                      column
                    </option>
                    {columns.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={f.where}
                    className="base"
                    onChange={(e) => {
                      setFilters((prev) =>
                        prev.map((s, x1) =>
                          x1 === x
                            ? {
                                ...s,
                                where: e.target.value as "contains" | "equal",
                              }
                            : s
                        )
                      );
                    }}
                  >
                    <option value="contains">Contains</option>
                    <option value="equal">Equal</option>
                  </select>
                  <input
                    value={f.value}
                    className="base"
                    placeholder="value"
                    onChange={(e) => {
                      setFilters((prev) =>
                        prev.map((s, x1) =>
                          x1 === x ? { ...s, value: e.target.value } : s
                        )
                      );
                    }}
                  />
                  {x > 0 && (
                    <button
                      onClick={() => {
                        setFilters((prev) => prev.filter((_, x1) => x1 !== x));
                      }}
                      className="base ghost"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
              <div>
                <button
                  className="base"
                  onClick={() => {
                    setFilters((e) => [
                      ...e,
                      {
                        column: "",
                        value: "",
                        where: "contains",
                        condition: "AND",
                      },
                    ]);
                  }}
                >
                  + add filter
                </button>
              </div>
              <div className="popover-footer">
                <button
                  className="base ghost"
                  onClick={() => setFilterOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="base"
                  onClick={() => {
                    setBuildedFilters(filters);
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
        {!!validFilters.length && (
          <button
            onClick={() => {
              const initial: IFilter[] = [
                {
                  column: "company",
                  value: "",
                  where: "contains",
                  condition: "AND",
                },
              ];
              setFilters(initial);
              setBuildedFilters(initial);
            }}
            className="base"
          >
            Clear
          </button>
        )}
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th style={{ width: 300 }}>Contact</th>
              <th>Country</th>
            </tr>
          </thead>
          <tbody>
            {newFiltered.map((c) => (
              <tr key={c.id}>
                <td>{c.company}</td>
                <td>
                  <DoubleClick
                    value={c.contact}
                    onChange={(v) => {
                      console.log({ v });
                    }}
                  />
                </td>
                <td>{c.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
