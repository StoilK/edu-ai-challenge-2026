import { useCallback, useEffect, useId, useRef, useState } from "react";
import { FabricIcon } from "../FabricIcon";

type Props = {
  id: string;
  "aria-label": string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  /** First two dropdowns use `root-172`, third uses `root-192` in the source template. */
  containerClassName?: string;
};

/**
 * Matches `ms-Dropdown` + container structure from the SharePoint template.
 * Custom list so the open panel matches the trigger width (native select lists cannot be styled to match).
 */
export function DropdownField({
  id,
  "aria-label": ariaLabel,
  value,
  onChange,
  options,
  containerClassName = "ms-Dropdown-container root-172",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listId = useId();

  const currentLabel = options.find((o) => o.value === value)?.label ?? value;

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={containerClassName} ref={rootRef}>
      <div
        className="ms-Dropdown dropdown-173"
        data-is-focusable="true"
        data-ktp-target="true"
        id={id}
        role="combobox"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${ariaLabel}, ${currentLabel}`}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            toggle();
            return;
          }
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!open) setOpen(true);
          }
        }}
      >
        <div className="ms-DropdownHeader_2943a085" onClick={toggle}>
          <span className="ms-Dropdown-title title-204" aria-invalid="false">
            <span className="nativeDropdownSelect" aria-hidden="true" title={currentLabel}>
              {currentLabel}
            </span>
          </span>
          <span className="ms-Dropdown-caretDownWrapper caretDownWrapper-175" aria-hidden="true">
            <FabricIcon name="ChevronDown" className="ms-Dropdown-caretDown caretDown-191" />
          </span>
        </div>
      </div>
      {open ? (
        <ul
          id={listId}
          className="nativeDropdownList_2943a085"
          role="listbox"
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((o) => (
            <li
              key={o.value}
              role="option"
              className="nativeDropdownOption_2943a085"
              aria-selected={o.value === value}
              onClick={() => {
                onChange(o.value);
                close();
              }}
            >
              {o.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
