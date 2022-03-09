import React, { useRef } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { Banner, IndexTable, Spinner, TextStyle } from "@shopify/polaris";
import { useQuery } from "@apollo/client";

import TextAlign from "../core/TextAlign";

import { QUERY_PRODUCT_APPROVAL } from "../../graphql/queries";

export default function ProductListApproval() {
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

    function handleLoadMore() {
        const rowLength = productRows.length;
        const lastProduct = productRows[rowLength - 1] || {};
        console.log(productRows, lastProduct.cursor, lastProduct);
        fetchMore({
            variables: {
                query: "status:draft",
                cursor: lastProduct.cursor,
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
                console.log(previousResult, fetchMoreResult);
                const newEdges = fetchMoreResult.productVariants.edges;
                const pageInfo = fetchMoreResult.productVariants.pageInfo;

                return newEdges.length
                    ? {
                          productVariants: {
                              __typename:
                                  previousResult.productVariants.__typename,
                              edges: [
                                  ...previousResult.productVariants.edges,
                                  ...newEdges,
                              ],
                              pageInfo,
                          },
                      }
                    : previousResult;
            },
        });
    }

    return (
        <>
            <div>Product Row Count: {productRows.length}</div>

            <div
                style={{ height: "30%", overflow: "auto" }}
                ref={scrollerParent}
            >
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
                            { title: "Carat" },
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
                                <IndexTable.Row
                                    id={id}
                                    key={id}
                                    position={index}
                                >
                                    <IndexTable.Cell>
                                        <p>
                                            <TextStyle variation="strong">
                                                {type?.value}
                                            </TextStyle>
                                        </p>
                                        {mine && <p>{mine?.value}</p>}
                                    </IndexTable.Cell>
                                    <IndexTable.Cell>
                                        <TextAlign
                                            alignment="center"
                                            padding="0 45% 0 0"
                                        >
                                            {carat?.value}ct
                                        </TextAlign>
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
        </>
    );
}
