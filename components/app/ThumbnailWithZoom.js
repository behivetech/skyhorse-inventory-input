import React, { useCallback, useState } from "react";
import { Button, Modal, Thumbnail } from "@shopify/polaris";
import NoImage from "../core/NoImage";

export default function ThumbnailWithZoom({ alt, src }) {
    const [showModal, setShowModal] = useState(false);
    const handleShowModal = useCallback(() => setShowModal(!showModal), [
        showModal,
    ]);

    return (
        <Modal
            activator={
                src ? (
                    <Button
                        monochrome
                        removeUnderline
                        onClick={handleShowModal}
                    >
                        <Thumbnail source={src} alt={alt} size="small" />
                    </Button>
                ) : (
                    <div style={{ width: "78px", height: "78px" }}>
                        <NoImage />
                    </div>
                )
            }
            open={showModal}
            onClose={handleShowModal}
            title="Product Image"
        >
            <Modal.Section>
                {src ? (
                    <img style={{ width: "100%" }} src={src} alt={alt} />
                ) : (
                    <NoImage />
                )}
            </Modal.Section>
        </Modal>
    );
}
