import { DropdownField } from "./DropdownField";
import { FabricIcon } from "../FabricIcon";

type Props = {
  year: string;
  onYear: (v: string) => void;
  yearOptions: string[];
  quarter: string;
  onQuarter: (v: string) => void;
  quarterOptions: string[];
  category: string;
  onCategory: (v: string) => void;
  categoryOptions: string[];
  search: string;
  onSearch: (v: string) => void;
};

export function FilterBar({
  year,
  onYear,
  yearOptions,
  quarter,
  onQuarter,
  quarterOptions,
  category,
  onCategory,
  categoryOptions,
  search,
  onSearch,
}: Props) {
  return (
    <div className="filterBar_2943a085">
      <div className="filters_2943a085">
        <DropdownField
          id="lb-dropdown-year"
          aria-label="Filter by year"
          value={year}
          onChange={onYear}
          options={yearOptions.map((d) => ({ value: d, label: d }))}
        />
        <DropdownField
          id="lb-dropdown-quarter"
          aria-label="Filter by quarter"
          value={quarter}
          onChange={onQuarter}
          options={quarterOptions.map((d) => ({ value: d, label: d }))}
        />
        <DropdownField
          id="lb-dropdown-category"
          aria-label="Filter by category"
          value={category}
          onChange={onCategory}
          options={categoryOptions.map((d) => ({ value: d, label: d }))}
          containerClassName="ms-Dropdown-container root-192 filterBarCategory_2943a085"
        />
      </div>
      <div className="search_2943a085">
        <div className="ms-SearchBox root-193">
          <div className="ms-SearchBox-iconContainer iconContainer-194" aria-hidden="true">
            <FabricIcon name="Search" className="ms-SearchBox-icon icon-198" />
          </div>
          <input
            id="SearchBox7"
            className="ms-SearchBox-field field-197"
            placeholder="Search employee..."
            role="searchbox"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              if (e.currentTarget.value.trim() === "") {
                e.currentTarget.blur();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
