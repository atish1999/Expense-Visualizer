import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type CurrencyCode = "USD" | "EUR" | "INR";

interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE" },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN" },
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (code: CurrencyCode) => void;
  formatAmount: (amountInCents: number) => string;
  formatShort: (amountInCents: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = "preferred-currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved in CURRENCIES) {
        return saved as CurrencyCode;
      }
    }
    return "USD";
  });

  const currency = CURRENCIES[currencyCode];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currencyCode);
  }, [currencyCode]);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyCode(code);
  };

  const formatAmount = (amountInCents: number): string => {
    const amount = amountInCents / 100;
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatShort = (amountInCents: number): string => {
    const amount = amountInCents / 100;
    return `${currency.symbol}${amount.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, formatShort }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
