import { UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Col, Flex, Form, Grid, Input, InputNumber, Row, Space, Typography } from "antd";
import { useState } from "react";

const MOCK_LECTURER = {
  avatar: "https://picsum.photos/200/300",
  name: "Lê Đức Huy",
  email: "huyld@fpt.edu.com",
  phone: "0987654321",
  status: "active",
  password: "123456",
  years_experience: 5,
  degree: "Bachelor of Science",
  teaching_major: "Computer Science",
};

export function MentorProfilePage() {
  const [isReadOnly, setIsReadOnly] = useState(true);

  const [form] = Form.useForm();

  const handleSubmit = () => {
    const values = form.getFieldsValue();

    console.log(values);
    alert(JSON.stringify(values));

    setIsReadOnly(true);
  };

  return (
    <div className="flex h-screen">
      <div className="shadow p-4 w-60">Sidebar here</div>

      <div className="grow p-4">
        <Form
          form={form}
          layout="vertical"
          initialValues={MOCK_LECTURER}
          className={["max-w-3xl mx-auto"].join(" ")}
          variant={isReadOnly ? "borderless" : "outlined"}
          rootClassName={[
            "[&_.ant-form-item-label]:font-bold",
            isReadOnly ? "[&_input]:p-0 [&_input]:pointer-events-none" : "",
          ].join(" ")}
        >
          <Flex gap={16} align="center" className="mb-6">
            <Form.Item name="avatar" className="flex justify-center">
              <Avatar size={180} icon={<UserOutlined />} />
            </Form.Item>

            <Space direction="vertical" className="grow">
              <Form.Item name="name">
                <Input className="font-bold" size="large" />
              </Form.Item>

              <Form.Item name="email">
                <Input />
              </Form.Item>

              <Form.Item name="phone">
                <Input />
              </Form.Item>
            </Space>
          </Flex>

          <Typography.Title level={4} className="mb-8">
            Basic Information
          </Typography.Title>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="years_experience" label="Years of Experience">
                <InputNumber className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="degree" label="Degree">
            <Input />
          </Form.Item>

          <Form.Item name="teaching_major" label="Teaching Major">
            <Input />
          </Form.Item>

          <Flex gap={16} justify="center" className="mt-6">
            <Button color="orange" variant="filled">
              Change Password
            </Button>

            <Button variant="solid" color="green" onClick={isReadOnly ? () => setIsReadOnly(false) : handleSubmit}>
              Update Profile
            </Button>
          </Flex>
        </Form>
      </div>
    </div>
  );
}
