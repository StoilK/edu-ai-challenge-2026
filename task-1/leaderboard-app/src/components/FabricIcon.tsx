import type { ReactNode } from "react";
import type { CategoryIconName } from "../types/leaderboard";

type IconName =
  | "Search"
  | "ChevronDown"
  | "ChevronUp"
  | "FavoriteStarFill"
  | CategoryIconName;

type SvgSpec = { viewBox: string; children: ReactNode };

/** Official Fluent MDL2 paths (2048 artboard) — @fluentui/react-icons-mdl2. */
const mdl2Education: SvgSpec = {
  viewBox: "0 0 2048 2048",
  children: (
    <path d="M1582 1065q41 72 61 150t21 161v103l-640 321-640-321q0-60 1-112t9-101 24-98 48-103L256 960v587q29 10 52 28t41 42 26 52 9 59v320H0v-320q0-30 9-58t26-53 40-42 53-28V896L0 832l1024-512 1024 512-466 233zM256 1728q0-26-19-45t-45-19q-26 0-45 19t-19 45v192h128v-192zm30-896l738 369 738-369-738-369-738 369zm1250 568q0-77-15-143t-53-135l-444 222-444-222q-33 58-50 122t-18 132v24l512 256 512-256z" />
  ),
};

const mdl2Presentation: SvgSpec = {
  viewBox: "0 0 2048 2048",
  children: (
    <path d="M0 0h1920v128h-128v896q0 26-10 49t-27 41-41 28-50 10h-640v640h512v128H384v-128h512v-640H256q-26 0-49-10t-41-27-28-41-10-50V128H0V0zm1664 1024V128H256v896h1408zm-256-512v128H512V512h896z" />
  ),
};

/** `Emoji2Icon` — only used for category icons that do not have dedicated MDL2 art above. */
const mdl2Emoji2: SvgSpec = {
  viewBox: "0 0 2048 2048",
  children: (
    <path d="M640 896q-27 0-50-10t-40-27-28-41-10-50q0-27 10-50t27-40 41-28 50-10q27 0 50 10t40 27 28 41 10 50q0 27-10 50t-27 40-41 28-50 10zm768 0q-27 0-50-10t-40-27-28-41-10-50q0-27 10-50t27-40 41-28 50-10q27 0 50 10t40 27 28 41 10 50q0 27-10 50t-27 40-41 28-50 10zM1024 0q141 0 272 36t245 103 207 160 160 208 103 245 37 272q0 141-36 272t-103 245-160 207-208 160-245 103-272 37q-141 0-272-36t-245-103-207-160-160-208-103-244-37-273q0-141 36-272t103-245 160-207 208-160T751 37t273-37zm0 1920q123 0 237-32t214-90 182-141 140-181 91-214 32-238q0-123-32-237t-90-214-141-182-181-140-214-91-238-32q-123 0-237 32t-214 90-182 141-140 181-91 214-32 238q0 123 32 237t90 214 141 182 181 140 214 91 238 32zm0-384q73 0 141-20t128-57 106-90 81-118l115 58q-41 81-101 147t-134 112-159 71-177 25q-92 0-177-25t-159-71-134-112-101-147l115-58q33 65 80 118t107 90 127 57 142 20z" />
  ),
};

function iconSpec(name: IconName): SvgSpec {
  switch (name) {
    case "Search":
      return {
        viewBox: "0 0 20 20",
        children: (
          <path d="M8.2 1.8a6.4 6.4 0 1 0 3.7 11.5l3.3 3.2.9-.8-3.2-3.1A6.4 6.4 0 0 0 8.2 1.8Zm0 1.2a5.2 5.2 0 1 1 0 10.4 5.2 5.2 0 0 1 0-10.4Z" />
        ),
      };
    case "ChevronDown":
      return {
        viewBox: "0 0 20 20",
        children: <path d="M4.6 7.1 10 12.3l5.4-5.2-.8-.8-4.6 4.4-4.5-4.4-.8.8Z" />,
      };
    case "ChevronUp":
      return {
        viewBox: "0 0 20 20",
        children: <path d="M4.6 12.9 10 7.7l5.4 5.2-.8.8-4.6-4.4-4.5 4.4-.8-.8Z" />,
      };
    case "FavoriteStarFill":
      return {
        viewBox: "0 0 20 20",
        children: <path d="M10 2.2l2.2 4.5 5 .7-3.6 3.4.8 4.9L10 14.1l-4.4 2.6.8-4.9-3.6-3.4 5-.7L10 2.2Z" />,
      };
    case "Presentation":
      return mdl2Presentation;
    case "Education":
      return mdl2Education;
    case "Lightbulb":
    case "People":
    case "Code":
      return mdl2Emoji2;
    default:
      return { viewBox: "0 0 20 20", children: null };
  }
}

type Props = {
  name: IconName;
  className?: string;
  /** Mimics template: category stats use this extra class */
  isCategory?: boolean;
};

const emoji2CategoryIconNames: CategoryIconName[] = ["Lightbulb", "People", "Code"];

/**
 * `Education` / `Presentation` use their MDL2 glyphs; `Lightbulb` / `People` / `Code` use **Emoji2**.
 */
export function FabricIcon({ name, className = "", isCategory }: Props) {
  const { viewBox, children } = iconSpec(name);
  const base = isCategory
    ? `categoryStatIcon_2943a085 root-206 ${className}`.trim()
    : `root-206 ${className}`.trim();
  const dataIconName =
    isCategory && emoji2CategoryIconNames.includes(name as CategoryIconName) ? "Emoji2" : name;
  return (
    <i data-icon-name={dataIconName} aria-hidden="true" className={base}>
      <svg
        className="fabricIconSvg"
        viewBox={viewBox}
        fill="currentColor"
        focusable="false"
        aria-hidden
        xmlns="http://www.w3.org/2000/svg"
      >
        {children}
      </svg>
    </i>
  );
}
