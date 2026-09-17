// Comprehensive Unit and Blockchain Conversion Utilities

export const CONVERSION_CATEGORIES = [
  { id: "bases", name: "Bases", iconType: "bases" },
  { id: "data", name: "Data", iconType: "data" },
  { id: "measures", name: "Measures", iconType: "measures" },
  { id: "area", name: "Area", iconType: "area" },
  { id: "weight", name: "Weight", iconType: "weight" },
  { id: "liquids", name: "Liquids", iconType: "liquids" },
  { id: "temperature", name: "Temperature", iconType: "temperature" },
  { id: "time", name: "Time", iconType: "time" },
  { id: "currency", name: "Currency", iconType: "currency" },
  { id: "blockchain", name: "Blockchain", iconType: "blockchain" }
];

// 1. Computing Units (Base storage relative to Bytes, and Number Bases)
export const COMPUTING_DATA_UNITS = [
  { id: "b", name: "Bits (b)", factor: 0.125 },
  { id: "B", name: "Bytes (B)", factor: 1 },
  { id: "KB", name: "Kilobytes (KB)", factor: 1024 },
  { id: "MB", name: "Megabytes (MB)", factor: 1024 ** 2 },
  { id: "GB", name: "Gigabytes (GB)", factor: 1024 ** 3 },
  { id: "TB", name: "Terabytes (TB)", factor: 1024 ** 4 },
  { id: "PB", name: "Petabytes (PB)", factor: 1024 ** 5 }
];

export const NUMBER_BASES = [
  { id: "10", name: "Decimal (Base 10)" },
  { id: "2", name: "Binary (Base 2)" },
  { id: "8", name: "Octal (Base 8)" },
  { id: "16", name: "Hexadecimal (Base 16)" }
];

export function convertNumberBase(valueStr, fromBase, toBase) {
  if (!valueStr || valueStr.trim() === "") return "";
  try {
    const cleanStr = valueStr.trim().replace(/^0x/i, "");
    const parsed = parseInt(cleanStr, parseInt(fromBase, 10));
    if (isNaN(parsed)) return "Invalid Input";
    return parsed.toString(parseInt(toBase, 10)).toUpperCase();
  } catch (e) {
    return "Error";
  }
}

export function convertDataStorage(val, fromUnit, toUnit) {
  const num = parseFloat(val);
  if (isNaN(num)) return "";
  const fromFactor = COMPUTING_DATA_UNITS.find(u => u.id === fromUnit)?.factor || 1;
  const toFactor = COMPUTING_DATA_UNITS.find(u => u.id === toUnit)?.factor || 1;
  const inBytes = num * fromFactor;
  const converted = inBytes / toFactor;
  return Number.isInteger(converted) ? String(converted) : String(parseFloat(converted.toFixed(8)));
}

// 2. Measures / Length (Base: Meters)
export const MEASURE_UNITS = [
  { id: "mm", name: "Millimeters (mm)", factor: 0.001 },
  { id: "cm", name: "Centimeters (cm)", factor: 0.01 },
  { id: "m", name: "Meters (m)", factor: 1 },
  { id: "km", name: "Kilometers (km)", factor: 1000 },
  { id: "in", name: "Inches (in)", factor: 0.0254 },
  { id: "ft", name: "Feet (ft)", factor: 0.3048 },
  { id: "yd", name: "Yards (yd)", factor: 0.9144 },
  { id: "mi", name: "Miles (mi)", factor: 1609.344 },
  { id: "nmi", name: "Nautical Miles (nmi)", factor: 1852 }
];

export function convertMeasure(val, fromUnit, toUnit) {
  const num = parseFloat(val);
  if (isNaN(num)) return "";
  const fromFactor = MEASURE_UNITS.find(u => u.id === fromUnit)?.factor || 1;
  const toFactor = MEASURE_UNITS.find(u => u.id === toUnit)?.factor || 1;
  const inMeters = num * fromFactor;
  const converted = inMeters / toFactor;
  return Number.isInteger(converted) ? String(converted) : String(parseFloat(converted.toFixed(8)));
}

// 3. Weight / Mass (Base: Kilograms)
export const WEIGHT_UNITS = [
  { id: "mg", name: "Milligrams (mg)", factor: 0.000001 },
  { id: "g", name: "Grams (g)", factor: 0.001 },
  { id: "kg", name: "Kilograms (kg)", factor: 1 },
  { id: "ton", name: "Metric Ton (t)", factor: 1000 },
  { id: "oz", name: "Ounces (oz)", factor: 0.028349523125 },
  { id: "lb", name: "Pounds (lb)", factor: 0.45359237 },
  { id: "stone", name: "Stone (st)", factor: 6.35029318 }
];

