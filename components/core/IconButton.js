import React from "react";
import { Button, Icon } from "@shopify/polaris";
import {
    CircleTickMajor,
    EditMinor,
    ThumbsUpMajor,
} from "@shopify/polaris-icons";

const icons = {
    approve: ThumbsUpMajor,
    edit: EditMinor,
    ready: CircleTickMajor,
};

export default function IconButton({ icon, productId, onClick, ...restProps }) {
    function handleClick() {
        onClick(productId);
    }

    return (
        <Button
            onClick={handleClick}
            plain={true}
            removeUnderline={true}
            {...restProps}
        >
            <Icon source={icons[icon]} />
        </Button>
    );
}
