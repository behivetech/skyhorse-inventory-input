import React, { useCallback, useMemo, useState } from "react";
import {
    Banner,
    Button,
    Checkbox,
    Form,
    FormLayout,
    Link,
} from "@shopify/polaris";
import { useForm } from "react-hook-form";
import mapValues from "lodash.mapvalues";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import formFieldParams from "../../configs/formFieldParams";
import CheckboxControlled from "../core/CheckboxControlled";
import SelectControlled from "../core/SelectControlled";
import TextFieldControlled from "../core/TextFieldControlled";
import useProducts from "../../hooks/useProducts";
import getClassName from "../../tools/getClassName";
import styles from "./ProductForm.module.scss";
import {
    getBarcodeLink,
    getProductLink,
    getVariant,
} from "../../tools/dataHelpers";

const schema = yup.object(mapValues(formFieldParams, "validation")).required();

export default function ProductForm({
    className,
    closeParentModal = () => null,
    editData = {},
}) {
    const {
        editDataExists,
        defaultValues,
        hasReady,
        hasPublish,
    } = useMemo(() => {
        const defaultValues = {};
        const editDataExists = !!editData.id;
        let editValue = null;

        for (let valueKey in editData) {
            editValue = editData[valueKey];

            if (editValue || editValue?.value) {
                if (["False", "false"].includes(editValue?.value)) {
                    editValue = false;
                }

                defaultValues[valueKey] =
                    typeof editValue === "string"
                        ? editValue
                        : editValue?.value;
            }
        }

        return {
            defaultValues,
            editDataExists,
            hasReady: editData.tags.includes("ready"),
            hasPublish: editData.tags.includes("publishable"),
        };
    }, [editData]);
    const [stabilized, setStabilized] = useState(
        editData.title?.includes("Stabilized") || false
    );
    const {
        control,
        formState: { errors: fieldErrors },
        handleSubmit,
        reset: resetForm,
    } = useForm({
        defaultValues,
        resolver: yupResolver(schema),
    });
    const handleChange = useCallback(
        (newChecked) => setStabilized(newChecked),
        []
    );
    const {
        productCreate,
        productCreateData,
        productCreateError,
        productCreateLoading,
        productCreateReset,
        productUpdate,
        productUpdateData,
        productUpdateError,
        productUpdateLoading,
        productUpdateReset,
    } = useProducts();
    const {
        productSubmit,
        productSubmitData,
        productSubmitError,
        productSubmitLoading,
        productSubmitReset,
    } = useMemo(() => {
        return editDataExists
            ? {
                  productSubmit: productUpdate,
                  productSubmitData: productUpdateData,
                  productSubmitError: productUpdateError,
                  productSubmitLoading: productUpdateLoading,
                  productSubmitReset: productUpdateReset,
              }
            : {
                  productSubmit: productCreate,
                  productSubmitData: productCreateData,
                  productSubmitError: productCreateError,
                  productSubmitLoading: productCreateLoading,
                  productSubmitReset: productCreateReset,
              };
    }, [
        editDataExists,
        productCreate,
        productCreateData,
        productCreateError,
        productCreateLoading,
        productCreateReset,
        productUpdate,
        productUpdateData,
        productUpdateError,
        productUpdateLoading,
        productUpdateReset,
    ]);
    const renderInputField = {
        checkbox: (props) => (
            <CheckboxControlled {...props} control={control} />
        ),
        select: (props) => <SelectControlled {...props} control={control} />,
        text: (props) => <TextFieldControlled {...props} control={control} />,
    };

    function getRandomNumber(digitCount) {
        const powerOf10 = 10 ** digitCount;
        const sliceAmount = 0 - digitCount;

        return [
            powerOf10.toString().slice(sliceAmount),
            Math.floor(Math.random() * powerOf10),
        ]
            .join("")
            .slice(sliceAmount);
    }

    function getSkuCode({ mine, type, barcode, bin }) {
        const typeCode = type.substring(0, 2).toUpperCase();
        const mineCode = mine
            ? mine
                  .replace("#", "n")
                  .split(" ")
                  .map((word) => word.substring(0, 2))
                  .join("")
                  .substring(0, 4)
                  .toUpperCase()
            : "NA";
        const slot = barcode.toString().charAt(0);
        const editSku = getVariant(editData?.variants, "sku");
        const uniqueId = editSku
            ? editSku.split("-").slice(-1).join("")
            : getRandomNumber(3);
        return `${typeCode}-${mineCode}-B${bin}S${slot}-${uniqueId}`;
    }

    function getBarcode() {
        // concatenated of first two chars of type , random 0 - 9 and minutes since epoch
        return [
            getRandomNumber(1),
            Math.floor(Date.now() / 1000 / 60)
                .toString()
                .slice(-6),
            getRandomNumber(2),
        ].join("");
    }

    function getPrice(pricePerCarat, carat) {
        return parseFloat(pricePerCarat * carat).toFixed(2);
    }

    function getTags(tags) {
        const combinedTags = [...tags];

        if (hasReady) {
            combinedTags.push("ready");
        }

        if (hasPublish) {
            combinedTags.push("publishable");
        }

        return combinedTags;
    }

    console.log(getVariant(editData?.variants, "barcode"));
    function getProductInputs(formData) {
        const { pricePerCarat, type, mine, carat, bin } = formData || {};
        const tags = getTags([type, mine]);
        const barcode =
            getVariant(editData?.variants, "barcode") || getBarcode();
        const price = getPrice(pricePerCarat, carat);
        const title = `${type}${stabilized ? ` (Stabilized)` : ""}${
            mine ? ` - ${mine}` : ""
        } - ${carat}ct`;

        const payload = {
            variables: {
                input: {
                    // collectionsToJoin: [],
                    title,
                    vendor: "Skyhorse Industries",
                    handle: [...type.split(" "), barcode]
                        .join("-")
                        .toLowerCase(),
                    metafields: Object.keys(formFieldParams)
                        .map((key) => {
                            let dataVal =
                                formFieldParams[key]?.type === "boolean" &&
                                !dataVal
                                    ? "false"
                                    : formData[key];
                            const emptyVal =
                                editData && editData[key] && editData[key].value
                                    ? null
                                    : undefined;
                            const metafieldObject = {
                                key,
                                namespace: "my_fields",
                                value: dataVal ? `${dataVal}` : emptyVal,
                            };

                            if (editData) {
                                metafieldObject.id = editData[key]?.id;
                            }

                            return metafieldObject;
                        })
                        .filter(
                            (inputObject) => inputObject?.value !== undefined
                        ),
                    status: "DRAFT",
                    seo: {
                        description: [
                            type,
                            stabilized ? ` (Stabilized)` : "",
                            mine ? ` from ${mine}` : "",
                            `, Carats: ${carat}ct`,
                            `, Price: $${price} USD`,
                        ].join(""),
                        title,
                    },
                    productType: type,
                    tags: tags.join(", "),
                    variants: [
                        {
                            price,
                            barcode,
                            sku: getSkuCode({ mine, type, barcode, bin }),
                        },
                    ],
                },
            },
        };

        if (editDataExists) {
            payload.variables.input.id = editData.id;
        }

        return payload;
    }

    function handleSuccessBannerDismiss() {
        resetForm();
        productSubmitReset();
        closeParentModal();
    }

    function onSubmit(formData) {
        // console.log(getProductInputs(formData));
        productSubmit(getProductInputs(formData));
    }

    const metaFieldInputs = Object.keys(formFieldParams).map((key, index) => {
        const {
            inputFieldParams: { fieldType, options, placeholder },
            label,
            type,
        } = formFieldParams[key];

        return renderInputField[fieldType]({
            error: fieldErrors[key]?.message,
            key: `${fieldType}-field-${key}__${index}`,
            name: key,
            label,
            options,
            placeholder,
            type,
        });
    });

    const [rootClassName, getChildClass] = getClassName({
        className,
        rootClass: "product-form",
        styles,
    });

    return (
        <div className={rootClassName}>
            {productSubmitError && (
                <Banner
                    status="critical"
                    onDismiss={() => productSubmitReset()}
                >
                    {productSubmitError?.message}
                </Banner>
            )}
            {productSubmitData && (
                <Banner
                    status="success"
                    title={`Product Successfully ${
                        editDataExists ? "Updated" : "Created"
                    }`}
                    action={{
                        content: "Dismiss",
                        onAction: handleSuccessBannerDismiss,
                    }}
                    secondaryAction={
                        editDataExists
                            ? undefined
                            : {
                                  content: "Add Similar Item",
                                  onAction: () => productSubmitReset(),
                              }
                    }
                    onDismiss={handleSuccessBannerDismiss}
                >
                    <p>
                        Product Page:{" "}
                        <Link
                            url={getProductLink(productSubmitData?.id)}
                            external
                        >
                            {productSubmitData?.title}
                        </Link>
                        <br />
                        <Link
                            url={getBarcodeLink(productSubmitData?.id)}
                            external
                        >
                            Print Barcode
                        </Link>{" "}
                        {getVariant(productSubmitData?.variants, "barcode")}
                    </p>
                </Banner>
            )}
            {!productSubmitData && (
                <Form name="inventory-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className={getChildClass("upper-form")}>
                        <Button
                            disabled={productSubmitLoading}
                            loading={productSubmitLoading}
                            primary
                            submit
                        >
                            {editDataExists ? "Update" : "Add"}
                        </Button>
                        <Checkbox
                            label="Stabilized"
                            checked={stabilized}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={getChildClass("layout")}>
                        <section className={getChildClass("section-half")}>
                            <FormLayout>
                                {metaFieldInputs.slice(0, 5)}
                            </FormLayout>
                        </section>
                        <section className={getChildClass("section-half")}>
                            <FormLayout>
                                {metaFieldInputs.slice(
                                    5 - Math.floor(metaFieldInputs.length)
                                )}
                            </FormLayout>
                        </section>
                    </div>
                </Form>
            )}
        </div>
    );
}
