import React from "react";
import { Controller } from "react-hook-form";
import { Checkbox } from "@shopify/polaris";

export default function CheckboxControlled({ control, name, label }) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, onBlur, value } }) => (
                <Checkbox
                    label={label}
                    onBlur={onBlur}
                    onChange={onChange}
                    checked={value}
                />
            )}
        />
    );
}
