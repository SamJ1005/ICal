import { useState, useMemo } from "react";
import {
  CONVERSION_CATEGORIES,
  NUMBER_BASES,
  COMPUTING_DATA_UNITS,
  MEASURE_UNITS,
  AREA_UNITS,
  WEIGHT_UNITS,
  LIQUID_UNITS,
  TEMPERATURE_UNITS,
  TIME_UNITS,
  CURRENCY_UNITS,
  ETH_UNITS,
  convertNumberBase,
  convertDataStorage,
  convertMeasure,
  convertArea,
  convertWeight,
  convertLiquid,
  convertTemperature,
  convertTime,
  convertCurrency,
  convertEthUnits,
  calculateGasFee
} from "../utils/conversionUtils";
import { playHapticFeedback } from "../utils/haptics";
import BackspaceIcon from "./BackspaceIcon";

// Clean outline SVG icons for categories
function CategoryIcon({ type }) {
  switch (type) {
    case "bases":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9h2v6M9 15h6" />
        </svg>
      );
    case "data":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case "measures":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.5 2.5-19 19M6.5 4.5l3 3M11.5 9.5l3 3M16.5 14.5l3 3" />
        </svg>
      );
    case "area":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V3" />
        </svg>
      );
    case "weight":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v18M5 6h14M3 14l2-8 2 8c0 1.1-.9 2-2 2s-2-.9-2-2zM17 14l2-8 2 8c0 1.1-.9 2-2 2s-2-.9-2-2z" />
        </svg>
      );
    case "liquids":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      );
    case "temperature":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
        </svg>
      );
    case "time":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "currency":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "blockchain":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ConverterView() {
  const [activeCategory, setActiveCategory] = useState("bases");

  // Generic conversion state
  const [inputValue, setInputValue] = useState("100");
  const [fromUnit, setFromUnit] = useState("10");
  const [toUnit, setToUnit] = useState("2");

  // Blockchain state
  const [blockchainTab, setBlockchainTab] = useState("units"); // "units" | "gas"
  const [activeGasField, setActiveGasField] = useState("gasLimit");
  const [gasLimit, setGasLimit] = useState("21000");
  const [baseFeeGwei, setBaseFeeGwei] = useState("30");
  const [priorityFeeGwei, setPriorityFeeGwei] = useState("2");
  const [maxFeeGwei, setMaxFeeGwei] = useState("50");
  const [gasUsed, setGasUsed] = useState("21000");
  const [ethPriceFiat, setEthPriceFiat] = useState("300000");
  const [fiatCurrency, setFiatCurrency] = useState("INR"); // "INR" | "USD"
  const [showEduInfo, setShowEduInfo] = useState(false);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    if (catId === "bases") {
      setFromUnit("10");
      setToUnit("2");
      setInputValue("100");
    } else if (catId === "data") {
      setFromUnit("MB");
      setToUnit("GB");
      setInputValue("1024");
    } else if (catId === "measures") {
      setFromUnit("m");
      setToUnit("ft");
      setInputValue("10");
    } else if (catId === "area") {
      setFromUnit("m2");
      setToUnit("ft2");
      setInputValue("100");
    } else if (catId === "weight") {
      setFromUnit("kg");
      setToUnit("lb");
      setInputValue("5");
    } else if (catId === "liquids") {
      setFromUnit("l");
      setToUnit("gal");
      setInputValue("10");
    } else if (catId === "temperature") {
      setFromUnit("C");
      setToUnit("F");
      setInputValue("25");
    } else if (catId === "time") {
      setFromUnit("hr");
      setToUnit("min");
      setInputValue("2");
    } else if (catId === "currency") {
      setFromUnit("USD");
      setToUnit("INR");
      setInputValue("100");
    } else if (catId === "blockchain") {
      setFromUnit("gwei");
      setToUnit("ether");
      setInputValue("1000000000");
    }
  };

  const handleGasPreset = (limit, used, base = "30", tip = "2", max = "50") => {
    playHapticFeedback();
    setGasLimit(String(limit));
    setGasUsed(String(used));
    setBaseFeeGwei(String(base));
    setPriorityFeeGwei(String(tip));
    setMaxFeeGwei(String(max));
  };

  const getGasFieldSetter = (field) => {
    switch (field) {
      case "gasLimit":
        return setGasLimit;
      case "baseFee":
        return setBaseFeeGwei;
      case "priorityFee":
        return setPriorityFeeGwei;
      case "maxFee":
        return setMaxFeeGwei;
      case "gasUsed":
        return setGasUsed;
      case "ethPrice":
        return setEthPriceFiat;
      default:
        return setGasLimit;
    }
  };

  // Dedicated on-screen keypad inputs (prevents mobile software keyboard from opening)
  const handleKeypadPress = (val) => {
    playHapticFeedback();
    if (activeCategory === "blockchain" && blockchainTab === "gas") {
      const currentSetter = getGasFieldSetter(activeGasField);

      currentSetter((prev) => {
        if (prev === "0" && val !== ".") return val;
        if (val === "." && prev.includes(".")) return prev;
        return prev + val;
      });
      return;
    }

    setInputValue((prev) => {
      if (prev === "0" && val !== ".") return val;
      if (val === "." && prev.includes(".")) return prev;
      return prev + val;
    });
  };

  const handleKeypadBackspace = () => {
    playHapticFeedback();
    if (activeCategory === "blockchain" && blockchainTab === "gas") {
      const currentSetter = getGasFieldSetter(activeGasField);
      currentSetter((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
      return;
    }

    setInputValue((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  };

  const handleKeypadClear = () => {
    playHapticFeedback();
    if (activeCategory === "blockchain" && blockchainTab === "gas") {
      const currentSetter = getGasFieldSetter(activeGasField);
      currentSetter("0");
      return;
    }

    setInputValue("0");
  };

  const handleSwapUnits = () => {
    playHapticFeedback();
    const prevFrom = fromUnit;
    setFromUnit(toUnit);
    setToUnit(prevFrom);
    if (convertedResult && convertedResult !== "Invalid Input" && convertedResult !== "Error") {
      setInputValue(convertedResult);
    }
  };

  const handleToggleSign = () => {
    playHapticFeedback();
    if (activeCategory === "blockchain" && blockchainTab === "gas") {
      return;
    }
    setInputValue((prev) => {
      if (!prev || prev === "0") return "0";
      if (prev.startsWith("-")) return prev.slice(1);
      return "-" + prev;
    });
  };

  // Compute conversion result
  const convertedResult = useMemo(() => {
    if (!inputValue || inputValue.trim() === "") return "";

    if (activeCategory === "bases") {
      return convertNumberBase(inputValue, fromUnit, toUnit);
    } else if (activeCategory === "data") {
      return convertDataStorage(inputValue, fromUnit, toUnit);
    } else if (activeCategory === "measures") {
      return convertMeasure(inputValue, fromUnit, toUnit);
    } else if (activeCategory === "area") {
      return convertArea(inputValue, fromUnit, toUnit);
    } else if (activeCategory === "weight") {
      return convertWeight(inputValue, fromUnit, toUnit);
    } else if (activeCategory === "liquids") {
      return convertLiquid(inputValue, fromUnit, toUnit);
    } else if (activeCategory === "temperature") {
      return convertTemperature(inputValue, fromUnit, toUnit);
    } else if (activeCategory === "time") {
      return convertTime(inputValue, fromUnit, toUnit);
    } else if (activeCategory === "currency") {
      return convertCurrency(inputValue, fromUnit, toUnit);
    } else if (activeCategory === "blockchain") {
      return convertEthUnits(inputValue, fromUnit, toUnit);
    }
    return "";
  }, [activeCategory, inputValue, fromUnit, toUnit]);

  // Compute Full EIP-1559 Ethereum Gas Results
  const gasResults = useMemo(() => {
    return calculateGasFee({
      gasLimit,
      baseFeeGwei,
      priorityFeeGwei,
      maxFeeGwei,
      gasUsed,
      ethPriceFiat,
      fiatCurrency
    });
  }, [gasLimit, baseFeeGwei, priorityFeeGwei, maxFeeGwei, gasUsed, ethPriceFiat, fiatCurrency]);

  const isHexInput = activeCategory === "bases" && fromUnit === "16";

  return (
    <div className="converter-container">
      {/* Category Pills Header (Compact at top with Outline SVGs) */}
      <div className="converter-category-scroll">
        <div className="converter-category-tabs">
          {CONVERSION_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`converter-tab-btn ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              <span className="tab-icon">
                <CategoryIcon type={cat.iconType} />
              </span>
              <span className="tab-label">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Submode Selector for Blockchain */}
      {activeCategory === "blockchain" && (
        <div className="submode-switcher">
          <button
            className={`submode-btn ${blockchainTab === "units" ? "active" : ""}`}
            onClick={() => {
              playHapticFeedback();
              setBlockchainTab("units");
            }}
          >
            ETH Units (Wei/Gwei/ETH)
          </button>
          <button
            className={`submode-btn ${blockchainTab === "gas" ? "active" : ""}`}
            onClick={() => {
              playHapticFeedback();
              setBlockchainTab("gas");
            }}
          >
            Gas & Fee (EIP-1559)
          </button>
        </div>
      )}

      {/* CONVERSION DISPLAY CARDS OR EIP-1559 GAS CALCULATOR */}
      {activeCategory !== "blockchain" || blockchainTab === "units" ? (
        <div className="converter-display-card">
          {/* FROM CARD */}
          <div className="conv-card from-card">
            <div className="conv-card-meta">
              <span className="conv-card-tag">FROM</span>
              <select
                className="conv-select"
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
              >
                {activeCategory === "bases" &&
                  NUMBER_BASES.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}

                {activeCategory === "data" &&
                  COMPUTING_DATA_UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}

                {activeCategory === "measures" &&
                  MEASURE_UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}

                {activeCategory === "area" &&
                  AREA_UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}

                {activeCategory === "weight" &&
                  WEIGHT_UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}

                {activeCategory === "liquids" &&
                  LIQUID_UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}

                {activeCategory === "temperature" &&
                  TEMPERATURE_UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}

                {activeCategory === "time" &&
                  TIME_UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}

                {activeCategory === "currency" &&
                  CURRENCY_UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}

                {activeCategory === "blockchain" &&
                  ETH_UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            {/* Display value instead of native input to prevent software keyboard */}
            <div className="conv-value-display active-from">{inputValue}</div>
          </div>

          <div className="conv-swap-divider">
            <button
              type="button"
              className="conv-swap-btn"
              onClick={handleSwapUnits}
              title="Swap units"
              aria-label="Swap units"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 10v12" />
                <path d="M17 14V2" />
                <path d="m11 6-4-4-4 4" />
                <path d="m21 18-4 4-4-4" />
              </svg>
            </button>
          </div>

          {/* TO CARD */}
          <div className="conv-card to-card">
            <div className="conv-card-meta">
              <span className="conv-card-tag">TO</span>
              <select
                className="conv-select"
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
              >
                {activeCategory === "bases" &&
                  NUMBER_BASES.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}

                {activeCategory === "data" &&
                  COMPUTING_DATA_UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}

                {activeCategory === "measures" &&
                  MEASURE_UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}

                {activeCategory === "area" &&
                  AREA_UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}

                {activeCategory === "weight" &&
                  WEIGHT_UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}

                {activeCategory === "liquids" &&
                  LIQUID_UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}

                {activeCategory === "temperature" &&
                  TEMPERATURE_UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}

                {activeCategory === "time" &&
                  TIME_UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}

                {activeCategory === "currency" &&
                  CURRENCY_UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}

                {activeCategory === "blockchain" &&
                  ETH_UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="conv-value-display result-to">{convertedResult || "0"}</div>
          </div>
        </div>
      ) : (
        /* ENHANCED EIP-1559 ETHEREUM GAS CALCULATOR */
        <div className="gas-calculator-display">
          {/* Presets Row */}
          <div className="gas-presets-bar">
            <span className="gas-preset-hint">Typical Presets:</span>
            <button
              className={`gas-preset-chip ${gasLimit === "21000" && gasUsed === "21000" ? "active" : ""}`}
              onClick={() => handleGasPreset(21000, 21000, 30, 2, 50)}
              title="Standard ETH transfer"
            >
              Standard (21k)
            </button>
            <button
              className={`gas-preset-chip ${gasLimit === "65000" && gasUsed === "65000" ? "active" : ""}`}
              onClick={() => handleGasPreset(65000, 65000, 30, 2, 50)}
              title="ERC-20 token transfer"
            >
              ERC-20 (65k)
            </button>
            <button
              className={`gas-preset-chip ${gasLimit === "160000" && gasUsed === "160000" ? "active" : ""}`}
              onClick={() => handleGasPreset(160000, 160000, 30, 2, 50)}
              title="Uniswap or Complex Swap"
            >
              Swap (160k)
            </button>
          </div>

          {/* Validation Warnings */}
          {gasResults.warnings && gasResults.warnings.length > 0 && (
            <div className="gas-warning-banner">
              ⚠️ {gasResults.warnings[0]}
            </div>
          )}

          {/* 5-Parameter Interactive Input Chips */}
          <div className="gas-fields-grid">
            <button
              className={`gas-field-chip ${activeGasField === "gasLimit" ? "active" : ""}`}
              onClick={() => {
                playHapticFeedback();
                setActiveGasField("gasLimit");
              }}
            >
              <span className="field-lbl">Gas Limit</span>
              <span className="field-val">{gasLimit}</span>
            </button>

            <button
              className={`gas-field-chip ${activeGasField === "gasUsed" ? "active" : ""}`}
              onClick={() => {
                playHapticFeedback();
                setActiveGasField("gasUsed");
              }}
            >
              <span className="field-lbl">Gas Used</span>
              <span className="field-val">{gasUsed}</span>
            </button>

            <button
              className={`gas-field-chip ${activeGasField === "baseFee" ? "active" : ""}`}
              onClick={() => {
                playHapticFeedback();
                setActiveGasField("baseFee");
              }}
            >
              <span className="field-lbl">Base (Gwei)</span>
              <span className="field-val">{baseFeeGwei}</span>
            </button>

            <button
              className={`gas-field-chip ${activeGasField === "priorityFee" ? "active" : ""}`}
              onClick={() => {
                playHapticFeedback();
                setActiveGasField("priorityFee");
              }}
            >
              <span className="field-lbl">Tip (Gwei)</span>
              <span className="field-val">{priorityFeeGwei}</span>
            </button>

            <button
              className={`gas-field-chip ${activeGasField === "maxFee" ? "active" : ""}`}
              onClick={() => {
                playHapticFeedback();
                setActiveGasField("maxFee");
              }}
            >
              <span className="field-lbl">Max Fee</span>
              <span className="field-val">{maxFeeGwei}</span>
            </button>
          </div>

          {/* Fee Output Summary Cards */}
          <div className="gas-summary-card">
            <div className="gas-main-val">
              <span className="lbl">Transaction Fee:</span>
              <span className="val eth">{gasResults.actualGasFeeEth} ETH</span>
            </div>
            <div className="gas-units-subrow">
              <span className="gwei-val">{gasResults.actualGasFeeGwei?.toLocaleString()} Gwei</span>
              <span className="bullet">•</span>
              <span className="wei-val">{gasResults.actualGasFeeWei} Wei</span>
            </div>

            <div className="gas-sub-val">
              <span>Effective Price: <strong>{gasResults.effectiveGasPriceGwei} Gwei</strong></span>
              <span>Gas Used: <strong>{gasUsed} / {gasLimit} ({gasResults.gasUsedPercentage}%)</strong></span>
            </div>
            <div className="gas-sub-val">
              <span>Max Cap Fee: <strong>{gasResults.maxPossibleFeeEth} ETH</strong> ({gasResults.maxPossibleFeeGwei?.toLocaleString()} Gwei)</span>
            </div>

            {/* Optional Fiat Estimation */}
            <div className="gas-fiat-row">
              <div className="fiat-calc-group">
                <span className="fiat-lbl">Est. Fiat Cost:</span>
                <span className="fiat-val">
                  {fiatCurrency === "INR" ? "₹" : "$"}{gasResults.estimatedFiatCost}
                </span>
                <span className="fiat-note">
                  (at {fiatCurrency === "INR" ? "₹" : "$"}{Number(ethPriceFiat).toLocaleString()}/ETH)
                </span>
              </div>
              <div className="fiat-actions">
                <button
                  className="fiat-curr-toggle"
                  onClick={() => {
                    playHapticFeedback();
                    setFiatCurrency((prev) => (prev === "INR" ? "USD" : "INR"));
                  }}
                >
                  {fiatCurrency}
                </button>
                <button
                  className={`fiat-price-chip ${activeGasField === "ethPrice" ? "active" : ""}`}
                  onClick={() => {
                    playHapticFeedback();
                    setActiveGasField("ethPrice");
                  }}
                >
                  Edit Price
                </button>
              </div>
            </div>

            {/* Educational Accordion Toggle */}
            <button
              className="gas-edu-toggle-btn"
              onClick={() => {
                playHapticFeedback();
                setShowEduInfo(!showEduInfo);
              }}
            >
              <span>ℹ️ How Ethereum Gas Works</span>
              <span>{showEduInfo ? "▲" : "▼"}</span>
            </button>

            {showEduInfo && (
              <div className="gas-edu-card">
                <div className="edu-item">
                  <strong>Base Fee vs Priority Fee:</strong> Base Fee is algorithmically set by Ethereum and burned (destroyed). Priority fee is a direct tip to the validator.
                </div>
                <div className="edu-item">
                  <strong>Gas Used:</strong> Actual gas consumed ({gasUsed}). Fee uses Gas Used, not Limit!
                </div>
                <div className="edu-item">
                  <strong>EIP-1559 Model:</strong> Effective Gas Price = min(Max Fee, Base Fee + Tip).
                </div>
                <div className="edu-item">
                  <strong>Formula:</strong> Fee = {gasUsed} × {gasResults.effectiveGasPriceGwei} Gwei = {gasResults.actualGasFeeEth} ETH.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hexadecimal Extra Letters Row (if Base 16) */}
      {isHexInput && (
        <div className="hex-keys-row">
          {["A", "B", "C", "D", "E", "F"].map((hex) => (
            <button key={hex} className="hex-key" onClick={() => handleKeypadPress(hex)}>
              {hex}
            </button>
          ))}
        </div>
      )}

      {/* ON-SCREEN CALCULATOR KEYPAD (Prevents Mobile Keyboard) */}
      <div className="converter-keypad">
        <button className="utility" onClick={handleKeypadClear}>AC</button>
        <button className="utility" onClick={handleKeypadBackspace} aria-label="Backspace" title="Backspace">
          <BackspaceIcon />
        </button>
        <button className="utility" onClick={handleSwapUnits} title="Swap units" aria-label="Swap units">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 10v12" />
            <path d="M17 14V2" />
            <path d="m11 6-4-4-4 4" />
            <path d="m21 18-4 4-4-4" />
          </svg>
        </button>
        <button className="utility" onClick={handleToggleSign} title="Positive/Negative" aria-label="Positive/Negative">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="4" x2="12" y2="12" />
            <line x1="8" y1="8" x2="16" y2="8" />
            <line x1="8" y1="18" x2="16" y2="18" />
          </svg>
        </button>

        <button className="number" onClick={() => handleKeypadPress("7")}>7</button>
        <button className="number" onClick={() => handleKeypadPress("8")}>8</button>
        <button className="number" onClick={() => handleKeypadPress("9")}>9</button>
        <button className="number" onClick={() => handleKeypadPress("00")}>00</button>

        <button className="number" onClick={() => handleKeypadPress("4")}>4</button>
        <button className="number" onClick={() => handleKeypadPress("5")}>5</button>
        <button className="number" onClick={() => handleKeypadPress("6")}>6</button>
        <button className="number" onClick={() => handleKeypadPress("0")}>0</button>

        <button className="number" onClick={() => handleKeypadPress("1")}>1</button>
        <button className="number" onClick={() => handleKeypadPress("2")}>2</button>
        <button className="number" onClick={() => handleKeypadPress("3")}>3</button>
        <button className="number" onClick={() => handleKeypadPress(".")}>.</button>
      </div>
    </div>
  );
}
