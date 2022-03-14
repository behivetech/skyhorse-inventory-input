import { useContext } from "react";

import { ProductListContext } from "../components/providers/ProductsProvider";

export default function useProducts() {
    return useContext(ProductListContext);
}
