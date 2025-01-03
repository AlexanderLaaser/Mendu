// src/components/PasswordInput.tsx

import React from "react";

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ value, onChange }) => (
  <div className="mb-4">
    <label className="input input-bordered flex items-center gap-2">
      <input
        type="password"
        className="grow"
        placeholder="Passwort"
        value={value}
        onChange={onChange}
      />
    </label>
  </div>
);

export default PasswordInput;
