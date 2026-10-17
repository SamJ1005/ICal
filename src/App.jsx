import { useState, useEffect, useMemo, useRef } from "react";
import HistoryDrawer from "./components/HistoryDrawer";
import ConverterView from "./components/ConverterView";
import BackspaceIcon from "./components/BackspaceIcon";
import { playHapticFeedback } from "./utils/haptics";
import { buildDisplayTokens, formatNumberWithCommas } from "./utils/conversionUtils";
import "./App.css";

const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;

function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= Math.min(n, 100); i++) res *= i;
  return res;
}

function evaluateExpression(exprStr, angleMode = "deg") {
  if (!exprStr || exprStr.trim() === "" || exprStr === "0") return "";

  try {
    let s = exprStr
      .replace(/×/g, "*")
      .replace(/−/g, "-")
      .replace(/÷/g, "/")
      .trim();

    while (s.length > 0 && /[\+\-\*\/\^]$/.test(s.trim())) {
      s = s.trim().slice(0, -1).trim();
    }

    if (!s) return "";

    s = s.replace(/(\d+(?:\.\d+)?)\s*([\+\-])\s*(\d+(?:\.\d+)?)\%/g, (match, p1, op, p2) => {
      const base = parseFloat(p1);
      const pct = parseFloat(p2) / 100;
      return `${p1} ${op} (${base * pct})`;
    });

    s = s.replace(/(\d+(?:\.\d+)?)\%/g, "($1/100)");
    s = s.replace(/π/g, `(${Math.PI})`);
    s = s.replace(/\be\b/g, `(${Math.E})`);
    s = s.replace(/\^/g, "**");
    s = s.replace(/√\s*(\d+(?:\.\d+)?|\([^\)]+\))/g, "Math.sqrt($1)");
    s = s.replace(/(\d+)!/g, "factorial($1)");

    if (angleMode === "deg") {
      s = s.replace(/sin\(([^)]+)\)/g, "Math.sin(($1) * Math.PI / 180)");
      s = s.replace(/cos\(([^)]+)\)/g, "Math.cos(($1) * Math.PI / 180)");
      s = s.replace(/tan\(([^)]+)\)/g, "Math.tan(($1) * Math.PI / 180)");
    } else {
      s = s.replace(/sin\(([^)]+)\)/g, "Math.sin($1)");
      s = s.replace(/cos\(([^)]+)\)/g, "Math.cos($1)");
      s = s.replace(/tan\(([^)]+)\)/g, "Math.tan($1)");
    }

    s = s.replace(/ln\(([^)]+)\)/g, "Math.log($1)");
    s = s.replace(/log\(([^)]+)\)/g, "Math.log10($1)");

    let openCount = (s.match(/\(/g) || []).length;
    let closeCount = (s.match(/\)/g) || []).length;
    while (openCount > closeCount) {
      s += ")";
      closeCount++;
    }

    if (!/^[0-9\.\+\-\*\/\(\)\s\*\*,Math\.sincoetaqrlgPIEf]+$/.test(s)) {
      return "";
    }

    const val = Function("factorial", `"use strict"; return (${s})`)(factorial);

    if (typeof val === "number" && isFinite(val)) {
      if (Math.abs(val) < 1e-12 && Math.abs(val) > 0) return "0";
      return Number.isInteger(val) ? String(val) : String(parseFloat(val.toFixed(8)));
    }
  } catch (e) {
    return "";
  }
  return "";
}

