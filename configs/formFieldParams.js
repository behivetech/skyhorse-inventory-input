import * as yup from "yup";

const formFieldParams = {
    pricePerCarat: {
        label: "Price Per Carat",
        type: "number",
        validation: yup.number().positive().required(),
        inputFieldParams: {
            fieldType: "text",
        },
    },
    carat: {
        label: "Carat",
        type: "number",
        validation: yup.number().positive().required(),
        inputFieldParams: {
            fieldType: "text",
        },
    },
    type: {
        label: "Type",
        type: "text",
        validation: yup.string().required(),
        inputFieldParams: {
            fieldType: "select",
            options: [
                {
                    label: "Select a type...",
                    value: "",
                },
                {
                    label: "Gaspeite",
                    value: "Gaspeite",
                },
                {
                    label: "Spiny Oyster",
                    value: "Spiny Oyster",
                },
                {
                    label: "Turquoise",
                    value: "Turquoise",
                },
                {
                    label: "Variscite",
                    value: "Variscite",
                },
            ],
            placeholder: "Select a type",
        },
    },
    mine: {
        label: "Mine",
        type: "text",
        validation: yup.string(),
        inputFieldParams: {
            fieldType: "select",
            options: [
                {
                    label: "Select a mine...",
                    value: "",
                },
                {
                    label: "#8 Mine, Nevada",
                    value: "#8 Mine, Nevada",
                },
                {
                    label: "Angel Wing, Nevada",
                    value: "Angel Wing, Nevada",
                },
                {
                    label: "Australia",
                    value: "Australia",
                },
                {
                    label: "Cairico Lake, Nevada",
                    value: "Cairico Lake, Nevada",
                },
                {
                    label: "Hubei, China",
                    value: "Hubei, China",
                },
                {
                    label: "Nacozari, Mexico",
                    value: "Nacozari, Mexico",
                },
                {
                    label: "Royston, Nevada",
                    value: "Royston, Nevada",
                },
                {
                    label: "Red Skin, China",
                    value: "Red Skin, China",
                },
                {
                    label: `Ma'anshan, China`,
                    value: `Ma'anshan, China`,
                },
            ],
        },
    },
    // priceApproved: {
    //     type: "boolean",
    //     label: "Price Approved",
    //     inputFieldParams: {
    //         fieldType: "checkbox",
    //     },
    // },
    bin: {
        label: "Bin",
        type: "number",
        validation: yup.number().positive().required(),
        inputFieldParams: {
            fieldType: "text",
        },
    },
    otherLocation: {
        label: "Other Location",
        type: "text",
        validation: yup.string(),
        inputFieldParams: {
            fieldType: "text",
        },
    },
    length: {
        label: "Length",
        type: "number",
        validation: yup.number().positive(),
        inputFieldParams: {
            fieldType: "text",
        },
    },
    width: {
        label: "Width",
        type: "number",
        validation: yup.number().positive(),
        inputFieldParams: {
            fieldType: "text",
        },
    },
    height: {
        label: "Height",
        type: "number",
        validation: yup.number().positive(),
        inputFieldParams: {
            fieldType: "text",
        },
    },
};

export default formFieldParams;
