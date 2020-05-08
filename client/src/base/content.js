import React from "react";
import { Breadcrumb } from "antd";

export default function Content(props) {
  const warp = {
    padding: "66px 20px 0 20px",
    minHeight: "calc(100vh - 42px)",
  };
  return (
    <div style={warp}>
      <Breadcrumb style={{ padding: "10px 0" }}>
        <Breadcrumb.Item>接口列表</Breadcrumb.Item>
      </Breadcrumb>
      {props.children}
    </div>
  );
}
