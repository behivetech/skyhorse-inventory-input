import { useContext } from "react";

import { ProductListContext } from "../components/providers/ProductListProvider";

export default function useProductList() {
    return useContext(ProductListContext);
}
