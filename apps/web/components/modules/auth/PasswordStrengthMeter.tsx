"use client";

import React from "react";
import { Progress, Typography } from "antd";

const { Text } = Typography;

interface PasswordStrengthMeterProps {
  password?: string;
}

export function PasswordStrengthMeter({ password = "" }: PasswordStrengthMeterProps) {
  const evaluateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 8) score += 1;
    if (pass.length > 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = evaluateStrength(password);
  
  const getLabel = (s: number) => {
    switch (s) {
      case 0: return "";
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong";
      case 5: return "Very Strong";
      default: return "";
    }
  };

  const getColor = (s: number) => {
    switch (s) {
      case 1: return "#ff4d4f";
      case 2: return "#faad14";
      case 3: return "#faad14";
      case 4: return "#52c41a";
      case 5: return "#52c41a";
      default: return "#d9d9d9";
    }
  };

  if (!password) return null;

  return (
    <div style={{ marginTop: -12, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>
          Password Strength:
        </Text>
        <Text style={{ fontSize: 12, fontWeight: 600, color: getColor(strength) }}>
          {getLabel(strength)}
        </Text>
      </div>
      <Progress 
        percent={strength * 20} 
        showInfo={false} 
        strokeColor={getColor(strength)} 
        size="small"
        style={{ margin: 0 }}
      />
    </div>
  );
}