export function convertWeight(val, fromUnit, toUnit) {
  const num = parseFloat(val);
  if (isNaN(num)) return "";
  const fromFactor = WEIGHT_UNITS.find(u => u.id === fromUnit)?.factor || 1;
  const toFactor = WEIGHT_UNITS.find(u => u.id === toUnit)?.factor || 1;
  const inKg = num * fromFactor;
  const converted = inKg / toFactor;
  return Number.isInteger(converted) ? String(converted) : String(parseFloat(converted.toFixed(8)));
}

// 4. Liquids / Volume (Base: Liters)
export const LIQUID_UNITS = [
  { id: "ml", name: "Milliliters (ml)", factor: 0.001 },
  { id: "l", name: "Liters (l)", factor: 1 },
  { id: "m3", name: "Cubic Meters (m³)", factor: 1000 },
  { id: "tsp", name: "Teaspoons (US tsp)", factor: 0.00492892 },
  { id: "tbsp", name: "Tablespoons (US tbsp)", factor: 0.0147868 },
  { id: "floz", name: "Fluid Ounces (US fl oz)", factor: 0.0295735 },
  { id: "cup", name: "Cups (US cup)", factor: 0.236588 },
  { id: "pt", name: "Pints (US pt)", factor: 0.473176 },
  { id: "qt", name: "Quarts (US qt)", factor: 0.946353 },
  { id: "gal", name: "Gallons (US gal)", factor: 3.78541 }
];

export function convertLiquid(val, fromUnit, toUnit) {
  const num = parseFloat(val);
  if (isNaN(num)) return "";
  const fromFactor = LIQUID_UNITS.find(u => u.id === fromUnit)?.factor || 1;
  const toFactor = LIQUID_UNITS.find(u => u.id === toUnit)?.factor || 1;
  const inLiters = num * fromFactor;
  const converted = inLiters / toFactor;
  return Number.isInteger(converted) ? String(converted) : String(parseFloat(converted.toFixed(8)));
}

// 5. Area Units (Base: Square Meters m²)
export const AREA_UNITS = [
  { id: "mm2", name: "Sq. Millimeters (mm²)", factor: 0.000001 },
  { id: "cm2", name: "Sq. Centimeters (cm²)", factor: 0.0001 },
  { id: "m2", name: "Sq. Meters (m²)", factor: 1 },
  { id: "km2", name: "Sq. Kilometers (km²)", factor: 1000000 },
  { id: "in2", name: "Sq. Inches (sq in)", factor: 0.00064516 },
  { id: "ft2", name: "Sq. Feet (sq ft)", factor: 0.09290304 },
  { id: "yd2", name: "Sq. Yards (sq yd)", factor: 0.83612736 },
  { id: "ac", name: "Acres (ac)", factor: 4046.8564224 },
  { id: "ha", name: "Hectares (ha)", factor: 10000 }
];

export function convertArea(val, fromUnit, toUnit) {
  const num = parseFloat(val);
  if (isNaN(num)) return "";
  const fromFactor = AREA_UNITS.find(u => u.id === fromUnit)?.factor || 1;
  const toFactor = AREA_UNITS.find(u => u.id === toUnit)?.factor || 1;
  const inSqMeters = num * fromFactor;
  const converted = inSqMeters / toFactor;
  return Number.isInteger(converted) ? String(converted) : String(parseFloat(converted.toFixed(8)));
}

// 6. Temperature Units (Affine mapping: C, F, K)
export const TEMPERATURE_UNITS = [
  { id: "C", name: "Celsius (°C)" },
  { id: "F", name: "Fahrenheit (°F)" },
  { id: "K", name: "Kelvin (K)" }
];

export function convertTemperature(val, fromUnit, toUnit) {
  const num = parseFloat(val);
  if (isNaN(num)) return "";
  let celsius;
  if (fromUnit === "C") celsius = num;
  else if (fromUnit === "F") celsius = (num - 32) * (5 / 9);
  else if (fromUnit === "K") celsius = num - 273.15;
  else celsius = num;

  let converted;
  if (toUnit === "C") converted = celsius;
  else if (toUnit === "F") converted = (celsius * 9 / 5) + 32;
  else if (toUnit === "K") converted = celsius + 273.15;
  else converted = celsius;

  return Number.isInteger(converted) ? String(converted) : String(parseFloat(converted.toFixed(4)));
}

