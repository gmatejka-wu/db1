import React, { useState, useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// Initialize the module - this line is crucial

// ✅ Import datasets
import sampleData from "../data/sampleDataNew";
import { MetricsOverview } from "../components/AIGuidance";

// ==============================================
// UTILITY FUNCTIONS
// ==============================================
const fmtNumber = (v, decimals = 2) =>
  v === null || v === undefined || isNaN(Number(v))
    ? "–"
    : Number(v).toLocaleString(undefined, {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      });

const fmtPercent = (v, decimals = 1) =>
  v === null || v === undefined || isNaN(Number(v))
    ? "–"
    : `${(Number(v) * 100).toFixed(decimals)}%`;

const trendArrow = (delta) => {
  if (delta === null || delta === undefined || isNaN(Number(delta))) return "";
  const d = Number(delta);
  return d > 0 ? "▲" : d < 0 ? "▼" : "→";
};

const getCurrentValue = (data) =>
  data && data.length > 0 ? data[data.length - 1].value : null;

const getHistoricalValue = (data, periodsAgo) => {
  if (!data || data.length === 0) return null;
  const index = data.length - 1 - periodsAgo;
  return index >= 0 ? data[index].value : null;
};

const getFutureValue = (futures, period) =>
  futures ? futures.find((f) => f.date === period)?.value ?? null : null;

// ==============================================
// CONTEXT CREATOR
// ==============================================
const makeContext = (datasets) => ({
  now: (dataRef) => {
    const dataset = datasets[dataRef];
    return dataset ? getCurrentValue(dataset.historical) : null;
  },
  ago: (dataRef, periods) => {
    const dataset = datasets[dataRef];
    return dataset ? getHistoricalValue(dataset.historical, periods) : null;
  },
  plan: (dataRef) => {
    const dataset = datasets[dataRef];
    return dataset?.plan ?? null;
  },
  future: (dataRef, period) => {
    const dataset = datasets[dataRef];
    return dataset ? getFutureValue(dataset.futures, period) : null;
  },
  delta: (dataRef, periods) => {
    const dataset = datasets[dataRef];
    if (!dataset?.historical) return null;
    const current = getCurrentValue(dataset.historical);
    const previous = getHistoricalValue(dataset.historical, periods);
    return current !== null && previous !== null
      ? (current - previous) / previous
      : null;
  },
  budgetDelta: (dataRef, company) => {
    const dataset = datasets[dataRef];
    if (!dataset) return null;
    const current = getCurrentValue(dataset.historical);
    const budget = dataset?.budgets?.[company] ?? dataset?.plan ?? null;
    return current !== null && budget !== null
      ? (current - budget) / budget
      : null;
  },
});

// ==============================================
// NEW TABLE FACTORY
// ==============================================
const createDynamicRows = (baseDate, latestSpotDate) => [
  latestSpotDate,
  "Δ since 1 month",
  "Δ since 1 year",
  "Δ budget*",
];

const createTableFromGroups = (
  groups,
  {
    title = "Table",
    headerColor = "bg-gray-700",
    headerTextColor = "text-white",
    rowNames = null,
    fontSize = "text-sm",
    firstColumnWidth = "",
    baseDate = "2025-01-15",
    latestSpotDate = "2025-01-15",
  } = {}
) => {
  return () => {
    const { datasets } = sampleData;
    const ctxBase = makeContext(datasets);

    // Use dynamic row names if not provided
    const dynamicRowNames =
      rowNames || createDynamicRows(baseDate, latestSpotDate);

    // Enhanced future value lookup with flexible date matching
    const enhancedContext = {
      ...ctxBase,
      future: (dataRef, period) => {
        const dataset = datasets[dataRef];
        if (!dataset?.futures) return null;

        // Try different future date formats
        const futureOptions = [
          period,
          `${baseDate.substring(0, 4)}-${period}`,
          period.replace("M", ""),
          `${period}-${baseDate.substring(0, 4)}`,
        ];

        for (const option of futureOptions) {
          const found = dataset.futures.find(
            (f) =>
              f.date === option ||
              f.date.includes(option) ||
              option.includes(f.date)
          );
          if (found) return found.value;
        }
        return null;
      },
    };

    const ctxAt = (offset) => ({
      now: (ref) => {
        const ds = datasets[ref];
        return ds ? getHistoricalValue(ds.historical, offset) : null;
      },
      ago: (ref, periods) => enhancedContext.ago(ref, periods + offset),
      plan: enhancedContext.plan,
      future: enhancedContext.future,
      delta: (ref, periods) => {
        const current = enhancedContext.ago(ref, offset);
        const prev = enhancedContext.ago(ref, offset + periods);
        return current !== null && prev !== null
          ? (current - prev) / prev
          : null;
      },
      budgetDelta: enhancedContext.budgetDelta,
    });

    const flatCols = groups.flatMap((g, groupIndex) =>
      g.columns.map((c) => ({
        ...c,
        groupIndex,
        groupTitle: g.title,
        groupUnit: g.unit,
      }))
    );

    const valSpot = (col) => {
      if (typeof col.compute === "function") return col.compute(ctxAt(0));
      if (col.ref) return enhancedContext.now(col.ref);
      return null;
    };

    const valDelta = (col, periods) => {
      if (typeof col.compute === "function" && !col.ref) return null;
      if (!col.ref) return null;
      return enhancedContext.delta(col.ref, periods);
    };

    const valBudget = (col) => {
      if (!col.ref) return null;
      return enhancedContext.budgetDelta(col.ref);
    };

    const valueForRow = (col, rowName) => {
      // Check if rowName is a date (latest spot date)
      if (rowName.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return valSpot(col);
      }

      switch (rowName) {
        case "Date":
          return "31.12.2025"; // static date for now
        case "Spot":
          return valSpot(col);
        case "Δ since 1 day":
          return valDelta(col, 1); // last data point vs 1 day back
        case "Δ since 1 month":
          return valDelta(col, 30); // approx 30 periods back
        case "Δ since 1 year":
          return valDelta(col, 365); // approx 365 periods back
        case "52w high": {
          const ds = datasets[col.ref];
          return ds ? Math.max(...ds.historical.map((d) => d.value)) : null;
        }
        case "52w low": {
          const ds = datasets[col.ref];
          return ds ? Math.min(...ds.historical.map((d) => d.value)) : null;
        }
        case "YTD": {
          const ds = datasets[col.ref];
          if (!ds?.historical?.length) return null;
          const firstOfYear = ds.historical.find((d) =>
            d.date.startsWith(new Date().getFullYear().toString())
          );
          const current = getCurrentValue(ds.historical);
          return firstOfYear && current
            ? (current - firstOfYear.value) / firstOfYear.value
            : null;
        }
        case "Δ budget*":
          return valBudget(col);
        default:
          return valSpot(col);
      }
    };

    const renderValue = (col, value, rowName) => {
      if (value === null || value === undefined) return "–";

      // special case: Date row or spot date → show as string
      if (rowName === "Date" || rowName.match(/^\d{4}-\d{2}-\d{2}$/)) {
        if (rowName.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // For spot data, show formatted numbers
          if (col.type === "ratio") return fmtPercent(value / 100, 1);
          return fmtNumber(value, 2);
        }
        return String(value);
      }

      if (rowName === "Spot") {
        if (col.type === "ratio") return fmtPercent(value / 100, 1);
        return fmtNumber(value, 2);
      }
      if (rowName.startsWith("Δ")) {
        const colorClass = value >= 0 ? "text-green-600" : "text-red-600";
        return (
          <span className={colorClass}>
            {trendArrow(value)} {fmtPercent(value, 1)}
          </span>
        );
      }
      return fmtNumber(value, 2);
    };

    return (
      <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm">
        <div
          className={`px-4 py-3 border-b ${headerColor} ${headerTextColor} font-semibold`}
        >
          {title}
        </div>
        <div className="overflow-x-auto">
          <table className={`w-full ${fontSize}`}>
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className={`px-4 py-2 text-left ${firstColumnWidth}`}>
                  Date / Metric
                </th>
                {groups.map((g, i) => (
                  <th
                    key={i}
                    colSpan={g.columns.length}
                    className="px-4 py-2 text-center font-semibold"
                  >
                    {g.title}
                    {g.unit && (
                      <div className="text-xs text-gray-500">{g.unit}</div>
                    )}
                  </th>
                ))}
              </tr>
              <tr className="bg-gray-50 border-b">
                <th
                  className={`px-4 py-2 text-left font-medium ${firstColumnWidth}`}
                >
                  Metric
                </th>
                {flatCols.map((col, idx) => {
                  const isGroupStart =
                    idx === 0 ||
                    flatCols[idx - 1].groupIndex !== col.groupIndex;
                  const groupBg =
                    col.groupIndex % 2 === 0 ? "bg-gray-50" : "bg-gray-25";
                  return (
                    <th
                      key={col.id || idx}
                      className={`px-4 py-2 ${
                        col.align === "center" ? "text-center" : "text-right"
                      } font-medium ${groupBg} ${
                        isGroupStart ? "border-l-2 border-gray-300" : ""
                      }`}
                    >
                      {col.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {dynamicRowNames.map((rowName, r) => {
                const isLast = r === dynamicRowNames.length - 1;
                return (
                  <tr
                    key={r}
                    className={`${!isLast ? "border-b" : ""} hover:bg-gray-50`}
                  >
                    <td className={`px-4 py-2 font-medium ${firstColumnWidth}`}>
                      {rowName}
                    </td>
                    {flatCols.map((col, cIdx) => {
                      const isGroupStart =
                        cIdx === 0 ||
                        flatCols[cIdx - 1].groupIndex !== col.groupIndex;
                      const groupBg =
                        col.groupIndex % 2 === 0 ? "bg-white" : "bg-gray-25";
                      const value = valueForRow(col, rowName);
                      return (
                        <td
                          key={`${rowName}-${col.id || cIdx}`}
                          className={`px-4 py-2 ${
                            col.align === "center"
                              ? "text-center"
                              : "text-right"
                          } ${groupBg} ${
                            isGroupStart ? "border-l-2 border-gray-200" : ""
                          }`}
                        >
                          {renderValue(col, value, rowName)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
};

// ==============================================
// GROUP CONFIGS
// ==============================================
const MATERIAL_GROUPS = [
  {
    title: "Dissolving Wood Pulp",
    unit: "USD / to",
    columns: [
      {
        id: "dwp_hw",
        label: "Spot Hardwood",
        ref: "DWP_HARDWOOD",
        type: "absolute",
      },
      {
        id: "dwp_sw",
        label: "Spot Softwood",
        ref: "DWP_SOFTWOOD",
        type: "absolute",
      },
      {
        id: "spread_sw_hw",
        label: "Spread SW-HW",
        type: "absolute",
        compute: ({ now }) => {
          const sw = now("DWP_SOFTWOOD");
          const hw = now("DWP_HARDWOOD");
          return sw != null && hw != null ? sw - hw : null;
        },
        planCompute: ({ plan }) => {
          const swp = plan("DWP_SOFTWOOD");
          const hwp = plan("DWP_HARDWOOD");
          return swp != null && hwp != null ? swp - hwp : null;
        },
      },
    ],
  },
  {
    title: "Viscose Staple Fibre",
    unit: "CNY / to",
    columns: [
      {
        id: "vsf_med",
        label: "VSF Medium",
        ref: "VSF_MEDIUM",
        type: "absolute",
      },
      {
        id: "vsf_high",
        label: "VSF High",
        ref: "VSF_HIGH",
        type: "absolute",
      },
      {
        id: "lyocell_cn",
        label: "Lyocell (CN)",
        ref: "LYO_CN",
        type: "absolute",
      },
    ],
  },
  {
    title: "Spread DWP / VSF",
    unit: "in %",
    columns: [
      {
        id: "ratio_dwp_vsf",
        label: "DWP Hardwood / VSF High",
        type: "ratio",
        compute: ({ now }) => {
          const dwp = now("DWP_HARDWOOD");
          const vsf = now("VSF_HIGH");
          return dwp != null && vsf != null ? (dwp / vsf) * 100 : null;
        },
      },
    ],
  },
  {
    title: "Cotton #1 (ZCE)",
    unit: "CNY / MT",
    columns: [
      {
        id: "cotton_zce_spot",
        label: "Spot",
        ref: "COTTON_ZCE",
        type: "absolute",
      },
      {
        id: "cotton_zce_nov25",
        label: "Nov.25",
        type: "absolute",
        compute: ({ future }) => future("COTTON_ZCE", "2025-11"),
      },
      {
        id: "cotton_zce_jul26",
        label: "Jul.26",
        type: "absolute",
        compute: ({ future }) => future("COTTON_ZCE", "2026-07"),
      },
    ],
  },
  {
    title: "Cotton #2 (ICE)",
    unit: "USD / lb",
    columns: [
      {
        id: "cotton_ice_spot",
        label: "Spot",
        ref: "COTTON_ICE",
        type: "absolute",
      },
      {
        id: "cotton_ice_oct25",
        label: "Oct.25",
        type: "absolute",
        compute: ({ future }) => future("COTTON_ICE", "2025-10"),
      },
      {
        id: "cotton_ice_oct26",
        label: "Oct.26",
        type: "absolute",
        compute: ({ future }) => future("COTTON_ICE", "2026-10"),
      },
    ],
  },
];

const CHEMICALS_GROUPS = [
  {
    title: "Rubber TSR 20",
    unit: "USD/kg",
    columns: [
      { id: "rubber_spot", label: "Spot", ref: "RUBBER_20", type: "absolute" },
      {
        id: "rubber_oct25",
        label: "Oct.25",
        type: "absolute",
        compute: ({ future }) => future("RUBBER_20", "2025-10"),
      },
      {
        id: "rubber_sep26",
        label: "Sep.26",
        type: "absolute",
        compute: ({ future }) => future("RUBBER_20", "2026-09"),
      },
    ],
  },
  {
    title: "Butadiene",
    unit: "USD/MTU",
    columns: [
      {
        id: "butadiene_spot_eu",
        label: "Spot EU",
        ref: "BUTADIENE_EU",
        type: "absolute",
      },
      {
        id: "butadiene_empty",
        label: "",
        type: "absolute",
        compute: () => null, // empty column
      },
      {
        id: "butadiene_korea",
        label: "Spot Korea",
        ref: "BUTADIENE_KOREA",
        type: "absolute",
      },
    ],
  },
  {
    title: "Iron Ore 62% (incl Cost & Freight)",
    unit: "USD/to",
    columns: [
      {
        id: "iron_china",
        label: "China",
        ref: "IRON_ORE_62",
        type: "absolute",
        align: "center",
      },
    ],
  },
  {
    title: "Coaltar",
    unit: "USD/to",
    columns: [
      {
        id: "coaltar_hfo",
        label: "HFO 1% NW Europe",
        ref: "HFO_1_PERCENT",
        type: "absolute",
        align: "center",
      },
    ],
  },
];

const ALUMINUM_GROUPS = [
  {
    title: "Aluminium (LME)",
    unit: "USD / to",
    columns: [
      {
        id: "aluminum_spot",
        label: "Spot",
        ref: "LME_ALUMINUM_SPOT", // needs dataset
        type: "absolute",
      },
      {
        id: "lme_3m",
        label: "3M-LME",
        ref: "LME_ALUMINUM_3M",
        type: "absolute",
      },
      {
        id: "lme_dec25",
        label: "Dez.25",
        type: "absolute",
        compute: ({ future }) => future("LME_ALUMINUM_3M", "2025-12"),
      },
    ],
  },
  {
    title: "Alumina - Tonerde (API)",
    unit: "USD / to",
    columns: [
      {
        id: "tonerde_spot",
        label: "Spot",
        ref: "TONERDE_API",
        type: "absolute",
        align: "center",
      },
    ],
  },
  {
    title: "Verhältnis Tonerde / Aluminium",
    unit: "%",
    columns: [
      {
        id: "api_lme_ratio",
        label: "API / 3M-LME",
        type: "ratio",
        align: "center",
        compute: ({ now }) => {
          const api = now("TONERDE_API");
          const lme = now("LME_ALUMINUM_3M");
          return api != null && lme != null ? (api / lme) * 100 : null;
        },
      },
    ],
  },
  {
    title: "3M-LME Premium",
    unit: "USD / to",
    columns: [
      {
        id: "premium_mw",
        label: "US MidWest",
        ref: "LME_PREMIUM_MIDWEST",
        type: "absolute",
      },
      {
        id: "premium_rot",
        label: "Rotterdam",
        ref: "LME_PREMIUM_ROTTERDAM",
        type: "absolute",
      },
    ],
  },
  {
    title: "Coke (DCE)",
    unit: "CNY / MT",
    columns: [
      {
        id: "coke_spot",
        label: "Spot",
        ref: "COKE_DCE",
        type: "absolute",
      },
      {
        id: "coke_3m",
        label: "3M",
        type: "absolute",
        compute: ({ future }) => future("COKE_DCE", "2025-Q1"), // adjust when you have rolling 3M
      },
      {
        id: "coke_12m",
        label: "12M",
        type: "absolute",
        compute: ({ future }) => future("COKE_DCE", "2025-Q4"), // adjust when you have rolling 12M
      },
    ],
  },
];

const ENERGY_GROUPS = [
  {
    title: "Crude Oil Brent (ICE)",
    unit: "USD/bbl",
    columns: [
      { id: "brent_spot", label: "Spot", ref: "BRENT_CRUDE", type: "absolute" },
      {
        id: "brent_3m",
        label: "3M",
        type: "absolute",
        compute: ({ future }) => future("BRENT_CRUDE", "3M"),
      },
      {
        id: "brent_12m",
        label: "12M",
        type: "absolute",
        compute: ({ future }) => future("BRENT_CRUDE", "12M"),
      },
    ],
  },
  {
    title: "Natural Gas - TTF (ICE)",
    unit: "EUR/MWh",
    columns: [
      {
        id: "gas_ttf_spot",
        label: "Spot",
        ref: "NATURAL_GAS_EU",
        type: "absolute",
      },
      {
        id: "gas_ttf_3m",
        label: "3M",
        type: "absolute",
        compute: ({ future }) => future("NATURAL_GAS_EU", "3M"),
      },
      {
        id: "gas_ttf_12m",
        label: "12M",
        type: "absolute",
        compute: ({ future }) => future("NATURAL_GAS_EU", "12M"),
      },
    ],
  },
];

// ==============================================
// TABLE INSTANCES
// ==============================================
const MaterialsTable = createTableFromGroups(MATERIAL_GROUPS, {
  title: "Prices Materials (Fibres / Cotton)",
  headerColor: "bg-green-600",
});

const ChemicalsTable = createTableFromGroups(CHEMICALS_GROUPS, {
  title: "SEM Chemicals/Fuels",
  headerColor: "bg-blue-900",
  headerTextColor: "text-white",
});

const AluminumTable = createTableFromGroups(ALUMINUM_GROUPS, {
  title: "AMAG Aluminium Chain",
  headerColor: "bg-blue-200",
  headerTextColor: "text-gray-800",
});

const EnergyTable = ({ baseDate, latestSpotDate }) => {
  const EnergyTableComponent = createTableFromGroups(ENERGY_GROUPS, {
    title: "Energy Benchmarks",
    headerColor: "bg-amber-800",
    headerTextColor: "text-white",
    baseDate,
    latestSpotDate,
  });
  return <EnergyTableComponent />;
};

// ==============================================
// MONEY MARKET & SWAPS GROUPS
// ==============================================
const MONEY_MARKET_ROW_GROUPS = [
  {
    title: "Money Market Rates",
    unit: "%",
    columns: [
      { id: "mm_1m", label: "1M", ref: "EURIBOR_1M", type: "absolute" },
      { id: "mm_3m", label: "3M", ref: "EURIBOR_3M", type: "absolute" },
      { id: "mm_6m", label: "6M", ref: "EURIBOR_6M", type: "absolute" },
      { id: "mm_12m", label: "12M", ref: "EURIBOR_12M", type: "absolute" },
    ],
  },
];

const MoneyMarketRowTable = createTableFromGroups(MONEY_MARKET_ROW_GROUPS, {
  title: "Money Market Rates",
  headerColor: "bg-indigo-600",
  headerTextColor: "text-white",
  rowNames: ["Euribor", "USD-SOFR", "CNY Loan Prime Rate"], // ✅ rows are rate types
  fontSize: "text-xs",
  firstColumnWidth: "min-w-40",
});

// ==============================================
// INTEREST SWAPS (rows = currency, cols = tenor)
// ==============================================
const SWAPS_ROW_GROUPS = [
  {
    title: "Interest Rate Swaps",
    unit: "%",
    columns: [
      { id: "swap_2y", label: "2Y", ref: "EUR_SWAP_2Y", type: "absolute" },
      { id: "swap_5y", label: "5Y", ref: "EUR_SWAP_5Y", type: "absolute" },
      { id: "swap_10y", label: "10Y", ref: "EUR_SWAP_10Y", type: "absolute" },
    ],
  },
];

const SwapsRowTable = createTableFromGroups(SWAPS_ROW_GROUPS, {
  title: "Interest Rate Swaps",
  headerColor: "bg-teal-600",
  headerTextColor: "text-white",
  rowNames: ["EUR", "USD"], // ✅ rows are currencies
  fontSize: "text-xs",
  firstColumnWidth: "min-w-32",
});

// ==============================================
// GRAPH COMPONENTS
// ==============================================
const COLORS = {
  primary: "#2E86AB",
  secondary: "#E27D60",
  spread: "#57A773",
};

const GraphDualAxis = ({
  title,
  data1,
  data2,
  label1,
  label2,
  showSpread,
  color1,
  color2,
  spreadColor,
  headerColor = "#1e3a8a", // default dark blue
}) => {
  const dates = data1.historical.map((d) => d.date);
  const values1 = data1.historical.map((d) => d.value);
  const values2 = data2.historical.map((d) => d.value);

  const spreadValues =
    showSpread && values1.length === values2.length
      ? values1.map((v1, i) => Math.abs(v1 - values2[i]))
      : null;

  const options = {
    chart: { type: "line", backgroundColor: "transparent", height: 320 },
    title: { text: undefined },
    xAxis: { categories: dates, tickLength: 0 },
    yAxis: [
      { title: { text: label1 }, labels: { format: "{value}" } },
      {
        title: { text: label2 },
        labels: { format: "{value}" },
        opposite: true,
      },
    ],
    tooltip: {
      shared: true,
      crosshairs: true,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#ccc",
      borderRadius: 8,
      shadow: true,
    },
    legend: { enabled: true },
    credits: { enabled: false },
    series: [
      { name: label1, data: values1, color: color1, yAxis: 0 },
      { name: label2, data: values2, color: color2, yAxis: 1 },
      ...(spreadValues
        ? [
            {
              name: "Spread",
              data: spreadValues,
              color: spreadColor,
              dashStyle: "shortdot",
              yAxis: 0,
            },
          ]
        : []),
    ],
  };

  return (
    <div className="w-full rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div
        style={{ backgroundColor: headerColor }}
        className="text-white px-4 py-3 font-semibold rounded-t-lg"
      >
        {title}
      </div>
      <div className="bg-white p-4 rounded-b-lg">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </div>
  );
};

const GraphSingleAxis = ({ title, data, color, headerColor = "#1e3a8a" }) => {
  const dates = data.historical.map((d) => d.date);
  const values = data.historical.map((d) => d.value);

  const options = {
    chart: { type: "line", backgroundColor: "transparent", height: 280 },
    title: { text: undefined },
    xAxis: { categories: dates, tickLength: 0 },
    yAxis: [{ title: { text: data.unit }, labels: { format: "{value}" } }],
    tooltip: {
      shared: true,
      crosshairs: true,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#ccc",
      borderRadius: 8,
      shadow: true,
    },
    legend: { enabled: false },
    credits: { enabled: false },
    series: [{ name: title, data: values, color }],
  };

  return (
    <div className="w-full rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div
        style={{ backgroundColor: headerColor }}
        className="text-white px-4 py-3 font-semibold rounded-t-lg"
      >
        {title}
      </div>
      <div className="bg-white p-4 rounded-b-lg">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </div>
  );
};

// helper goes before equityGroups
const getEquityGroupsFromData2 = (datasets) => {
  const equityKeys = Object.keys(datasets).filter(
    (key) => datasets[key].category === "equity_stock"
  );

  return [
    {
      title: "Companies",
      unit: "EUR",
      columns: equityKeys.map((key) => ({
        id: key.toLowerCase(),
        label: key,
        ref: key,
        type: "equity-stock",
      })),
    },
  ];
};

const getEquityGroupsFromData = (datasets) => {
  const equityKeys = Object.keys(datasets).filter(
    (key) =>
      datasets[key].category === "equity_stock" ||
      datasets[key].category === "equity_index"
  );

  // split into two column groups: Indices & Companies
  const indexCols = equityKeys
    .filter((key) => datasets[key].category === "equity_index")
    .map((key) => ({
      id: key.toLowerCase(),
      label: key,
      ref: key,
      type: "equity-index",
    }));

  const companyCols = equityKeys
    .filter((key) => datasets[key].category === "equity_stock")
    .map((key) => ({
      id: key.toLowerCase(),
      label: key,
      ref: key,
      type: "equity-stock",
    }));

  return [
    {
      title: "Indices",
      unit: "Index Points",
      columns: indexCols,
    },
    {
      title: "Companies",
      unit: "EUR",
      columns: companyCols,
    },
  ];
};

// now you can safely use it
const equityGroups = getEquityGroupsFromData(sampleData.datasets);

const getFxGroupsFromData = (datasets) => {
  // filter datasets that are FX pairs
  const fxKeys = Object.keys(datasets).filter(
    (key) => datasets[key].category === "fx_pair"
  );

  // split into EUR-based vs. other crosses
  const eurPairs = fxKeys.filter((key) => key.startsWith("EUR_"));
  const crossPairs = fxKeys.filter((key) => !key.startsWith("EUR_"));

  const singleCols = eurPairs.map((pair) => ({
    id: pair.toLowerCase(),
    label: pair.replace("_", "/"), // EUR_USD → EUR/USD
    ref: pair,
    type: "fx-pair",
  }));

  const crossCols = crossPairs.map((pair) => ({
    id: pair.toLowerCase(),
    label: pair.replace("_", "/"), // USD_CNY → USD/CNY
    ref: pair,
    type: "fx-pair",
  }));

  return [
    {
      title: "1 EUR = x",
      unit: "Rate",
      columns: singleCols,
    },
    {
      title: "Cross Rates",
      unit: "Rate",
      columns: crossCols,
    },
  ];
};

// adapted table
const fxGroups = getFxGroupsFromData(sampleData.datasets);

const DynamicFXTable = createTableFromGroups(fxGroups, {
  title: "FX Markets",
  headerColor: "bg-purple-600",
  headerTextColor: "text-white",
  rowNames: ["Spot", "Δ since 1 day", "Δ since 1 month", "Δ since 1 year"],
  fontSize: "text-xs",
  firstColumnWidth: "max-w-40",
});

const DynamicEquityTable = createTableFromGroups(equityGroups, {
  title: "Stock Markets (Dynamic)",
  headerColor: "bg-blue-600",
  headerTextColor: "text-white",
  rowNames: [
    "Date",
    "Spot",
    "Δ since 1 day",
    "Δ since 1 month",
    "Δ since 1 year",
    "52w high",
    "52w low",
    "YTD",
  ],
  fontSize: "text-xs",
  firstColumnWidth: "min-w-40",
});

// ==============================================
// MAIN COMPONENT
// ==============================================
// Manual date configuration - adjust this date as needed
const BASE_DATE = "2025-01-15"; // Reference date for spot prices and futures calculations

const FinancialDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);

  // Helper function to get latest date from historical data
  const getLatestSpotDate = (datasets) => {
    const dates = Object.values(datasets)
      .filter((ds) => ds.historical && ds.historical.length > 0)
      .map((ds) => ds.historical[ds.historical.length - 1].date);

    return dates.length > 0
      ? dates.reduce((latest, date) => (date > latest ? date : latest))
      : BASE_DATE;
  };

  const latestSpotDate = getLatestSpotDate(sampleData.datasets);

  const Navigation = () => {
    const pages = [
      { id: 1, name: "Tables", icon: "📊" },
      { id: 2, name: "Graphs", icon: "📈" },
      { id: 3, name: "Metrics Guide", icon: "📖" }, // NEW
    ];
    return (
      <div className="flex gap-2 mb-6">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => setCurrentPage(page.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentPage === page.id
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            <span className="mr-2">{page.icon}</span>
            {page.name}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Financial Dashboard - Now Fully Dynamic!
        </h1>

        <Navigation />

        {currentPage === 1 && (
          <div className="space-y-6">
            <MaterialsTable />
            <ChemicalsTable />
            <AluminumTable />
            <EnergyTable baseDate={BASE_DATE} latestSpotDate={latestSpotDate} />
            <DynamicEquityTable />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MoneyMarketRowTable />
              <SwapsRowTable />
            </div>
            <DynamicFXTable />
          </div>
        )}

        {currentPage === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 3 light green */}
            <GraphDualAxis
              title="DWP in USD/to und Spread DWP/VSF high"
              data1={sampleData.datasets.DWP_USD} // exists in sampleData
              data2={sampleData.datasets.VSF_HIGH}
              label1="DWP (USD/to)"
              label2="VSF High"
              showSpread={true}
              headerColor="#22c55e" // Tailwind green-500
            />

            <GraphDualAxis
              title="CCF Index (VSF high & Lyocell) in CNY/to"
              data1={sampleData.datasets.VSF_HIGH}
              data2={sampleData.datasets.LYO_CN}
              label1="VSF High"
              label2="Lyocell"
              showSpread={false}
              headerColor="#22c55e"
            />

            <GraphDualAxis
              title="Baumwolle ZCE in CNY/MT & ICE in USD/lb"
              data1={sampleData.datasets.COTTON_ZCE}
              data2={sampleData.datasets.COTTON_ICE}
              label1="ZCE (CNY/MT)"
              label2="ICE #2 (USD/lb)"
              showSpread={false}
              headerColor="#22c55e"
            />

            {/* 3 light blue */}
            <GraphSingleAxis
              title="3M-LME Aluminium in USD/to"
              data={sampleData.datasets.LME_ALUMINUM_3M}
              headerColor="#3b82f6" // Tailwind blue-500
            />

            <GraphDualAxis
              title="Tonerde API in USD/to und Verhältnis API/3M-LME"
              data1={sampleData.datasets.TONERDE_API}
              data2={sampleData.datasets.API_LME_RATIO}
              label1="Tonerde API"
              label2="API/LME Ratio"
              showSpread={false}
              headerColor="#3b82f6"
            />

            <GraphDualAxis
              title="3M-LME Premium (US MidWest & Rotterdam) in USD/to"
              data1={sampleData.datasets.LME_PREMIUM_MIDWEST}
              data2={sampleData.datasets.LME_PREMIUM_ROTTERDAM}
              label1="US Midwest"
              label2="Rotterdam"
              showSpread={false}
              headerColor="#3b82f6"
            />

            {/* 2 dark grey */}
            <GraphSingleAxis
              title="EUR/CHF"
              data={sampleData.datasets.EUR_CHF} // changed from EUR_USD ❌
              headerColor="#4b5563" // Tailwind gray-600
            />

            <GraphSingleAxis
              title="Brent Crude Oil in USD/bbl"
              data={sampleData.datasets.BRENT_CRUDE}
              headerColor="#4b5563"
            />
          </div>
        )}

        {currentPage === 3 && (
          <MetricsOverview /> // Your overview component
        )}
      </div>
    </div>
  );
};

export default FinancialDashboard;
