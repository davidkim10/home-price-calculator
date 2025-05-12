"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import commaNumber from "comma-number";

interface UseFormattedInputOptions {
  maxDecimals?: number;
  formatFn?: (value: string) => string;
}

const useFormattedInput = (
  initialValue: number,
  options: UseFormattedInputOptions = {}
) => {
  const { maxDecimals = 2, formatFn = commaNumber } = options;

  const [value, setValue] = useState<number>(initialValue);
  const [displayValue, setDisplayValue] = useState<string>(
    initialValue === 0 ? "" : initialValue.toString()
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/[^0-9.]/g, "");

    if (numericValue === "") {
      setValue(0);
      setDisplayValue("");
      return;
    }

    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2 || parts[1]?.length > maxDecimals) return;

    // Check if this is just a decimal point with no number
    if (numericValue === ".") {
      setDisplayValue("$0.");
      setValue(0);
      return;
    }

    const numberValue = parseFloat(numericValue);
    if (!isNaN(numberValue)) {
      setValue(numberValue);
      setDisplayValue(formatFn(numericValue));
    }
  };

  return {
    value,
    displayValue,
    handleChange,
    setValue,
    setDisplayValue,
  };
};

export const Calculator = () => {
  const isMounted = useRef(false);
  const housePriceInput = useFormattedInput(0);
  const downPaymentInput = useFormattedInput(0);
  const insuranceInput = useFormattedInput(0);
  const interestRateInput = useFormattedInput(3.5, { maxDecimals: 3 });
  const taxRateInput = useFormattedInput(2, { maxDecimals: 3 });
  const [loanTerm, setLoanTerm] = useState(0);

  useEffect(() => {
    isMounted.current = true;
  }, []);

  const setDownPaymentQuickOption = (percentage: number) => {
    const downPayment = housePriceInput.value * (percentage / 100);
    downPaymentInput.handleChange({
      target: {
        value: downPayment.toString(),
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  const calculateDownPaymentPercentage = () => {
    if (housePriceInput.value === 0) return 0;
    return (
      Math.round((downPaymentInput.value / housePriceInput.value) * 100 * 100) /
      100
    );
  };

  const calculateLoanAmount = () => {
    return (
      Math.round((housePriceInput.value - downPaymentInput.value) * 100) / 100
    );
  };

  const calculateMonthlyMortgage = () => {
    if (!loanTerm) return 0;
    const loanAmount = calculateLoanAmount();
    const monthlyRate = interestRateInput.value / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    const monthlyPayment =
      (loanAmount *
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const total = Math.round(monthlyPayment * 100) / 100;
    return total || 0;
  };

  const calculateMonthlyTax = () => {
    return (
      Math.round(
        ((housePriceInput.value * ((taxRateInput.value || 0) / 100)) / 12) * 100
      ) / 100
    );
  };

  const calculateMonthlyInsurance = () => {
    return Math.round((insuranceInput.value / 12) * 100) / 100;
  };

  const calculateTotalMonthlyPayment = () => {
    return (
      Math.round(
        (calculateMonthlyMortgage() +
          calculateMonthlyTax() +
          calculateMonthlyInsurance()) *
          100
      ) / 100
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Home Cost Calculator</CardTitle>
          {isMounted.current && !housePriceInput.value && (
            <p className="text-sm text-red-500">
              Don&apos;t forget to enter the price of the home
            </p>
          )}
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="col-span-2">
                <Label className="block text-sm font-medium mb-1">
                  House Price ($)
                </Label>
                <Input
                  type="text"
                  value={housePriceInput.displayValue}
                  onChange={housePriceInput.handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter house price"
                />
              </div>

              <div className="col-span-2">
                <div className="flex justify-between items-center">
                  <Label className="block text-sm font-medium mb-1">
                    Down Payment ($)
                  </Label>

                  <div className="flex gap-1">
                    <Button
                      className="!p-1 text-gray-500 text-xs"
                      size="sm"
                      variant="ghost"
                      onClick={() => setDownPaymentQuickOption(5)}
                    >
                      5%
                    </Button>
                    <Button
                      className="!p-1 text-gray-500 text-xs"
                      size="sm"
                      variant="ghost"
                      onClick={() => setDownPaymentQuickOption(10)}
                    >
                      10%
                    </Button>
                    <Button
                      className="!p-1 text-gray-500 text-xs"
                      size="sm"
                      variant="ghost"
                      onClick={() => setDownPaymentQuickOption(20)}
                    >
                      20%
                    </Button>
                  </div>
                </div>
                <Input
                  type="text"
                  value={downPaymentInput.displayValue}
                  onChange={downPaymentInput.handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter down payment"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium mb-1">
                  Tax Rate (%)
                </Label>
                <Input
                  className="w-full p-2 border rounded"
                  placeholder="Enter tax rate"
                  type="text"
                  value={taxRateInput.displayValue}
                  onChange={taxRateInput.handleChange}
                  step="0.01"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium mb-1">
                  Annual Insurance ($)
                </Label>
                <Input
                  className="w-full p-2 border rounded"
                  placeholder="Enter annual insurance"
                  type="text"
                  value={insuranceInput.displayValue}
                  onChange={insuranceInput.handleChange}
                />
              </div>

              <div>
                <Label className="block text-sm font-medium mb-1">
                  Interest Rate (%)
                </Label>
                <Input
                  className="w-full p-2 border rounded"
                  placeholder="Enter interest rate"
                  type="text"
                  value={interestRateInput.displayValue}
                  onChange={interestRateInput.handleChange}
                />
              </div>

              <div>
                <Label className="block text-sm font-medium mb-1">
                  Loan Term (years)
                </Label>
                <Input
                  className="w-full p-2 border rounded"
                  placeholder="Enter loan term"
                  type="number"
                  value={loanTerm}
                  onChange={(e) => {
                    const value = e.target.value as unknown as number;
                    setLoanTerm(value);
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Monthly Breakdown</h2>
        <ul className="space-y-2 text-sm divide-y border-b *:p-2 *:flex *:justify-between">
          <li>
            Down Payment Percentage:{" "}
            <span>{calculateDownPaymentPercentage()}%</span>
          </li>
          <li>
            Loan Amount: <span>${commaNumber(calculateLoanAmount())}</span>
          </li>
          <li>
            Monthly Mortgage:{" "}
            <span>${commaNumber(calculateMonthlyMortgage())}</span>
          </li>
          <li>
            Monthly Tax: <span>${commaNumber(calculateMonthlyTax())}</span>
          </li>
          <li>
            Monthly Insurance:{" "}
            <span>${commaNumber(calculateMonthlyInsurance())}</span>
          </li>
        </ul>

        <p className="font-bold text-sm mt-4 flex justify-between bg-gray-100 p-4 rounded-md">
          Total Monthly Payment:{" "}
          <span>${commaNumber(calculateTotalMonthlyPayment())}</span>
        </p>
      </div>
    </div>
  );
};
