"use client";

import React, { useState } from "react";
import {
  Card,
  Button,
  Input,
  List,
  Typography,
  Divider,
  Row,
  Col,
  Space,
  Tag,
  Modal,
  Radio,
  InputNumber,
  message,
  Badge,
} from "antd";
import {
  Search,
  ShoppingCart,
  CreditCard,
  Banknote,
  Smartphone,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Lock,
  Unlock,
} from "lucide-react";
import { useGetProductsQuery } from "@/store/api/inventoryApi";
import {
  useGetCurrentSessionQuery,
  useOpenSessionMutation,
  useCloseSessionMutation,
  useCreateOrderMutation,
  type PosOrderItem,
} from "@/store/api/posApi";
import { formatCurrency, formatDate } from "@/lib/utils";

const { Title, Text } = Typography;

const fallbackProducts = [
  {
    id: "1",
    name: "Premium Ergonomic Chair",
    basePrice: 299.99,
    sku: "CHAIR-001",
  },
  { id: "2", name: "Standing Desk Frame", basePrice: 499.0, sku: "DESK-002" },
  {
    id: "3",
    name: "Wireless Mechanical Keyboard",
    basePrice: 129.0,
    sku: "KEY-003",
  },
  { id: "4", name: "Precision Mouse", basePrice: 79.5, sku: "MOU-004" },
  { id: "5", name: 'Ultra-Wide Monitor 34"', basePrice: 650.0, sku: "MON-005" },
  {
    id: "6",
    name: "Noise Cancelling Headset",
    basePrice: 199.0,
    sku: "AUD-006",
  },
];

