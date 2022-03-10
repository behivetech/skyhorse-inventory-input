import React, { useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { Banner, IndexTable, Spinner, TextStyle } from "@shopify/polaris";
import { useQuery } from "@apollo/client";

import TextAlign from "../core/TextAlign";

import { QUERY_PRODUCT_APPROVAL } from "../../graphql/queries";

export default function ProductListApproval() {
    const [productListVariables, setProductListVariables] = useState({
        cursor: undefined,
        query: "status:draft",
    });
    const scrollerParent = useRef(null);
    const {
        data: {
            productVariants: {
                edges: productRows,
                pageInfo: { hasNextPage },
            },
        } = {
            productVariants: {
                edges: [],
                pageInfo: { hasNextPage: false },
            },
        },
        error: productsError,
        loading: productsLoading,
        fetchMore,
    } = useQuery(QUERY_PRODUCT_APPROVAL, {
        variables: {
            cursor: undefined,
            query: "status:draft",
        },
    });
    const resourceName = {
        singular: "Product Approval",
        plural: "Product Approvals",
    };

    return (
        <div style={{ height: "30%", overflow: "auto" }} ref={scrollerParent}>
            <InfiniteScroll
                pageStart={0}
                loadMore={handleLoadMore}
                getScrollParent={() => scrollerParent.current}
                hasMore={hasNextPage}
                loader={productsLoading && <Spinner key="spinner" />}
                useWindow={false}
            >
                <IndexTable
                    resourceName={resourceName}
                    itemCount={productRows.length}
                    headings={[
                        { title: "Type/Mine" },
                        { title: "$/Carat" },
                        { title: "Price" },
                    ]}
                    loading={productsLoading}
                    selectable={false}
                >
                    {productRows.map(
                        (
                            {
                                node: {
                                    price,
                                    product: {
                                        id,
                                        carat,
                                        mine,
                                        type,
                                        pricePerCarat,
                                    },
                                },
                            },
                            index
                        ) => (
                            <IndexTable.Row id={id} key={id} position={index}>
                                <IndexTable.Cell>
                                    <p>
                                        <TextStyle variation="strong">
                                            {type?.value} - {carat?.value}ct
                                        </TextStyle>
                                    </p>
                                    {mine && <p>{mine?.value}</p>}
                                </IndexTable.Cell>
                                <IndexTable.Cell>
                                    <TextAlign
                                        alignment="right"
                                        padding="0 45% 0 0"
                                    >
                                        $
                                        {parseFloat(
                                            pricePerCarat?.value
                                        ).toFixed(2)}
                                    </TextAlign>
                                </IndexTable.Cell>
                                <IndexTable.Cell>
                                    <TextAlign
                                        alignment="right"
                                        padding="0 45% 0 0"
                                    >
                                        ${price}
                                    </TextAlign>
                                </IndexTable.Cell>
                            </IndexTable.Row>
                        )
                    )}
                </IndexTable>
            </InfiniteScroll>
        </div>
    );
}
