export function getVariant(variants, variantName) {
    return variants?.edges[0]?.node[variantName];
}

export function getMetafield(metafields, metafieldKey) {
    return metafields?.edges?.find(({ node }) => node.key === metafieldKey)
        ?.node;
}

export function priceFormat(price) {
    return price ? Number.parseFloat(price).toFixed(2) : 0.0;
}

export function getProductLink(id) {
    const linkArray = [`https://${SHOP}/admin/products/`];

    linkArray.push(id.split("/").slice(-1));
    return linkArray.join("");
}
