import { Modal as PolarisModal } from "@shopify/polaris";

import getClassName from "../../tools/getClassName";
import styles from "./Modal.module.scss";

export default function Modal({ ...props }) {
    return <PolarisModal {...props} />;
}

Modal.Section = PolarisModal.Section;
