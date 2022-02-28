import React, { useCallback, useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import {
  Banner,
  Button,
  Card,
  Checkbox,
  Form,
  FormLayout,
  Link,
  Page,
} from "@shopify/polaris";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ResourcePicker, TitleBar } from "@shopify/app-bridge-react";
import store from "store-js";
import CheckboxControlled from "../components/app/CheckboxControlled";
import SelectControlled from "../components/app/SelectControlled";
import TextFieldControlled from "../components/app/TextFieldControlled";
import { useForm } from "react-hook-form";
import mapValues from "lodash.mapvalues";

// const QUERY_PRODUCT = gql`
// query products (first: 10) {
//         edges {
//         node {
//                 id
//                 metafields (first: 50) {
//                         edges{
//                                 node {
//                                                 id
//                                                 key
//                                         }
//                                 }
//                         }
//                 }
//         }
// }
// `

// const QUERY_METAFIELDS = gql`
//         query GetMetafields {
//                 metafieldDefinitions (
//                         ownerType: PRODUCT,
//                         first: 20,
//                         sortKey: PINNED_POSITION,
//                         reverse: true
//                         ){
//                         edges {
//                                 node {
//                                         namespace
//                                         key
//                                         name
//                                         type {
//                                                 name
//                                                 category
//                                         }
//                                         validationStatus
//                                 }
//                         }
//                 }
//         }
// `