function loadStoredHistory() {
  try {
    const raw = localStorage.getItem("calculator-history-v1");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const now = Date.now();
    return parsed.filter((item) => now - item.timestamp <= SIX_MONTHS_MS);
  } catch (e) {
    return [];
  }
}

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("calculator-theme") || "light";
  });

  const [calcMode, setCalcMode] = useState(() => {
    return localStorage.getItem("calculator-mode") || "basic";
  });
  const [angleMode, setAngleMode] = useState("deg");

  const [inputStr, setInputStr] = useState("0");
  const [cursorPos, setCursorPos] = useState(1);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [finalResult, setFinalResult] = useState("");

  const [history, setHistory] = useState(loadStoredHistory);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const expressionRef = useRef(null);
  const modeDropdownRef = useRef(null);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);

  const [isLandscape, setIsLandscape] = useState(() => {
    return typeof window !== "undefined" && window.innerWidth > window.innerHeight;
  });

  useEffect(() => {
    function handleOrientationChange() {
      setIsLandscape(window.innerWidth > window.innerHeight);
    }
    window.addEventListener("resize", handleOrientationChange);
    window.addEventListener("orientationchange", handleOrientationChange);
    return () => {
      window.removeEventListener("resize", handleOrientationChange);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(e.target)) {
        setIsModeMenuOpen(false);
      }
    }
    if (isModeMenuOpen) {
      document.addEventListener("pointerdown", handleClickOutside);
      return () => document.removeEventListener("pointerdown", handleClickOutside);
    }
  }, [isModeMenuOpen]);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("calculator-theme", theme);
    const meta = document.getElementById("theme-color-meta");
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#121826" : "#ffffff");
    }
  }, [theme]);

  // Persist calcMode across sessions
  useEffect(() => {
    localStorage.setItem("calculator-mode", calcMode);
  }, [calcMode]);

  useEffect(() => {
    try {
      const now = Date.now();
      const validHistory = history.filter((item) => now - item.timestamp <= SIX_MONTHS_MS);
      localStorage.setItem("calculator-history-v1", JSON.stringify(validHistory));
    } catch (e) {
      console.error("Failed to save history to localStorage", e);
    }
  }, [history]);


  const toggleTheme = () => {
    playHapticFeedback();
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const livePreview = useMemo(() => {
    if (isEvaluated) return "";
    return evaluateExpression(inputStr, angleMode);
  }, [inputStr, isEvaluated, angleMode]);

  const displayTokens = useMemo(() => {
    return buildDisplayTokens(inputStr);
  }, [inputStr]);

  useEffect(() => {
    if (cursorPos > inputStr.length) {
      setCursorPos(inputStr.length);
    }
  }, [inputStr, cursorPos]);

  const insertAtCursor = (char) => {
    playHapticFeedback();
    if (isEvaluated) {
      if (["+", "−", "-", "×", "*", "÷", "/", "^"].includes(char)) {
        const op = char === "-" ? "−" : char === "*" ? "×" : char === "/" ? "÷" : char;
        const base = finalResult && finalResult !== "Error" ? finalResult : "0";
        const newStr = `${base}${op}`;
        setInputStr(newStr);
        setCursorPos(newStr.length);
        setIsEvaluated(false);
        return;
      } else {
        const newStr = char === "." ? "0." : char;
        setInputStr(newStr);
        setCursorPos(newStr.length);
        setIsEvaluated(false);
        return;
      }
    }

    let before = inputStr.slice(0, cursorPos);
    let after = inputStr.slice(cursorPos);

    if (before === "0" && after === "" && char >= "0" && char <= "9") {
      setInputStr(char);
      setCursorPos(1);
      return;
    }

    const isOp = ["+", "−", "×", "÷", "^"].includes(char);
    if (isOp) {
      if (/[\+−×÷\^]$/.test(before)) {
        const newBefore = before.slice(0, -1) + char;
        setInputStr(newBefore + after);
        setCursorPos(newBefore.length);
        return;
      }
      if (/^[\+−×÷\^]/.test(after)) {
        const newAfter = after.slice(1);
        const newStr = before + char + newAfter;
        setInputStr(newStr);
        setCursorPos(before.length + 1);
        return;
      }
    }

    const newStr = before + char + after;
    setInputStr(newStr);
    setCursorPos(before.length + char.length);
  };

  const handleFunctionInsert = (fnName) => {
    playHapticFeedback();
    if (isEvaluated) {
      const newStr = `${fnName}(`;
      setInputStr(newStr);
      setCursorPos(newStr.length);
      setIsEvaluated(false);
      return;
    }

    let before = inputStr.slice(0, cursorPos);
    let after = inputStr.slice(cursorPos);

    if (before === "0" && after === "") {
      const newStr = `${fnName}(`;
      setInputStr(newStr);
      setCursorPos(newStr.length);
      return;
    }

    const toInsert = `${fnName}(`;
    setInputStr(before + toInsert + after);
    setCursorPos(before.length + toInsert.length);
  };

  const handleDecimal = () => {
    playHapticFeedback();
    if (isEvaluated) {
      setInputStr("0.");
      setCursorPos(2);
      setIsEvaluated(false);
      return;
    }

    let before = inputStr.slice(0, cursorPos);
    const lastNumMatch = before.match(/(\d+\.?\d*)$/);
    if (lastNumMatch && lastNumMatch[0].includes(".")) {
      return;
    }
    if (before === "" || /[\+−×÷\^\(]$/.test(before)) {
      insertAtCursor("0.");
      return;
    }
    insertAtCursor(".");
  };

  const handleClear = () => {
    playHapticFeedback();
    setInputStr("0");
    setCursorPos(1);
    setIsEvaluated(false);
    setFinalResult("");
  };

  const handleBackspace = () => {
    playHapticFeedback();
    if (isEvaluated) {
      setIsEvaluated(false);
      return;
    }

    if (cursorPos === 0) return;

    let before = inputStr.slice(0, cursorPos);
    let after = inputStr.slice(cursorPos);

    const fnMatch = before.match(/(sin|cos|tan|log|ln)\($/);
    if (fnMatch) {
      before = before.slice(0, -fnMatch[0].length);
    } else {
      before = before.slice(0, -1);
    }

    const newStr = before + after;
    if (newStr === "") {
      setInputStr("0");
      setCursorPos(1);
    } else {
      setInputStr(newStr);
      setCursorPos(before.length);
    }
  };

  const handleToggleSign = () => {
    playHapticFeedback();
    if (isEvaluated) {
      if (finalResult && finalResult !== "Error" && finalResult !== "0") {
        const toggled = finalResult.startsWith("-") ? finalResult.slice(1) : "-" + finalResult;
        setInputStr(toggled);
        setCursorPos(toggled.length);
        setIsEvaluated(false);
      }
      return;
    }

    let before = inputStr.slice(0, cursorPos);
    let after = inputStr.slice(cursorPos);

    const match = before.match(/(-?\d+(?:\.\d+)?)$/);
    if (match) {
      const numStr = match[1];
      const toggledNum = numStr.startsWith("-") ? numStr.slice(1) : "-" + numStr;
      const newBefore = before.slice(0, before.length - numStr.length) + toggledNum;
      setInputStr(newBefore + after);
      setCursorPos(newBefore.length);
    }
  };

  const handlePercentage = () => {
    playHapticFeedback();
    if (isEvaluated) return;
    let before = inputStr.slice(0, cursorPos);
    if (before.length === 0 || /[\+−×÷%\^\(]$/.test(before)) return;
    insertAtCursor("%");
  };

  const handleOperator = (op) => {
    playHapticFeedback();
    insertAtCursor(op);
  };

  const handleEquals = () => {
    playHapticFeedback();
    if (isEvaluated) return;

    const result = evaluateExpression(inputStr, angleMode);
    if (result !== "") {
      setFinalResult(result);
      const newRecord = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        expression: inputStr,
        result: result,
        timestamp: Date.now()
      };
      setHistory((prev) => [newRecord, ...prev]);
    } else {
      setFinalResult("Error");
    }
    setIsEvaluated(true);
  };

  const moveCursorLeft = () => {
    playHapticFeedback();
    if (isEvaluated) {
      setIsEvaluated(false);
      return;
    }
    setCursorPos((prev) => Math.max(0, prev - 1));
  };

  const moveCursorRight = () => {
    playHapticFeedback();
    if (isEvaluated) {
      setIsEvaluated(false);
      return;
    }
    setCursorPos((prev) => Math.min(inputStr.length, prev + 1));
  };

  const handleSelectHistory = (item) => {
    playHapticFeedback();
    setInputStr(item.expression);
    setFinalResult(item.result);
    setCursorPos(item.expression.length);
    setIsEvaluated(true);
    setIsHistoryOpen(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("calculator-history-v1");
  };

  const handleDeleteHistoryItem = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleExpressionPointer = (e) => {
    if (isEvaluated) {
      setIsEvaluated(false);
    }

    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;

    if (clientX === undefined) return;

    const targetElement = document.elementFromPoint(clientX, clientY);
    const charEl = targetElement?.closest(".input-char");

    if (charEl && charEl.hasAttribute("data-index")) {
      const idx = parseInt(charEl.getAttribute("data-index"), 10);
      if (charEl.classList.contains("input-separator")) {
        setCursorPos(idx);
        return;
      }
      const rect = charEl.getBoundingClientRect();
      const isPastHalf = clientX > rect.left + rect.width / 2;
      setCursorPos(isPastHalf ? idx + 1 : idx);
      return;
    }

    if (expressionRef.current) {
      const charElements = expressionRef.current.querySelectorAll(".input-char");
      if (charElements.length === 0) {
        setCursorPos(inputStr.length);
        return;
      }

      const firstRect = charElements[0].getBoundingClientRect();
      const lastRect = charElements[charElements.length - 1].getBoundingClientRect();

      if (clientX < firstRect.left) {
        setCursorPos(0);
      } else if (clientX > lastRect.right) {
        setCursorPos(inputStr.length);
      } else {
        let closestIdx = inputStr.length;
        let minDistance = Infinity;

        charElements.forEach((el) => {
          const idx = parseInt(el.getAttribute("data-index"), 10);
          const rect = el.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const dist = Math.abs(clientX - centerX);
          if (dist < minDistance) {
            minDistance = dist;
            closestIdx = clientX > centerX ? idx + 1 : idx;
          }
        });
        setCursorPos(closestIdx);
      }
    }
  };

  // Keyboard navigation & typing
  useEffect(() => {
    if (calcMode === "conversion") return;

    const handleKeyDown = (e) => {
      if (e.key >= "0" && e.key <= "9") {
        insertAtCursor(e.key);
      } else if (e.key === ".") {
        handleDecimal();
      } else if (e.key === "+") {
        handleOperator("+");
      } else if (e.key === "-") {
        handleOperator("−");
      } else if (e.key === "*") {
        handleOperator("×");
      } else if (e.key === "/") {
        e.preventDefault();
        handleOperator("÷");
      } else if (e.key === "%") {
        handlePercentage();
      } else if (e.key === "^") {
        handleOperator("^");
      } else if (e.key === "(" || e.key === ")") {
        insertAtCursor(e.key);
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleEquals();
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Escape") {
        handleClear();
      } else if (e.key === "ArrowLeft") {
        moveCursorLeft();
      } else if (e.key === "ArrowRight") {
        moveCursorRight();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputStr, cursorPos, isEvaluated, finalResult, calcMode, angleMode]);

  return (
    <main className="calculator">
      {/* Top Header: Mode Dropdown Selector at Left, Outline History & Theme Icon Buttons at Right */}
      <header className="calculator-header">
        {/* Compact Mode Dropdown Pill with Outline SVG Icon */}
        <div className="mode-dropdown-wrapper" ref={modeDropdownRef}>
          <button
            type="button"
            className="mode-dropdown-trigger"
            onClick={() => {
              playHapticFeedback();
              setIsModeMenuOpen((prev) => !prev);
            }}
            aria-haspopup="listbox"
            aria-expanded={isModeMenuOpen}
            aria-label="Calculator Mode"
          >
            <span className="mode-dropdown-icon">
              {calcMode === "basic" && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <line x1="8" y1="6" x2="16" y2="6" />
                  <line x1="16" y1="14" x2="16" y2="18" />
                  <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
                </svg>
              )}
              {calcMode === "scientific" && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 2v7.31M14 2v7.31" />
                  <path d="M8.5 2h7M7 14.5a7 7 0 0 0 10 0M14 9.31l3.5 5.69a4 4 0 0 1-3.5 6h-4a4 4 0 0 1-3.5-6L10 9.31" />
                </svg>
              )}
              {calcMode === "conversion" && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 10v12" />
                  <path d="M17 14V2" />
                  <path d="m11 6-4-4-4 4" />
                  <path d="m21 18-4 4-4-4" />
                </svg>
              )}
            </span>
            <span className="mode-dropdown-label">
              {calcMode === "basic" ? "Basic" : calcMode === "scientific" ? "Scientific" : "Converter"}
            </span>
            <svg className={`mode-dropdown-arrow ${isModeMenuOpen ? "open" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {isModeMenuOpen && (
            <div className="mode-dropdown-menu" role="listbox">
              <button
                type="button"
                className={`mode-menu-item ${calcMode === "basic" ? "active" : ""}`}
                onClick={() => {
                  playHapticFeedback();
                  setCalcMode("basic");
                  setIsModeMenuOpen(false);
                }}
                role="option"
                aria-selected={calcMode === "basic"}
              >
                <span className="menu-item-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                    <line x1="8" y1="6" x2="16" y2="6" />
                    <line x1="16" y1="14" x2="16" y2="18" />
                    <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
                  </svg>
                </span>
                <span className="menu-item-text">Basic</span>
                {calcMode === "basic" && (
                  <svg className="menu-item-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                className={`mode-menu-item ${calcMode === "scientific" ? "active" : ""}`}
                onClick={() => {
                  playHapticFeedback();
                  setCalcMode("scientific");
                  setIsModeMenuOpen(false);
                }}
                role="option"
                aria-selected={calcMode === "scientific"}
              >
                <span className="menu-item-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 2v7.31M14 2v7.31" />
                    <path d="M8.5 2h7M7 14.5a7 7 0 0 0 10 0M14 9.31l3.5 5.69a4 4 0 0 1-3.5 6h-4a4 4 0 0 1-3.5-6L10 9.31" />
                  </svg>
                </span>
                <span className="menu-item-text">Scientific</span>
                {calcMode === "scientific" && (
                  <svg className="menu-item-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                className={`mode-menu-item ${calcMode === "conversion" ? "active" : ""}`}
                onClick={() => {
                  playHapticFeedback();
                  setCalcMode("conversion");
                  setIsModeMenuOpen(false);
                }}
                role="option"
                aria-selected={calcMode === "conversion"}
              >
                <span className="menu-item-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 10v12" />
                    <path d="M17 14V2" />
                    <path d="m11 6-4-4-4 4" />
                    <path d="m21 18-4 4-4-4" />
                  </svg>
                </span>
                <span className="menu-item-text">Converter</span>
                {calcMode === "conversion" && (
                  <svg className="menu-item-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="header-actions">
          {/* History Button: Outline Clock SVG Only */}
          <button
            className="header-icon-btn history-trigger-btn"
            onClick={() => {
              playHapticFeedback();
              setIsHistoryOpen(true);
            }}
            title="History"
            aria-label="Open calculation history"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {history.length > 0 && (
              <span className="history-badge-dot">{history.length}</span>
            )}
          </button>

          {/* Theme Toggle Button: Icon Only */}
          <button
            className="header-icon-btn theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Animated Tab View Container */}
      <div key={calcMode} className="tab-view-container">
        {calcMode === "conversion" ? (
          <ConverterView />
        ) : (
          <>
            {/* Interactive Display Screen */}
            <section className={`display ${calcMode === "scientific" ? "scientific-display" : ""}`}>
              {/* Display Header */}
              <div className="display-nav-bar">
                <span className="nav-hint">
                  {calcMode === "scientific" ? "Scientific" : ""}
                </span>
                {calcMode === "scientific" && (
                  <button
                    className="angle-mode-pill"
                    onClick={() => {
                      playHapticFeedback();
                      setAngleMode((prev) => (prev === "deg" ? "rad" : "deg"));
                    }}
                    title="Toggle Degrees / Radians"
                  >
                    {angleMode.toUpperCase()}
                  </button>
                )}
              </div>

            {/* Line 1: Interactive Expression with Real-Time Placed Cursor */}
            <div
              ref={expressionRef}
              className={`input-expression ${isEvaluated ? "dimmed" : "active"}`}
              onClick={handleExpressionPointer}
              onTouchStart={handleExpressionPointer}
              onTouchMove={handleExpressionPointer}
              title="Tap or drag anywhere to place cursor"
            >
              {displayTokens.map((token, tIdx) => (
                <span
                  key={tIdx}
                  data-index={token.origIdx}
                  className={`input-char ${token.isSeparator ? "input-separator" : ""}`}
                >
                  {cursorPos === token.origIdx && !token.isSeparator && !isEvaluated && (
                    <span className="navigation-line" aria-hidden="true" />
                  )}
                  {token.ch}
                </span>
              ))}
              {cursorPos === inputStr.length && !isEvaluated && (
                <span className="navigation-line" aria-hidden="true" />
              )}
            </div>

            {/* Line 2: Answer Row with Left/Right Buttons Relocated to the Left of the Answer Area */}
            <div className="answer-row">
              <div className="nav-arrows-inline" title="Move cursor left or right">
                <button
                  className="nav-arrow-btn"
                  onClick={moveCursorLeft}
                  title="Move cursor left"
                  aria-label="Move cursor left"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  className="nav-arrow-btn"
                  onClick={moveCursorRight}
                  title="Move cursor right"
                  aria-label="Move cursor right"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              <div
                className={`answer-display ${isEvaluated ? "evaluated" : "preview"}`}
                onClick={() => {
                  if (isEvaluated) setIsEvaluated(false);
                }}
              >
                {isEvaluated
                  ? formatNumberWithCommas(finalResult)
                  : formatNumberWithCommas(livePreview) || "\u00A0"}
              </div>
            </div>
          </section>

          {/* Keypad: Basic or Scientific */}
          {calcMode === "scientific" ? (
            isLandscape ? (
              /* Landscape Scientific Keypad: 7 Columns (Left 3 Notations, Right 4 Basic/Numbers) × 5 Rows */
              <section className="keypad scientific-keypad landscape-scientific-keypad">
                {/* Row 1: sin cos tan | AC ⌫ % ÷ */}
                <button className="sci-fn" onClick={() => handleFunctionInsert("sin")}>sin</button>
                <button className="sci-fn" onClick={() => handleFunctionInsert("cos")}>cos</button>
                <button className="sci-fn" onClick={() => handleFunctionInsert("tan")}>tan</button>
                <button className="utility" onClick={handleClear}>AC</button>
                <button className="utility" onClick={handleBackspace} aria-label="Backspace" title="Backspace">
                  <BackspaceIcon />
                </button>
                <button className="utility" onClick={handlePercentage}>%</button>
                <button className="operator" onClick={() => handleOperator("÷")}>÷</button>

                {/* Row 2: ln log xʸ | 7 8 9 × */}
                <button className="sci-fn" onClick={() => handleFunctionInsert("ln")}>ln</button>
                <button className="sci-fn" onClick={() => handleFunctionInsert("log")}>log</button>
                <button className="sci-fn" onClick={() => handleOperator("^")}>xʸ</button>
                <button className="number" onClick={() => insertAtCursor("7")}>7</button>
                <button className="number" onClick={() => insertAtCursor("8")}>8</button>
                <button className="number" onClick={() => insertAtCursor("9")}>9</button>
                <button className="operator" onClick={() => handleOperator("×")}>×</button>

                {/* Row 3: √ π e | 4 5 6 − */}
                <button className="sci-fn" onClick={() => insertAtCursor("√")}>√</button>
                <button className="sci-fn" onClick={() => insertAtCursor("π")}>π</button>
                <button className="sci-fn" onClick={() => insertAtCursor("e")}>e</button>
                <button className="number" onClick={() => insertAtCursor("4")}>4</button>
                <button className="number" onClick={() => insertAtCursor("5")}>5</button>
                <button className="number" onClick={() => insertAtCursor("6")}>6</button>
                <button className="operator" onClick={() => handleOperator("−")}>−</button>

                {/* Row 4: x! ( ) | 1 2 3 + */}
                <button className="sci-fn" onClick={() => insertAtCursor("!")}>x!</button>
                <button className="sci-fn" onClick={() => insertAtCursor("(")}>(</button>
                <button className="sci-fn" onClick={() => insertAtCursor(")")}>)</button>
                <button className="number" onClick={() => insertAtCursor("1")}>1</button>
                <button className="number" onClick={() => insertAtCursor("2")}>2</button>
                <button className="number" onClick={() => insertAtCursor("3")}>3</button>
                <button className="operator" onClick={() => handleOperator("+")}>+</button>

                {/* Row 5: DEG x² 1/x | +/- 0 . = */}
                <button
                  className="sci-fn sci-angle-btn"
                  onClick={() => {
                    playHapticFeedback();
                    setAngleMode((prev) => (prev === "deg" ? "rad" : "deg"));
                  }}
                  title="Toggle Degrees / Radians"
                >
                  {angleMode.toUpperCase()}
                </button>
                <button className="sci-fn" onClick={() => insertAtCursor("^2")}>x²</button>
                <button className="sci-fn" onClick={() => insertAtCursor("1/(")}>1/x</button>
                <button className="utility" onClick={handleToggleSign}>+/−</button>
                <button className="number" onClick={() => insertAtCursor("0")}>0</button>
                <button className="number" onClick={handleDecimal}>.</button>
                <button className="equals" onClick={handleEquals}>=</button>
              </section>
            ) : (
              /* Portrait Scientific Keypad: Reverted Original 5 Columns × 7 Rows */
              <section className="keypad scientific-keypad portrait-scientific-keypad">
                {/* Row 1: sin cos tan ln log */}
                <button className="sci-fn" onClick={() => handleFunctionInsert("sin")}>sin</button>
                <button className="sci-fn" onClick={() => handleFunctionInsert("cos")}>cos</button>
                <button className="sci-fn" onClick={() => handleFunctionInsert("tan")}>tan</button>
                <button className="sci-fn" onClick={() => handleFunctionInsert("ln")}>ln</button>
                <button className="sci-fn" onClick={() => handleFunctionInsert("log")}>log</button>

                {/* Row 2: xʸ √ π e x! */}
                <button className="sci-fn" onClick={() => handleOperator("^")}>xʸ</button>
                <button className="sci-fn" onClick={() => insertAtCursor("√")}>√</button>
                <button className="sci-fn" onClick={() => insertAtCursor("π")}>π</button>
                <button className="sci-fn" onClick={() => insertAtCursor("e")}>e</button>
                <button className="sci-fn" onClick={() => insertAtCursor("!")}>x!</button>

                {/* Row 3: ( ) AC ⌫ ÷ */}
                <button className="sci-fn" onClick={() => insertAtCursor("(")}>(</button>
                <button className="sci-fn" onClick={() => insertAtCursor(")")}>)</button>
                <button className="utility" onClick={handleClear}>AC</button>
                <button className="utility" onClick={handleBackspace} aria-label="Backspace" title="Backspace">
                  <BackspaceIcon />
                </button>
                <button className="operator" onClick={() => handleOperator("÷")}>÷</button>

                {/* Row 4: 7 8 9 % × */}
                <button className="number" onClick={() => insertAtCursor("7")}>7</button>
                <button className="number" onClick={() => insertAtCursor("8")}>8</button>
                <button className="number" onClick={() => insertAtCursor("9")}>9</button>
                <button className="utility" onClick={handlePercentage}>%</button>
                <button className="operator" onClick={() => handleOperator("×")}>×</button>

                {/* Row 5: 4 5 6 +/- − */}
                <button className="number" onClick={() => insertAtCursor("4")}>4</button>
                <button className="number" onClick={() => insertAtCursor("5")}>5</button>
                <button className="number" onClick={() => insertAtCursor("6")}>6</button>
                <button className="utility" onClick={handleToggleSign}>+/−</button>
                <button className="operator" onClick={() => handleOperator("−")}>−</button>

                {/* Row 6: 1 2 3 . + */}
                <button className="number" onClick={() => insertAtCursor("1")}>1</button>
                <button className="number" onClick={() => insertAtCursor("2")}>2</button>
                <button className="number" onClick={() => insertAtCursor("3")}>3</button>
                <button className="number" onClick={handleDecimal}>.</button>
                <button className="operator" onClick={() => handleOperator("+")}>+</button>

                {/* Row 7: 0 (span 3 cols), = (span 2 cols) */}
                <button className="number sci-col-3" onClick={() => insertAtCursor("0")}>0</button>
                <button className="equals sci-col-2" onClick={handleEquals}>=</button>
              </section>
            )
          ) : (
            <section className="keypad">
              {/* Row 1 */}
              <button className="utility" onClick={handleClear}>AC</button>
              <button className="utility" onClick={handleBackspace} aria-label="Backspace" title="Backspace">
                <BackspaceIcon />
              </button>
              <button className="utility" onClick={handlePercentage}>%</button>
              <button className="operator" onClick={() => handleOperator("÷")}>÷</button>

              {/* Row 2 */}
              <button className="number" onClick={() => insertAtCursor("7")}>7</button>
              <button className="number" onClick={() => insertAtCursor("8")}>8</button>
              <button className="number" onClick={() => insertAtCursor("9")}>9</button>
              <button className="operator" onClick={() => handleOperator("×")}>×</button>

              {/* Row 3 */}
              <button className="number" onClick={() => insertAtCursor("4")}>4</button>
              <button className="number" onClick={() => insertAtCursor("5")}>5</button>
              <button className="number" onClick={() => insertAtCursor("6")}>6</button>
              <button className="operator" onClick={() => handleOperator("−")}>−</button>

              {/* Row 4 */}
              <button className="number" onClick={() => insertAtCursor("1")}>1</button>
              <button className="number" onClick={() => insertAtCursor("2")}>2</button>
              <button className="number" onClick={() => insertAtCursor("3")}>3</button>
              <button className="operator" onClick={() => handleOperator("+")}>+</button>

              {/* Row 5 */}
              <button className="utility" onClick={handleToggleSign}>+/−</button>
              <button className="number" onClick={() => insertAtCursor("0")}>0</button>
              <button className="number" onClick={handleDecimal}>.</button>
              <button className="equals" onClick={handleEquals}>=</button>
            </section>
          )}
        </>
      )}
      </div>

      {/* History Slide-Over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistory={handleSelectHistory}
        onClearHistory={handleClearHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
      />
    </main>
  );
}

export default App;