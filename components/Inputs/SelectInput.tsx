import React from "react";

interface SelectInputProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  options,
  value,
  onChange,
}) => (
  <div className="mb-4">
    <label className="label">
      <span className="label-text">{label}</span>
    </label>
    <select
      className="select select-bordered w-full"
      value={value}
      onChange={onChange}
    >
      <option value="" disabled>
        Bitte wählen
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default SelectInput;
