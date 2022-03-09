import React from "react";
import { Button, Icon } from "@shopify/polaris";
import { EditMinor } from "@shopify/polaris-icons";

export default function ProductEditButton({ productId, onClick }) {
    function handleClick() {
        onClick(productId);
    }

    return (
        <Button onClick={handleClick} plain={true} removeUnderline={true}>
            <Icon source={EditMinor} />
        </Button>
    );
}