// 7. Time Units (Base: Seconds s)
export const TIME_UNITS = [
  { id: "ms", name: "Milliseconds (ms)", factor: 0.001 },
  { id: "s", name: "Seconds (s)", factor: 1 },
  { id: "min", name: "Minutes (min)", factor: 60 },
  { id: "hr", name: "Hours (hr)", factor: 3600 },
  { id: "d", name: "Days (d)", factor: 86400 },
  { id: "wk", name: "Weeks (wk)", factor: 604800 },
  { id: "mo", name: "Months (30.4d)", factor: 2629746 },
  { id: "yr", name: "Years (365.25d)", factor: 31556952 }
];

export function convertTime(val, fromUnit, toUnit) {
  const num = parseFloat(val);
  if (isNaN(num)) return "";
  const fromFactor = TIME_UNITS.find(u => u.id === fromUnit)?.factor || 1;
  const toFactor = TIME_UNITS.find(u => u.id === toUnit)?.factor || 1;
  const inSeconds = num * fromFactor;
  const converted = inSeconds / toFactor;
  return Number.isInteger(converted) ? String(converted) : String(parseFloat(converted.toFixed(8)));
}

// 8. Currency Units (Benchmark rates relative to USD)
export const CURRENCY_UNITS = [
  { id: "USD", name: "US Dollar ($)", symbol: "$", factor: 1.0 },
  { id: "EUR", name: "Euro (€)", symbol: "€", factor: 0.92 },
  { id: "GBP", name: "British Pound (£)", symbol: "£", factor: 0.78 },
  { id: "INR", name: "Indian Rupee (₹)", symbol: "₹", factor: 86.5 },
  { id: "AED", name: "UAE Dirham / Dubai (AED)", symbol: "AED", factor: 3.67 },
  { id: "SGD", name: "Singapore Dollar (S$)", symbol: "S$", factor: 1.151951 }, // 1 SGD = 75.09 INR
  { id: "MYR", name: "Malaysian Ringgit (RM)", symbol: "RM", factor: 4.42 },
  { id: "JPY", name: "Japanese Yen (¥)", symbol: "¥", factor: 152.0 },
  { id: "CAD", name: "Canadian Dollar (C$)", symbol: "C$", factor: 1.38 },
  { id: "AUD", name: "Australian Dollar (A$)", symbol: "A$", factor: 1.54 },
  { id: "CHF", name: "Swiss Franc (Fr)", symbol: "Fr", factor: 0.88 },
  { id: "CNY", name: "Chinese Yuan (¥)", symbol: "¥", factor: 7.24 }
];

export function convertCurrency(val, fromUnit, toUnit) {
  const num = parseFloat(val);
  if (isNaN(num)) return "";
  const fromFactor = CURRENCY_UNITS.find(u => u.id === fromUnit)?.factor || 1;
  const toFactor = CURRENCY_UNITS.find(u => u.id === toUnit)?.factor || 1;
  const inUSD = num / fromFactor;
  const converted = inUSD * toFactor;
  return Number.isInteger(converted) ? String(converted) : String(parseFloat(converted.toFixed(4)));
}

// 9. Blockchain (Ethereum / Web3 Units & Gas Calculator)
export const ETH_UNITS = [
  { id: "wei", name: "Wei", decimals: 0 },
  { id: "kwei", name: "Kwei / Babbage", decimals: 3 },
  { id: "mwei", name: "Mwei / Lovelace", decimals: 6 },
  { id: "gwei", name: "Gwei / Shannon", decimals: 9 },
  { id: "szabo", name: "Szabo", decimals: 12 },
  { id: "finney", name: "Finney", decimals: 15 },
  { id: "ether", name: "Ether (ETH)", decimals: 18 }
];

export function convertEthUnits(val, fromUnit, toUnit) {
  if (!val || String(val).trim() === "" || isNaN(val)) return "";
  try {
    const fromDec = ETH_UNITS.find(u => u.id === fromUnit)?.decimals ?? 18;
    const toDec = ETH_UNITS.find(u => u.id === toUnit)?.decimals ?? 18;
    const diff = fromDec - toDec;

    if (diff === 0) return String(val);

    const strVal = String(val).trim();
    const [intPart, fracPart = ""] = strVal.split(".");

    if (diff > 0) {
      if (fracPart.length <= diff) {
        const paddedFrac = fracPart.padEnd(diff, "0");
        const combined = (intPart === "0" ? "" : intPart) + paddedFrac;
        const clean = combined.replace(/^0+(?=\d)/, "");
        return clean || "0";
      } else {
        const scaledInt = intPart + fracPart.slice(0, diff);
        const remainingFrac = fracPart.slice(diff);
        const clean = `${scaledInt}.${remainingFrac}`.replace(/^0+(?=\d)/, "");
        return clean || "0";
      }
    } else {
      const absDiff = Math.abs(diff);
      const wholeStr = intPart.padStart(absDiff + 1, "0");
      const splitIdx = wholeStr.length - absDiff;
      let newInt = wholeStr.slice(0, splitIdx);
      let newFrac = wholeStr.slice(splitIdx) + fracPart;
      newFrac = newFrac.replace(/0+$/, "");
      newInt = newInt.replace(/^0+(?=\d)/, "") || "0";
      return newFrac ? `${newInt}.${newFrac}` : newInt;
    }
  } catch (e) {
    return "Error";
  }
}