const ADD_PRODUCT = gql`
  mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
        vendor
        variants(first: 1) {
          edges {
            node {
              barcode
            }
          }
        }
      }
      shop {
        url
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const formFieldParams = {
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
  type: {
    label: "Type",
    type: "text",
    validation: yup.string().required(),
    getDescriptionValue: (value) => value,
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
    getDescriptionValue: (value) => value,
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
          label: "Ma'anshan, China",
          value: "Ma'anshan, China",
        },
      ],
    },
  },
  carat: {
    label: "Carat",
    type: "number",
    validation: yup.number().positive().required(),
    getDescriptionValue: (value) => `${value}ct`,
    inputFieldParams: {
      fieldType: "text",
    },
  },
  pricePerCarat: {
    label: "Price Per Carat",
    type: "number",
    validation: yup.number().positive().required(),
    getDescriptionValue: (value) => `$${parseFloat(value).toFixed(2)}`,
    inputFieldParams: {
      fieldType: "text",
    },
  },
  priceApproved: {
    label: "Price Approved",
    inputFieldParams: {
      fieldType: "checkbox",
    },
  },
  length: {
    label: "Length",
    type: "number",
    validation: yup.number().positive(),
    getDescriptionValue: (value) => `${value}in`,
    inputFieldParams: {
      fieldType: "text",
    },
  },
  width: {
    label: "Width",
    type: "number",
    validation: yup.number().positive(),
    getDescriptionValue: (value) => `${value}in`,
    inputFieldParams: {
      fieldType: "text",
    },
  },
  height: {
    label: "Height",
    type: "number",
    validation: yup.number().positive(),
    getDescriptionValue: (value) => `${value}in`,
    inputFieldParams: {
      fieldType: "text",
    },
  },
};

const schema = yup.object(mapValues(formFieldParams, "validation")).required();

const Index = ({ shopOrigin }) => {
  const [stabilized, setStabilized] = useState(false);
  const handleChange = useCallback(
    (newChecked) => setStabilized(newChecked),
    []
  );
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset: resetForm,
  } = useForm({
    defaultValues: { pricePerCarat: 2.0 },
    resolver: yupResolver(schema),
  });
  // const {data: metafieldsData, loading: metafieldsLoading, error: metafieldsError} = useQuery(QUERY_METAFIELDS);
  // console.log({metafieldsData, metafieldsLoading, metafieldsError})
  const [
    addProduct,
    {
      data: addProductData,
      error: addProductError,
      loading: addProductLoading,
      reset: resetMutation,
    },
  ] = useMutation(ADD_PRODUCT);
  const renderInputField = {
    checkbox: (props) => <CheckboxControlled {...props} control={control} />,
    select: (props) => <SelectControlled {...props} control={control} />,
    text: (props) => <TextFieldControlled {...props} control={control} />,
  };

  function renderHtmlRows(formData, index) {
    const { length, width, height } = formData;
    const detailRows = Object.keys(formFieldParams).map((key) => {
      const value = formData[key];
      const { label, getDescriptionValue } = formFieldParams[key];

      return (
        value &&
        getDescriptionValue &&
        `<tr><td>${label}</td><td>${getDescriptionValue(value)}</td></tr>`
      );
    });

    if (!length && !width && !height) {
      const contactLink = `<a href="/pages/contact" target="_blank">contact form</a>`;

      detailRows.push(
        `<tr><td colspan="2">Measurements, images or other information available upon request through our ${contactLink}</td></tr>`
      );
    }

    return detailRows;
  }

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
      .replace("#", "n")
      .split(" ")
      .map((word) => word.substring(0, 2))
      .join("")
      .substring(0, 4)
      .toUpperCase();
    const slot = barcode.toString().charAt(0);

    return `${typeCode}-${mineCode}-B${bin}S${slot}-${getRandomNumber(3)}`;
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
    const { pricePerCarat, type, mine, carat } = formData;
    const tags = [type, mine];
    const barcode = getBarcode(type);

    return {
      variables: {
        input: {
          // collectionsToJoin: [],
          title: `${type}${
            stabilized ? ` (Stabilized)` : ""
          } - ${mine} - ${carat}ct`,
          vendor: "Skyhorse Industries",
          descriptionHtml: `<table>${renderHtmlRows(formData).join(
            ""
          )}</table>`,
          handle: [...type.split(" "), barcode].join("-").toLowerCase(),
          metafields: Object.keys(formData).map((key) => ({
            key,
            namespace: "my_fields",
            value: key === "priceApproved" ? formData[key] : `${formData[key]}`,
          })),
          status: "DRAFT",
          productType: type,
          tags: tags.join(", "),
          variants: [
            {
              price: getPrice(pricePerCarat, carat),
              barcode,
              sku: getSkuCode({ mine, type, barcode, bin }),
            },
          ],
        },
      },
    };
  }

  function getLink(linkType) {
    const { product, shop } = addProductData.productCreate;
    const linkTypes = {
      barcode: "/admin/apps/retail-labels-printer/print/preview?id=",
      contact: "/pages/contact",
      productPage: "/admin/products/",
    };
    const linkArray = [shop.url, linkTypes[linkType]];

    if (linkType !== "contact") {
      linkArray.push(product.id.split("/").slice(-1));
    }

    return linkArray.join("");
  }

  async function onSubmit(formData) {
    await addProduct(getProductInputs(formData));
  }

  function handleSuccessBannerDismiss() {
    resetForm();
    resetMutation();
  }

  return (
    <Page narrowWidth divider>
      <TitleBar title="Create Product" />
      {addProductError && (
        <Banner status="critical" onDismiss={() => resetMutation()}>
          {addProductError?.message}
        </Banner>
      )}
      {addProductData && (
        <Banner
          status="success"
          title="Product Successfully Created"
          onDismiss={handleSuccessBannerDismiss}
        >
          <p>
            Product Page:{" "}
            <Link url={getLink("productPage")} external>
              {addProductData.productCreate.product.title}
            </Link>
            <br />
            <Link url={getLink("barcode")} external>
              Print Barcode
            </Link>
          </p>
        </Banner>
      )}
      <Form name="inventory-form" onSubmit={handleSubmit(onSubmit)}>
        <Card title="Product Form">
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
                  error: errors[key]?.message,
                  key: `${fieldType}-field-${key}__index`,
                  name: key,
                  label,
                  options,
                  placeholder,
                  type,
                });
              })}
              <Button
                disabled={addProductLoading}
                loading={addProductLoading}
                submit
              >
                Add
              </Button>
            </FormLayout>
          </div>
        </Card>
      </Form>
    </Page>
  );
};

export default Index;
