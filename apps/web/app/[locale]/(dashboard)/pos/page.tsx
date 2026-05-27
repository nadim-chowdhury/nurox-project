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
} from "antd";
import { Search, ShoppingCart, CreditCard, Banknote, User } from "lucide-react";

const { Title, Text } = Typography;

const mockProducts = [
  {
    id: "1",
    name: "Premium Office Chair",
    price: 299.99,
    stock: 15,
    barcode: "8901234567",
  },
  {
    id: "2",
    name: "MacBook Pro M3",
    price: 1999.0,
    stock: 5,
    barcode: "8901234568",
  },
  {
    id: "3",
    name: "Logitech MX Master 3",
    price: 99.0,
    stock: 45,
    barcode: "8901234569",
  },
  {
    id: "4",
    name: "Standing Desk",
    price: 499.0,
    stock: 8,
    barcode: "8901234570",
  },
];

export default function PosTerminalPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const addToCart = (product: any) => {
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
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    alert(`Order of $${total.toFixed(2)} completed! Inventory deducted.`);
    setCart([]);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-4">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col gap-4">
        <Input
          size="large"
          prefix={<Search className="w-5 h-5 text-gray-400" />}
          placeholder="Search by name or scan barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-4">
          {mockProducts
            .filter(
              (p) =>
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.barcode.includes(search),
            )
            .map((product) => (
              <Card
                key={product.id}
                hoverable
                className="text-center h-full flex flex-col justify-between"
                onClick={() => addToCart(product)}
              >
                <Title level={5} className="mt-2 line-clamp-2">
                  {product.name}
                </Title>
                <Text className="text-xl font-bold text-primary">
                  ${product.price.toFixed(2)}
                </Text>
                <div className="mt-2 text-xs text-gray-500">
                  Stock: {product.stock}
                </div>
              </Card>
            ))}
        </div>
      </div>

      {/* Cart Panel */}
      <Card className="w-full md:w-96 flex flex-col h-full body-no-padding">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold text-lg">Current Order</span>
          </div>
          <Button icon={<User className="w-4 h-4" />}>Add Customer</Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              Cart is empty
            </div>
          ) : (
            <List
              dataSource={cart}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      key="minus"
                      size="small"
                      onClick={() => {
                        if (item.quantity === 1)
                          setCart(cart.filter((c) => c.id !== item.id));
                        else
                          setCart(
                            cart.map((c) =>
                              c.id === item.id
                                ? { ...c, quantity: c.quantity - 1 }
                                : c,
                            ),
                          );
                      }}
                    >
                      -
                    </Button>,
                    <Button
                      key="plus"
                      size="small"
                      onClick={() => addToCart(item)}
                    >
                      +
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={item.name}
                    description={`$${item.price.toFixed(2)} x ${item.quantity}`}
                  />
                  <div className="font-bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <Row justify="space-between" className="mb-2">
            <Text type="secondary">Subtotal</Text>
            <Text>${total.toFixed(2)}</Text>
          </Row>
          <Row justify="space-between" className="mb-4">
            <Text type="secondary">Tax (10%)</Text>
            <Text>${(total * 0.1).toFixed(2)}</Text>
          </Row>
          <Row justify="space-between" className="mb-4">
            <Title level={3}>Total</Title>
            <Title level={3} type="success">
              ${(total * 1.1).toFixed(2)}
            </Title>
          </Row>

          <div className="grid grid-cols-2 gap-2">
            <Button
              size="large"
              icon={<Banknote className="w-4 h-4" />}
              onClick={handleCheckout}
            >
              Cash
            </Button>
            <Button
              size="large"
              icon={<CreditCard className="w-4 h-4" />}
              type="primary"
              onClick={handleCheckout}
            >
              Card
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
