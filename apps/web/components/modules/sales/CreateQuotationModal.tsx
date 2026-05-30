"use client";

import React from "react";
import {
  Modal,
  Form,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Space,
  message,
  Input,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useCreateQuotationMutation,
  useGetSalesAccountsQuery,
  useCreateSalesAccountMutation,
} from "@/store/api/salesApi";
import { useGetProductsQuery } from "@/store/api/inventoryApi";
import type { CreateQuotationDto } from "@repo/shared-schemas";

const { Option } = Select;

interface CreateQuotationModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateQuotationModal({
  open,
  onClose,
}: CreateQuotationModalProps) {
  const [form] = Form.useForm();
  const { data: accounts = [], isLoading: accountsLoading } =
    useGetSalesAccountsQuery();
  const { data: products = [], isLoading: productsLoading } =
    useGetProductsQuery();
  const [createQuotation, { isLoading }] = useCreateQuotationMutation();
  const [createAccount, { isLoading: creatingAccount }] =
    useCreateSalesAccountMutation();
  const [accountModalOpen, setAccountModalOpen] = React.useState(false);
  const [accountForm] = Form.useForm();

  const handleSubmit = async (values: {
    accountId?: string;
    issueDate: dayjs.Dayjs;
    validUntil: dayjs.Dayjs;
    currency: string;
    lines: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      discountPercent?: number;
      taxPercent?: number;
      sdPercent?: number;
    }>;
  }) => {
    try {
      const payload: CreateQuotationDto = {
        status: "DRAFT",
        version: 1,
        accountId: values.accountId ?? null,
        issueDate: values.issueDate.toISOString(),
        validUntil: values.validUntil.toISOString(),
        currency: values.currency ?? "BDT",
        lines: values.lines.map((line) => ({
          productId: line.productId,
          quantity: Number(line.quantity),
          unitPrice: Number(line.unitPrice),
          discountPercent: Number(line.discountPercent ?? 0),
          taxPercent: Number(line.taxPercent ?? 15),
          sdPercent: Number(line.sdPercent ?? 0),
        })),
      };
      await createQuotation(payload).unwrap();
      message.success("Quotation created");
      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string | string[] } };
      const msg = e.data?.message;
      message.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : (msg ?? "Failed to create quotation"),
      );
    }
  };

  const handleCreateAccount = async (values: {
    name: string;
    taxBin?: string;
    billingAddress?: string;
  }) => {
    try {
      const account = await createAccount(values).unwrap();
      message.success("Customer account created");
      form.setFieldValue("accountId", account.id);
      setAccountModalOpen(false);
      accountForm.resetFields();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string | string[] } };
      const msg = e.data?.message;
      message.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : (msg ?? "Failed to create account"),
      );
    }
  };

  return (
    <>
      <Modal
        title="Create Quotation"
        open={open}
        onCancel={onClose}
        onOk={() => form.submit()}
        confirmLoading={isLoading}
        width={880}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            issueDate: dayjs(),
            validUntil: dayjs().add(30, "day"),
            currency: "BDT",
            lines: [
              {
                quantity: 1,
                discountPercent: 0,
                taxPercent: 15,
                sdPercent: 0,
              },
            ],
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="accountId" label="Customer">
              <Select
                allowClear
                showSearch
                placeholder="Select customer (optional for draft)"
                loading={accountsLoading}
                optionFilterProp="label"
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <div style={{ padding: 8 }}>
                      <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={() => setAccountModalOpen(true)}
                      >
                        New customer
                      </Button>
                    </div>
                  </>
                )}
              >
                {accounts.map((a) => (
                  <Option key={a.id} value={a.id} label={a.name}>
                    {a.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="currency"
              label="Currency"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="BDT">BDT</Option>
                <Option value="USD">USD</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="issueDate"
              label="Issue date"
              rules={[{ required: true }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item
              name="validUntil"
              label="Valid until"
              rules={[{ required: true }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </div>

          <Form.List name="lines">
            {(fields, { add, remove }) => (
              <>
                <div className="mb-2 font-medium text-sm">Line items</div>
                {fields.map(({ key, name, ...rest }) => (
                  <Space
                    key={key}
                    align="baseline"
                    wrap
                    style={{ display: "flex", marginBottom: 8 }}
                  >
                    <Form.Item
                      {...rest}
                      name={[name, "productId"]}
                      rules={[{ required: true, message: "Product" }]}
                    >
                      <Select
                        placeholder="Product"
                        style={{ width: 220 }}
                        loading={productsLoading}
                        showSearch
                        optionFilterProp="label"
                        onChange={(productId: string) => {
                          const product = products.find(
                            (p) => p.id === productId,
                          );
                          if (product?.basePrice != null) {
                            form.setFieldValue(
                              ["lines", name, "unitPrice"],
                              Number(product.basePrice),
                            );
                          }
                        }}
                      >
                        {products.map((p) => (
                          <Option
                            key={p.id}
                            value={p.id}
                            label={`${p.sku} — ${p.name}`}
                          >
                            {p.sku} — {p.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...rest}
                      name={[name, "quantity"]}
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={0.0001} placeholder="Qty" />
                    </Form.Item>
                    <Form.Item
                      {...rest}
                      name={[name, "unitPrice"]}
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={0} placeholder="Price" />
                    </Form.Item>
                    <Form.Item {...rest} name={[name, "discountPercent"]}>
                      <InputNumber min={0} max={100} placeholder="Disc %" />
                    </Form.Item>
                    <Form.Item {...rest} name={[name, "taxPercent"]}>
                      <InputNumber min={0} max={100} placeholder="VAT %" />
                    </Form.Item>
                    <Form.Item {...rest} name={[name, "sdPercent"]}>
                      <InputNumber min={0} max={100} placeholder="SD %" />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    ) : null}
                  </Space>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  block
                >
                  Add line
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Modal
        title="New customer"
        open={accountModalOpen}
        onCancel={() => setAccountModalOpen(false)}
        onOk={() => accountForm.submit()}
        confirmLoading={creatingAccount}
      >
        <Form
          form={accountForm}
          layout="vertical"
          onFinish={handleCreateAccount}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="taxBin" label="BIN">
            <Input />
          </Form.Item>
          <Form.Item name="billingAddress" label="Billing address">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
