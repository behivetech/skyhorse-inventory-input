import React, { useCallback, useMemo, useState } from "react";
import { useMutation } from "@apollo/client";
import {
  Banner,
  Button,
  Card,
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

import { ADD_PRODUCT, UPDATE_PRODUCT } from "../../graphql/mutations";
import { QUERY_PRODUCT } from "../../graphql/queries";

const schema = yup.object(mapValues(formFieldParams, "validation")).required();

export default function ProductForm({
  editData = {},
  closeParentModal = () => null,
}) {
  const { editDataExists, defaultValues, gqlMutation } = useMemo(() => {
    const defaultValues = {};
    const editDataExists = !!editData.id;
    let editValue = null;

    for (let valueKey in editData) {
      editValue = editData[valueKey];

      if (editValue || editValue?.value) {
        defaultValues[valueKey] =
          typeof editValue === "string" ? editValue : editValue?.value;
      }
    }

    return {
      defaultValues,
      editDataExists,
      gqlMutation: editDataExists ? UPDATE_PRODUCT : ADD_PRODUCT,
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
  console.log(editData);
  const handleChange = useCallback(
    (newChecked) => setStabilized(newChecked),
    []
  );
  const [
    submitProduct,
    {
      data: submitProductData,
      error: submitProductError,
      loading: submitProductLoading,
      reset: resetMutation,
    },
  ] = useMutation(gqlMutation, {
    refetchQueries: [{ query: QUERY_PRODUCT }],
    awaitRefetchQueries: true,
  });
  const { productReturnData } = useMemo(() => {
    const productKey = editDataExists ? "productUpdate" : "productCreate";
    const { product } = submitProductData ? submitProductData[productKey] : {};

    return {
      productReturnData: product,
    };
  }, [submitProductData]);
  const renderInputField = {
    checkbox: (props) => <CheckboxControlled {...props} control={control} />,
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
    const uniqueId = editData.sku
      ? editData.sku?.split("-").slice(-1).join("")
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

  function getProductInputs(formData) {
    const { pricePerCarat, type, mine, carat, bin } = formData || {};
    const tags = [type, mine];
    const barcode = editData.barcode || getBarcode();
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
          handle: [...type.split(" "), barcode].join("-").toLowerCase(),
          metafields: Object.keys(formFieldParams)
            .map((key) => {
              let dataVal =
                formFieldParams[key]?.type === "boolean" && !dataVal
                  ? "false"
                  : formData[key];

              const metafieldObject = {
                key,
                namespace: "my_fields",
                value: dataVal ? `${dataVal}` : undefined,
              };

              if (editData) {
                metafieldObject.id = editData[key]?.id;
              }

              return metafieldObject;
            })
            .filter((inputObject) => !!inputObject?.value),
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

  function getLink(linkType) {
    const linkTypes = {
      barcode: "/admin/apps/retail-labels-printer/print/preview?id=",
      productPage: "/admin/products/",
    };
    const linkArray = [`https://${SHOP}`, linkTypes[linkType]];

    if (productReturnData?.id) {
      linkArray.push(productReturnData?.id.split("/").slice(-1));
    }

    return linkArray.join("");
  }

  function handleSuccessBannerDismiss() {
    resetForm();
    resetMutation();
    closeParentModal();
  }

  function onSubmit(formData) {
    console.log(getProductInputs(formData));
    submitProduct(getProductInputs(formData));
  }

  return (
    <>
      {submitProductError && (
        <Banner status="critical" onDismiss={() => resetMutation()}>
          {submitProductError?.message}
        </Banner>
      )}
      {productReturnData && (
        <Banner
          status="success"
          title={`Product Successfully ${
            editDataExists ? "Updated" : "Created"
          }`}
          action={{ content: "Dismiss", onAction: handleSuccessBannerDismiss }}
          secondaryAction={
            editDataExists
              ? undefined
              : { content: "Add Similar Item", onAction: () => resetMutation() }
          }
          onDismiss={handleSuccessBannerDismiss}
        >
          <p>
            Product Page:{" "}
            <Link url={getLink("productPage")} external>
              {productReturnData?.title}
            </Link>
            <br />
            <Link url={getLink("barcode")} external>
              Print Barcode
            </Link>{" "}
            {productReturnData?.variants.edges[0].node.barcode}
          </p>
        </Banner>
      )}
      {!productReturnData && (
        <Form name="inventory-form" onSubmit={handleSubmit(onSubmit)}>
          <Card title={`${editDataExists ? "Edit" : "Create"} Product Form`}>
            <div style={{ padding: "2rem" }}>
              <FormLayout>
                <Checkbox
                  label="Stabilized"
                  checked={stabilized}
                  onChange={handleChange}
                />
                {Object.keys(formFieldParams).map((key, index) => {
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
                })}
                <Button
                  disabled={submitProductLoading}
                  loading={submitProductLoading}
                  submit
                >
                  {editDataExists ? "Update" : "Add"}
                </Button>
              </FormLayout>
            </div>
            <div style={{ paddingBottom: "6rem" }} />
          </Card>
        </Form>
      )}
    </>
  );
}
