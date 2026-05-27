"use client";

import React, { useState } from "react";
import { Card, Button, Typography, Row, Col, Badge, Layout } from "antd";
import { ShoppingCart } from "lucide-react";

const { Title, Text } = Typography;
const { Header, Content } = Layout;

const mockCatalog = [
  {
    id: "1",
    name: "Nurox CRM License (Monthly)",
    price: 49.0,
    desc: "Add CRM capabilities to your tenant.",
  },
  {
    id: "2",
    name: "Premium Office Chair",
    price: 299.99,
    desc: "Ergonomic seating for long hours.",
  },
  {
    id: "3",
    name: "Standing Desk",
    price: 499.0,
    desc: "Motorized standing desk.",
  },
];

export default function ShopPage() {
  const [cartCount, setCartCount] = useState(0);

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  const handleCheckout = () => {
    if (cartCount === 0) return;
    alert("Checkout initiated! Creating Sales Order in ERP backend...");
    setCartCount(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 -m-6 p-6">
      <Header className="bg-white dark:bg-gray-800 px-6 flex justify-between items-center shadow-sm rounded-lg mb-6">
        <Title level={4} className="!mb-0">
          Nurox B2B Storefront
        </Title>
        <Badge count={cartCount} showZero>
          <Button
            type="primary"
            icon={<ShoppingCart className="w-4 h-4" />}
            onClick={handleCheckout}
          >
            Checkout
          </Button>
        </Badge>
      </Header>

      <Row gutter={[24, 24]}>
        {mockCatalog.map((product) => (
          <Col xs={24} sm={12} md={8} key={product.id}>
            <Card hoverable className="h-full flex flex-col">
              <div className="flex-1">
                <Title level={5}>{product.name}</Title>
                <Text type="secondary">{product.desc}</Text>
                <div className="mt-4 mb-4">
                  <Text className="text-2xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </Text>
                </div>
              </div>
              <Button type="default" block onClick={handleAddToCart}>
                Add to Cart
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
