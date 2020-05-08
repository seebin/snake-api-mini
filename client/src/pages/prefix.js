import React, { useEffect, useState } from "react";
import Axios from "axios";
import { Table, message, Button, Modal, Form, Input, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
export function Prefix() {
  const [dataSource, setDataSource] = useState([]);
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();

  const deletePrefix = (id) => {
    Axios.post("/api/delete-prefix", { id: id }).then((res) => {
      if (res.data.success) {
        message.success("删除成功");
        getList();
      } else {
        message.error(res.data.errorMsg);
      }
    });
  };

  const columns = [
    {
      title: "序号",
      width: 70,
      align: "center",
      render: (text, record, index) => `${index + 1}`,
    },
    {
      title: "前缀",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "说明",
      dataIndex: "remark",
      key: "remark",
    },
    {
      title: "操作",
      width: 270,
      align: "center",
      render: (text, record, index) => (
        <Popconfirm
          title="您确定要删除该前缀吗?"
          onConfirm={() => {
            deletePrefix(record._id);
          }}
          okText="确定"
          cancelText="不删了"
        >
          <Button size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const getList = () => {
    Axios.get("/api/get-prefix-list").then((res) => {
      if (res.data.success) {
        setDataSource(res.data.data);
      } else {
        message.error(res.data.errorMsg);
      }
    });
  };

  useEffect(() => {
    getList();
  }, []);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const param = {
          code: values.code.startsWith("/") ? values.code : `/${values.code}`,
          remark: values.remark,
        };
        setConfirmLoading(true);
        Axios.post("/api/add-prefix", param).then((res) => {
          if (res.data.success) {
            setConfirmLoading(false);
            form.resetFields();
            setVisible(false);
            getList();
          } else {
            message.error(res.data.errorMsg);
          }
        });
      })
      .catch((reason) => console.log(reason));
  };

  return (
    <div>
      <div className="pb-10">
        <Button type="primary" onClick={() => setVisible(true)}>
          新增
        </Button>
        <span className="float-right">本页面删除前缀不会影响现有接口在用的前缀, 只会影响新增或编辑接口时可选的前缀列表选项</span>
      </div>
      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={(record) => record._id}
        pagination={false}
      />
      <Modal
        title="新增前缀"
        visible={visible}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
        centered={true}
        confirmLoading={confirmLoading}
      >
        <Form
          form={form}
          {...layout}
          name="basic"
          initialValues={{
            code: "",
            delay: 200,
          }}
        >
          <Form.Item
            label="前缀"
            name="code"
            rules={[{ required: true, message: "请输入接口前缀" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="说明" name="remark">
            <Input autoComplete="off" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
