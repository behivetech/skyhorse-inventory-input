import React from "react";

export default function TextAlign({
  alignment = "left",
  children,
  Element = "div",
  padding = "0",
}) {
  return (
    <Element style={{ padding, textAlign: alignment }}>{children}</Element>
  );
}
