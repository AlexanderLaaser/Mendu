// src/components/EmailInput.tsx

import React from "react";

interface EmailInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EmailInput: React.FC<EmailInputProps> = ({ value, onChange }) => (
  <div className="mb-4">
    <label className="input input-bordered flex items-center gap-2">
      <input
        type="email"
        className="grow"
        placeholder="E-Mail"
        value={value}
        onChange={onChange}
      />
    </label>
  </div>
);

export default EmailInput;
