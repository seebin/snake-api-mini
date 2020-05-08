import React, { useEffect, useState, useRef } from "react";
import Axios from "axios";
import {
  Table,
  message,
  Button,
  Modal,
  Popconfirm,
  Space,
  Row,
  Col,
  Form,
  Input,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Ace } from "../base/ace";
import JSON5 from "json5";
import { mock } from "mockjs";

const { TextArea } = Input;

export function BaseData() {
  const [dataSource, setDataSource] = useState([]);
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [handleId, setHandleId] = useState(null);
  const aceRef = useRef(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: "序号",
      width: 70,
      align: "center",
      render: (text, record, index) => `${index + 1}`,
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
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
        <Space>
          <Button
            size="small"
            onClick={() => editBaseData(record._id)}
            type="primary"
            icon={<EditOutlined />}
          >
            编辑
          </Button>
          <Popconfirm
            title="您确定要删除该模板数据吗?"
            onConfirm={() => {
              deleteBaseData(record._id);
            }}
            okText="确定"
            cancelText="不删了"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    if (!handleId || !visible) return;

    Axios.post("/api/get-base-data-by-id", { id: handleId }).then((res) => {
      if (res.data.success) {
        form.setFieldsValue({
          name: res.data.data.name,
          remark: res.data.data.remark,
        });
        aceRef.current.editor.setValue(JSON5.parse(res.data.data.aceData));
      } else {
        message.error(res.data.errorMsg);
      }
    });
  }, [handleId, form, visible]);

  const editBaseData = (id) => {
    setHandleId(id);
    setVisible(true);
  };

  const deleteBaseData = (id) => {
    Axios.post("/api/delete-base-data", { id }).then((res) => {
      if (res.data.success) {
        message.success("删除成功");
        getList();
      } else {
        message.error(res.data.errorMsg);
      }
    });
  };

  const getList = () => {
    Axios.get("/api/get-base-list").then((res) => {
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

  // 获取响应数据
  const jsonValue = () => {
    if (!aceRef.current.getValue()) {
      message.error("请输入响应数据");
      return false;
    }
    try {
      return JSON5.parse(aceRef.current.getValue());
    } catch (reason) {
      console.log(reason);
      message.error("json 解析出错");
      return false;
    }
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const jsonData = jsonValue();
        if (!jsonData) return;
        const param = {
          name: values.name,
          remark: values.remark,
          data: mock(jsonData),
          aceData: JSON5.stringify(aceRef.current.getValue()),
        };
        if (handleId) {
          // 编辑
          param.id = handleId;
        }
        setConfirmLoading(true);
        Axios.post("/api/update-base-data", param).then((res) => {
          if (res.data.success) {
            form.resetFields();
            setConfirmLoading(false);
            aceRef.current.editor.setValue("");
            message.success("保存成功");
            getList();
            setVisible(false);
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
        <Button
          type="primary"
          onClick={() => {
            setVisible(true);
            setHandleId(null);
          }}
        >
          新增
        </Button>
        <span className="float-right">设置响应数据, 可在新建接口时快捷选择对应的数据模版显示在编辑器内</span>
      </div>
      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={(record) => record._id}
        pagination={false}
      />
      <Modal
        title="新增响应数据"
        visible={visible}
        onOk={handleOk}
        onCancel={() => {
          form.resetFields();
          setConfirmLoading(false);
          aceRef.current.editor.setValue("");
          setVisible(false);
        }}
        centered={true}
        confirmLoading={confirmLoading}
        forceRender={true}
        width={900}
      >
        <Row>
          <Col span={8} className="pr-10">
            <Form
              form={form}
              name="basic"
              layout="vertical"
              initialValues={{
                name: "",
                remark: "",
              }}
            >
              <Form.Item
                label="名称"
                name="name"
                rules={[{ required: true, message: "请输入名称" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item label="说明" name="remark">
                <TextArea autoComplete="off" />
              </Form.Item>
            </Form>
          </Col>
          <Col span={16}>
            <h4>响应数据</h4>
            <Ace ref={aceRef} height="340px"></Ace>
          </Col>
        </Row>
      </Modal>
    </div>
  );
}
