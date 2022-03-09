import React, { useCallback, useState } from "react";
import {
    Banner,
    Caption,
    DropZone,
    List,
    Stack,
    Thumbnail,
} from "@shopify/polaris";
import { gql, useMutation } from "@apollo/client";

const STAGED_UPLOADS_CREATE = gql`
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
            stagedTargets {
                resourceUrl
                url
                parameters {
                    name
                    value
                }
            }
            userErrors {
                field
                message
            }
        }
    }
`;

const COLLECTION_UPDATE = gql`
    mutation collectionUpdate($input: CollectionInput!) {
        collectionUpdate(input: $input) {
            collection {
                id
                image {
                    originalSrc
                }
            }
            userErrors {
                field
                message
            }
        }
    }
`;

export default function DropZoneWithImageFileUpload({
    onImageUploaded = () => null,
}) {
    const [files, setFiles] = useState([]);
    const [rejectedFiles, setRejectedFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [collectionUpdate] = useMutation(COLLECTION_UPDATE);
    const [stagedUploadsCreate] = useMutation(STAGED_UPLOADS_CREATE);
    const hasError = rejectedFiles.length > 0;

    const handleDrop = useCallback(
        (_droppedFiles, acceptedFiles, rejectedFiles) => {
            setFiles((files) => [...files, ...acceptedFiles]);
            setRejectedFiles(rejectedFiles);
        },
        []
    );

    const handleDropAccepted = async ([file]) => {
        setLoading(true);

        let { data } = await stagedUploadsCreate({
            variables: {
                input: [
                    {
                        resource: "COLLECTION_IMAGE",
                        filename: file.name,
                        mimeType: file.type,
                        fileSize: file.size.toString(),
                        httpMethod: "POST",
                    },
                ],
            },
        });

        const [{ url, parameters }] = data.stagedUploadsCreate.stagedTargets;

        const formData = new FormData();

        parameters.forEach(({ name, value }) => {
            formData.append(name, value);
        });

        formData.append("file", file);

        try {
            const response = await fetch(url, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw "File could not be uploaded.";
            }

            const key = parameters.find((p) => p.name === "key");
            let { data } = await collectionUpdate({
                variables: {
                    input: {
                        id: props.collectionId,
                        image: {
                            src: `${url}/${key.value}`,
                        },
                    },
                },
            });

            if (data.collectionUpdate.userErrors.length) {
                throw "Collection image could not be updated.";
            }
        } catch (err) {
            props.setToastMessage(err);
        }

        setLoading(false);
    };

    const fileUpload = !files.length && <DropZone.FileUpload />;
    const uploadedFiles = files.length > 0 && (
        <Stack vertical>
            {files.map((file, index) => (
                <Stack alignment="center" key={index}>
                    <Thumbnail
                        size="small"
                        alt={file.name}
                        source={window.URL.createObjectURL(file)}
                    />
                    <div>
                        {file.name} <Caption>{file.size} bytes</Caption>
                    </div>
                </Stack>
            ))}
        </Stack>
    );

    return (
        <Stack vertical>
            {hasError && (
                <Banner
                    title="The following images couldn’t be uploaded:"
                    status="critical"
                >
                    <List type="bullet">
                        {rejectedFiles.map((file, index) => (
                            <List.Item key={index}>
                                {`"${file.name}" is not supported. File type must be .gif, .jpg, .png or .svg.`}
                            </List.Item>
                        ))}
                    </List>
                </Banner>
            )}
            <DropZone
                accept="image/*"
                type="image"
                onDrop={handleDrop}
                onDropAccepted={handleDropAccepted}
                allowMultiple={false}
            >
                {uploadedFiles}
                {fileUpload}
            </DropZone>
        </Stack>
    );
}
