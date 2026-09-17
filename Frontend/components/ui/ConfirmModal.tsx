"use client";

import React, { ReactNode, useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import Icon from "./Icon";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  icon?: string;
}

const variantConfig = {
  danger: {
    btnVariant: "danger" as const,
    icon: "delete",
    iconClass: "text-rose-500",
    iconBg: "bg-rose-50 text-rose-600 border border-rose-100",
  },
  warning: {
    btnVariant: "primary" as const,
    icon: "warning",
    iconClass: "text-amber-500",
    iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
  },
  info: {
    btnVariant: "primary" as const,
    icon: "info",
    iconClass: "text-secondary",
    iconBg: "bg-secondary/10 text-secondary border border-secondary/20",
  },
  success: {
    btnVariant: "success" as const,
    icon: "check_circle",
    iconClass: "text-emerald-500",
    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  },
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  variant = "danger",
  icon,
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const config = variantConfig[variant];

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      size="sm"
      showCloseButton={!loading}
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={config.btnVariant}
            size="sm"
            onClick={handleConfirm}
            isLoading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center py-2">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${config.iconBg}`}>
          <Icon name={icon || config.icon} size="lg" filled />
        </div>
        <h4 className="text-base font-bold text-primary font-display mb-1.5">
          {title}
        </h4>
        <div className="text-xs text-on-surface-variant/70 leading-relaxed max-w-xs">
          {message}
        </div>
      </div>
    </Modal>
  );
}
