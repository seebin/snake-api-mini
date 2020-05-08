import React, { useEffect, useState } from "react";
import { Form, Input, Button, Radio, message } from "antd";
import Axios from "axios";

const layout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 8 },
};
const tailLayout = {
  wrapperCol: { offset: 3, span: 8 },
};
export function Project() {
  const [form] = Form.useForm();

  const [configId, setConfigId] = useState(null);
  useEffect(() => {
    Axios.get("/api/get-config").then((res) => {
      if (res.data.success) {
        if (!res.data.data.target) return;
        form.setFieldsValue({
          target: res.data.data.target,
          delay: res.data.data.delay,
          changeOrigin: res.data.data.changeOrigin,
        });
        setConfigId(res.data.data._id);
      } else {
        message.error(res.data.errorMsg);
      }
    });
  }, [setConfigId, form]);

  const onFinish = (values) => {
    console.log("Success:", values);
    const param = {
      target: values.target,
      delay: values.delay,
      id: configId,
      changeOrigin: values.changeOrigin,
    };
    Axios.post("/api/update-config", param).then((res) => {
      if (res.data.success) {
        message.success("保存成功");
      } else {
        message.error(res.data.errorMsg);
      }
    });
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="p-20">
      <Form
        form={form}
        {...layout}
        name="basic"
        initialValues={{
          changeOrigin: false,
          delay: 200,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="代理地址"
          name="target"
          rules={[{ required: true, message: "请输入项目代理地址" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="响应延时"
          name="delay"
          rules={[{ required: true, message: "请输入Mock接口响应延时!" }]}
        >
          <Input autoComplete="off" />
        </Form.Item>

        <Form.Item label="变更来源" name="changeOrigin">
          <Radio.Group>
            <Radio value={true}>变更</Radio>
            <Radio value={false}>不变更</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
