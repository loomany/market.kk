"use client";

import { useEffect, useMemo, useState } from "react";
import { Select } from "@/components/ui/Select";
import {
  applyPhoneMask,
  formatE164,
  formatFreePhoneDisplay,
  getPhoneCountryById,
  isFreePhoneCountry,
  isPhoneComplete,
  listPhoneCountryOptions,
  maskPlaceholder,
  parseE164Phone,
  phoneHelperText,
  digitsOnly,
} from "@/lib/auth/phoneCountries";

type PhoneCountryInputProps = {
  value: string;
  onChange: (value: string) => void;
  defaultCountryId?: string;
  countryId?: string;
  onCountryChange?: (countryId: string) => void;
  disabled?: boolean;
  label?: string;
};

export function PhoneCountryInput({
  value,
  onChange,
  defaultCountryId = "RU",
  countryId: countryIdProp,
  onCountryChange,
  disabled,
  label = "Телефон",
}: PhoneCountryInputProps) {
  const [countryIdState, setCountryIdState] = useState(defaultCountryId);
  const [nationalDigits, setNationalDigits] = useState("");
  const countryId = countryIdProp ?? countryIdState;

  const setCountryId = (nextId: string) => {
    if (countryIdProp === undefined) setCountryIdState(nextId);
    onCountryChange?.(nextId);
  };

  useEffect(() => {
    const parsed = parseE164Phone(value, countryId);
    if (countryIdProp === undefined) setCountryIdState(parsed.countryId);
    setNationalDigits(parsed.nationalDigits);
  }, [value, countryId, countryIdProp]);

  const country = useMemo(() => getPhoneCountryById(countryId), [countryId]);
  const isFree = isFreePhoneCountry(country);

  const countryOptions = useMemo(
    () =>
      listPhoneCountryOptions().map((item) => ({
        value: item.id,
        label: isFreePhoneCountry(item) ? `${item.id} +` : `${item.id} ${item.dialCode}`,
      })),
    []
  );

  const displayValue = isFree
    ? formatFreePhoneDisplay(value)
    : applyPhoneMask(nationalDigits, country.mask);
  const placeholder = maskPlaceholder(country.mask);

  const updateNational = (nextDigits: string) => {
    const trimmed = digitsOnly(nextDigits).slice(0, country.nationalDigits);
    setNationalDigits(trimmed);
    onChange(formatE164(country, trimmed));
  };

  const updateFreePhone = (raw: string) => {
    const trimmed = digitsOnly(raw).slice(0, country.nationalDigits);
    setNationalDigits(trimmed);
    onChange(formatE164(country, trimmed));
  };

  const handleCountryChange = (nextId: string) => {
    const nextCountry = getPhoneCountryById(nextId);
    setCountryId(nextId);

    if (isFreePhoneCountry(nextCountry)) {
      const allDigits = digitsOnly(value).slice(0, nextCountry.nationalDigits);
      setNationalDigits(allDigits);
      onChange(formatE164(nextCountry, allDigits));
      return;
    }

    const parsed = parseE164Phone(value, nextId);
    const trimmed = digitsOnly(parsed.nationalDigits).slice(0, nextCountry.nationalDigits);
    setNationalDigits(trimmed);
    onChange(formatE164(nextCountry, trimmed));
  };

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-semibold text-slate-950">{label}</span>
      <div className="flex gap-2">
        <Select
          value={countryId}
          options={countryOptions}
          onChange={handleCountryChange}
          disabled={disabled}
          size="sm"
          align="start"
          className="w-[7.25rem] shrink-0"
          triggerClassName="font-semibold text-slate-800"
          menuClassName="z-[70] min-w-[8.5rem]"
          menuMatchTriggerWidth={false}
        />
        <input
          type="tel"
          inputMode={isFree ? "tel" : "numeric"}
          autoComplete={isFree ? "tel" : "tel-national"}
          disabled={disabled}
          value={displayValue}
          placeholder={placeholder}
          onChange={(event) => {
            if (isFree) {
              updateFreePhone(event.target.value);
              return;
            }
            updateNational(digitsOnly(event.target.value));
          }}
          onPaste={(event) => {
            event.preventDefault();
            const pasted = event.clipboardData.getData("text");
            const parsed = parseE164Phone(pasted, countryId);
            const nextCountry = getPhoneCountryById(parsed.countryId);
            setCountryId(parsed.countryId);

            if (isFreePhoneCountry(nextCountry)) {
              const trimmed = digitsOnly(parsed.nationalDigits).slice(
                0,
                nextCountry.nationalDigits
              );
              setNationalDigits(trimmed);
              onChange(formatE164(nextCountry, trimmed));
              return;
            }

            const trimmed = digitsOnly(parsed.nationalDigits).slice(
              0,
              nextCountry.nationalDigits
            );
            setNationalDigits(trimmed);
            onChange(formatE164(nextCountry, trimmed));
          }}
          className="min-h-10 flex-1 rounded-lg border border-border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50 disabled:text-slate-400"
        />
      </div>
      <p className="text-xs leading-5 text-slate-500">{phoneHelperText(country)}</p>
    </div>
  );
}

export function validatePhoneCountryInput(
  value: string,
  defaultCountryId = "RU"
): { ok: true } | { ok: false; message: string } {
  const { countryId, nationalDigits } = parseE164Phone(value, defaultCountryId);
  const country = getPhoneCountryById(countryId);
  if (!isPhoneComplete(country, nationalDigits)) {
    if (isFreePhoneCountry(country)) {
      return {
        ok: false,
        message: "Введите номер с кодом страны (от 8 до 15 цифр).",
      };
    }
    return {
      ok: false,
      message: `Введите ${country.nationalDigits} цифр после ${country.dialCode}.`,
    };
  }
  return { ok: true };
}
