import React from 'react';
import { Controller } from "react-hook-form";
import { Select } from "@shopify/polaris";

export default function SelectControlled({
    control,
    error,
    name,
    helpText,
    label,
    options,
    placeholder,
}) {

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, onBlur, value } }) => (
                <Select
                    error={error}
                    helpText={helpText}
                    label={label}
                    onBlur={onBlur}
                    onChange={onChange}
                    options={options}
                    placeholder={placeholder}
                    value={value}
                />
            )}
        />
    );
}