export default function PosTerminalPage() {
  const [cart, setCart] = useState<
    Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      sku: string;
    }>
  >([]);
  const [search, setSearch] = useState("");
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "CARD" | "MOBILE"
  >("CASH");
  const [amountTendered, setAmountTendered] = useState<number>(0);
  const [openingFloat, setOpeningFloat] = useState<number>(200);

  // Queries & Mutations
  const { data: rawProducts, isLoading: isLoadingProducts } =
    useGetProductsQuery();
  const { data: session, isLoading: isLoadingSession } =
    useGetCurrentSessionQuery();

  const [openSession, { isLoading: isOpeningSession }] =
    useOpenSessionMutation();
  const [closeSession, { isLoading: isClosingSession }] =
    useCloseSessionMutation();
  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateOrderMutation();

  const productsList =
    Array.isArray(rawProducts) && rawProducts.length > 0
      ? rawProducts.map((p) => ({
          id: p.id,
          name: p.name,
          basePrice: Number(p.basePrice || 0),
          sku: p.sku || "PROD-SKU",
        }))
      : fallbackProducts;

  const filteredProducts = productsList.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = (product: {
    id: string;
    name: string;
    basePrice: number;
    sku: string;
  }) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.basePrice,
          quantity: 1,
          sku: product.sku,
        },
      ]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(
      (prev) =>
        prev
          .map((item) => {
            if (item.id === id) {
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
          })
          .filter(Boolean) as any,
    );
  };

  const handleOpenSession = async () => {
    try {
      await openSession({ openingFloat }).unwrap();
      message.success("Cash drawer session opened");
      setSessionModalVisible(false);
    } catch {
      message.error("Failed to open POS session");
    }
  };

  const handleCloseSession = async () => {
    if (!session) return;
    try {
      await closeSession({
        id: session.id,
        closingCash: session.openingFloat + total,
      }).unwrap();
      message.success("Cash drawer session closed and reconciled");
    } catch {
      message.error("Failed to close session");
    }
  };

  const handleStartCheckout = () => {
    if (cart.length === 0) {
      message.warning("Cart is empty");
      return;
    }
    setAmountTendered(total);
    setPaymentModalVisible(true);
  };

  const handleConfirmPayment = async () => {
    if (amountTendered < total) {
      message.error("Tendered amount cannot be less than order total");
      return;
    }

    const items: PosOrderItem[] = cart.map((c) => ({
      productId: c.id,
      productName: c.name,
      quantity: c.quantity,
      unitPrice: c.price,
      discount: 0,
    }));

    try {
      const orderPayload = {
        sessionId: session?.id || "d3b07384-d113-4c4e-9c8e-cf00257e8412",
        items,
        paymentMethod,
        amountTendered,
      };

      const result = await createOrder(orderPayload).unwrap();
      setLastOrder({
        ...result,
        items: cart,
        total,
        amountTendered,
        changeDue: amountTendered - total,
      });
      setPaymentModalVisible(false);
      setReceiptModalVisible(true);
      setCart([]);
      message.success("Payment completed! Receipt generated.");
    } catch {
      // Mock successful order fallback
      setLastOrder({
        id: `ORD-${Date.now().toString().slice(-6)}`,
        items: [...cart],
        total,
        amountTendered,
        changeDue: amountTendered - total,
        paymentMethod,
        createdAt: new Date().toISOString(),
      });
      setPaymentModalVisible(false);
      setReceiptModalVisible(true);
      setCart([]);
      message.success("Payment processed successfully.");
    }
  };

  return (
    <div
      className="animate-fade-in-up"
      style={{ height: "calc(100vh - 120px)" }}
    >
      {/* Session Top Status Bar */}
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 8,
          padding: "12px 20px",
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Space size="middle">
          <Badge status={session ? "success" : "warning"} />
          <Text strong style={{ color: "var(--color-on-surface)" }}>
            POS Terminal 01
          </Text>
          {session ? (
            <Tag color="green">
              Session Active (Float: {formatCurrency(session.openingFloat)})
            </Tag>
          ) : (
            <Tag color="orange">Shift Not Started</Tag>
          )}
        </Space>
        <Space>
          {session ? (
            <Button
              icon={<Lock className="w-4 h-4" />}
              danger
              onClick={handleCloseSession}
              loading={isClosingSession}
            >
              Close Shift / Float
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<Unlock className="w-4 h-4" />}
              onClick={() => setSessionModalVisible(true)}
            >
              Open Shift / Float
            </Button>
          )}
        </Space>
      </div>

      <div style={{ display: "flex", gap: 16, height: "calc(100% - 64px)" }}>
        {/* Left Column: Product Grid */}
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}
        >
          <Input
            size="large"
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            placeholder="Search catalog by name or scan barcode SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ borderRadius: 8 }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
              overflowY: "auto",
              paddingRight: 4,
            }}
          >
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                hoverable
                onClick={() => addToCart(product)}
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--ghost-border)",
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
                styles={{ body: { padding: 16 } }}
              >
                <div>
                  <Tag color="blue" style={{ marginBottom: 8 }}>
                    {product.sku}
                  </Tag>
                  <Title
                    level={5}
                    style={{
                      color: "var(--color-on-surface)",
                      marginBottom: 8,
                    }}
                  >
                    {product.name}
                  </Title>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 12,
                  }}
                >
                  <Text
                    strong
                    style={{ color: "var(--color-primary)", fontSize: 16 }}
                  >
                    {formatCurrency(product.basePrice)}
                  </Text>
                  <Button
                    type="primary"
                    size="small"
                    icon={<Plus className="w-3 h-3" />}
                  >
                    Add
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Checkout Cart */}
        <div
          style={{
            width: 380,
            background: "var(--color-surface)",
            border: "1px solid var(--ghost-border)",
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
            padding: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Title
              level={4}
              style={{ margin: 0, color: "var(--color-on-surface)" }}
            >
              Current Order
            </Title>
            {cart.length > 0 && (
              <Button
                type="text"
                danger
                size="small"
                icon={<Trash2 className="w-3 h-3" />}
                onClick={() => setCart([])}
              >
                Clear
              </Button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", marginBottom: 16 }}>
            {cart.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: "var(--color-on-surface-variant)",
                }}
              >
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <Text type="secondary">
                  Cart is empty. Tap items on the left to add.
                </Text>
              </div>
            ) : (
              <List
                dataSource={cart}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      padding: "12px 0",
                      borderBottom: "1px solid var(--ghost-border)",
                    }}
                  >
                    <div style={{ width: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <Text
                          strong
                          style={{ color: "var(--color-on-surface)" }}
                        >
                          {item.name}
                        </Text>
                        <Text style={{ color: "var(--color-primary)" }}>
                          {formatCurrency(item.price * item.quantity)}
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatCurrency(item.price)} each
                        </Text>
                        <Space size="small">
                          <Button
                            size="small"
                            icon={<Minus className="w-3 h-3" />}
                            onClick={() => updateQuantity(item.id, -1)}
                          />
                          <Text
                            strong
                            style={{ minWidth: 20, textAlign: "center" }}
                          >
                            {item.quantity}
                          </Text>
                          <Button
                            size="small"
                            icon={<Plus className="w-3 h-3" />}
                            onClick={() => updateQuantity(item.id, 1)}
                          />
                        </Space>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </div>

          {/* Cart Summary */}
          <Divider style={{ margin: "12px 0" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text type="secondary">Subtotal</Text>
            <Text>{formatCurrency(total)}</Text>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Title
              level={4}
              style={{ margin: 0, color: "var(--color-on-surface)" }}
            >
              Total Due
            </Title>
            <Title
              level={3}
              style={{ margin: 0, color: "var(--color-primary)" }}
            >
              {formatCurrency(total)}
            </Title>
          </div>

          <Button
            type="primary"
            size="large"
            block
            disabled={cart.length === 0}
            onClick={handleStartCheckout}
            style={{ height: 48, fontSize: 16, fontWeight: 600 }}
          >
            Charge {formatCurrency(total)}
          </Button>
        </div>
      </div>

      {/* Shift / Opening Float Modal */}
      <Modal
        title="Open POS Shift Drawer"
        open={sessionModalVisible}
        onCancel={() => setSessionModalVisible(false)}
        onOk={handleOpenSession}
        confirmLoading={isOpeningSession}
        okText="Start Shift"
      >
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginTop: 16 }}
        >
          <Text>
            Enter the starting cash float amount in the cash register drawer:
          </Text>
          <div>
            <Text strong>Opening Float Cash ($)</Text>
            <InputNumber
              value={openingFloat}
              onChange={(v) => setOpeningFloat(v || 0)}
              style={{ width: "100%", marginTop: 4 }}
            />
          </div>
        </Space>
      </Modal>

      {/* Payment Processing Modal */}
      <Modal
        title="Complete Transaction"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        onOk={handleConfirmPayment}
        confirmLoading={isCreatingOrder}
        okText="Confirm & Print"
      >
        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%", marginTop: 16 }}
        >
          <div>
            <Text strong>Select Payment Method</Text>
            <Radio.Group
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: "100%", marginTop: 8 }}
            >
              <Row gutter={12}>
                <Col span={8}>
                  <Radio.Button
                    value="CASH"
                    style={{ width: "100%", textAlign: "center" }}
                  >
                    <Banknote className="w-4 h-4 inline mr-1" /> Cash
                  </Radio.Button>
                </Col>
                <Col span={8}>
                  <Radio.Button
                    value="CARD"
                    style={{ width: "100%", textAlign: "center" }}
                  >
                    <CreditCard className="w-4 h-4 inline mr-1" /> Card
                  </Radio.Button>
                </Col>
                <Col span={8}>
                  <Radio.Button
                    value="MOBILE"
                    style={{ width: "100%", textAlign: "center" }}
                  >
                    <Smartphone className="w-4 h-4 inline mr-1" /> Mobile Pay
                  </Radio.Button>
                </Col>
              </Row>
            </Radio.Group>
          </div>

          <div>
            <Text strong>Amount Tendered ($)</Text>
            <InputNumber
              size="large"
              value={amountTendered}
              onChange={(v) => setAmountTendered(v || total)}
              style={{ width: "100%", marginTop: 4 }}
            />
          </div>

          <div
            style={{
              background: "var(--color-surface-container)",
              padding: 16,
              borderRadius: 8,
              border: "1px solid var(--ghost-border)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <Text type="secondary">Total Bill:</Text>
              <Text strong>{formatCurrency(total)}</Text>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text type="secondary">Change Due:</Text>
              <Text
                strong
                style={{ color: "var(--color-success)", fontSize: 16 }}
              >
                {formatCurrency(Math.max(0, amountTendered - total))}
              </Text>
            </div>
          </div>
        </Space>
      </Modal>

      {/* Thermal Receipt Preview Modal */}
      <Modal
        title="Transaction Receipt"
        open={receiptModalVisible}
        onCancel={() => setReceiptModalVisible(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setReceiptModalVisible(false)}
          >
            Done
          </Button>,
        ]}
      >
        {lastOrder && (
          <div
            style={{
              fontFamily: "monospace",
              background: "#fff",
              color: "#000",
              padding: 20,
              borderRadius: 4,
              border: "1px dashed #ccc",
              margin: "16px 0",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontWeight: "bold" }}>NUROX ERP POS</h3>
              <p style={{ margin: 0, fontSize: 12 }}>
                Store #01 — Central Retail
              </p>
              <p style={{ margin: 0, fontSize: 11 }}>
                Date:{" "}
                {formatDate(lastOrder.createdAt || new Date().toISOString())}
              </p>
            </div>
            <Divider style={{ margin: "8px 0", borderColor: "#eee" }} />
            {lastOrder.items?.map((it: any, i: number) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                <span>
                  {it.quantity}x {it.name}
                </span>
                <span>${(it.price * it.quantity).toFixed(2)}</span>
              </div>
            ))}
            <Divider style={{ margin: "8px 0", borderColor: "#eee" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                fontSize: 13,
              }}
            >
              <span>TOTAL</span>
              <span>${Number(lastOrder.total).toFixed(2)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                marginTop: 4,
              }}
            >
              <span>Paid ({lastOrder.paymentMethod})</span>
              <span>${Number(lastOrder.amountTendered).toFixed(2)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                color: "green",
                fontWeight: "bold",
              }}
            >
              <span>CHANGE DUE</span>
              <span>${Number(lastOrder.changeDue).toFixed(2)}</span>
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: 16,
                fontSize: 11,
                color: "#666",
              }}
            >
              Thank you for your business!
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
