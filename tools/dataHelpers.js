export function getVariant(variants, variantName) {
    return variants?.edges[0]?.node[variantName];
}

export function priceFormat(price) {
    return price ? Number.parseFloat(price).toFixed(2) : 0.0;
}

export function getProductId(id) {
    return id.split("/").slice(-1);
}

function getBaseUrl() {
    return `https://${SHOP}`;
}

function buildUrl(id, path) {
    return [getBaseUrl(), path, getProductId(id)].join("");
}

export function getProductLink(id) {
    console.log("product link", buildUrl(id, "/admin/products/"), id);
    return buildUrl(id, "/admin/products/");
}

export function getBarcodeLink(id) {
    return buildUrl(id, "/admin/apps/retail-labels-printer/print/preview?id=");
}
