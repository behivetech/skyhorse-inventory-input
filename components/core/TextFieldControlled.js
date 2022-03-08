import React from "react";
import { Controller } from "react-hook-form";
import { TextField } from "@shopify/polaris";

export default function TextFieldControlled({
  autoComplete = "off",
  control,
  error,
  name,
  label,
  placeholder,
  helpText,
  type = "text",
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <TextField
          autoComplete={autoComplete}
          error={error}
          helpText={helpText}
          label={label}
          onBlur={onBlur}
          onChange={onChange}
          placeholder={placeholder}
          value={value}
          type={type}
        />
      )}
    />
  );
}