// Full EIP-1559 Ethereum Gas Fee & Usage Calculator
export function calculateGasFee({
  gasLimit = 21000,
  baseFeeGwei = 30,
  priorityFeeGwei = 2,
  maxFeeGwei = 50,
  gasUsed = 21000,
  ethPriceFiat = 300000,
  fiatCurrency = "INR"
}) {
  const limit = parseFloat(gasLimit) || 0;
  const base = parseFloat(baseFeeGwei) || 0;
  const priority = parseFloat(priorityFeeGwei) || 0;
  const maxFee = parseFloat(maxFeeGwei) || 0;
  const used = parseFloat(gasUsed) || 0;
  const ethPrice = parseFloat(ethPriceFiat) || 0;

  let warning = "";
  if (limit <= 0 || used <= 0) {
    warning = "Gas limit and gas used must be positive numbers.";
  } else if (used > limit) {
    warning = "Gas Used cannot exceed Gas Limit.";
  } else if (maxFee < base) {
    warning = "Max Fee Per Gas cannot be lower than Base Fee.";
  }

  // EIP-1559 Formula:
  // Effective Gas Price = min(Max Fee Per Gas, Base Fee + Priority Fee)
  const effectiveGasPriceGwei = Math.min(maxFee, base + priority);

  // Actual Priority Fee = min(Priority Fee, max(0, Max Fee Per Gas - Base Fee))
  const actualPriorityFeeGwei = Math.min(priority, Math.max(0, maxFee - base));

  // Fee breakdown components
  const baseFeeComponentGwei = used * base;
  const priorityFeeComponentGwei = used * actualPriorityFeeGwei;

  // Actual Transaction Fee = Gas Used * Effective Gas Price
  const actualGasFeeGwei = used * effectiveGasPriceGwei;
  const actualGasFeeEth = actualGasFeeGwei / 1e9;

  // Exact Wei using BigInt precision
  let actualGasFeeWei = "0";
  try {
    const gweiScaled = Math.round(actualGasFeeGwei);
    actualGasFeeWei = (BigInt(gweiScaled) * 1000000000n).toString();
  } catch (e) {
    actualGasFeeWei = String(Math.round(actualGasFeeGwei * 1e9));
  }

  // Maximum Possible Fee = Gas Limit * Max Fee Per Gas
  const maxPossibleFeeGwei = limit * maxFee;
  const maxPossibleFeeEth = maxPossibleFeeGwei / 1e9;

  let maxPossibleFeeWei = "0";
  try {
    const maxGweiScaled = Math.round(maxPossibleFeeGwei);
    maxPossibleFeeWei = (BigInt(maxGweiScaled) * 1000000000n).toString();
  } catch (e) {
    maxPossibleFeeWei = String(Math.round(maxPossibleFeeGwei * 1e9));
  }

  // Gas Used Percentage (do not exceed 100% when used > limit)
  const gasUsedPct = limit > 0 ? Math.min(100, (used / limit) * 100) : 100;

  // Optional Fiat Cost
  const fiatCost = ethPrice > 0 ? (actualGasFeeEth * ethPrice).toFixed(2) : "0.00";

  return {
    limit,
    used,
    base,
    priority,
    maxFee,
    effectiveGasPriceGwei,
    actualPriorityFeeGwei,
    baseFeeComponentGwei,
    priorityFeeComponentGwei,
    actualGasFeeGwei,
    actualGasFeeEth: parseFloat(actualGasFeeEth.toFixed(8)),
    actualGasFeeWei,
    maxPossibleFeeGwei,
    maxPossibleFeeEth: parseFloat(maxPossibleFeeEth.toFixed(8)),
    maxPossibleFeeWei,
    gasUsedPct: parseFloat(gasUsedPct.toFixed(1)),
    warning,
    fiatCost,
    fiatCurrency
  };
}
