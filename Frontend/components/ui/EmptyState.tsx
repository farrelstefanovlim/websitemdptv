"use client";

import React, { ReactNode } from "react";
import Icon from "./Icon";
import Button from "./Button";

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: string;
  children?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon = "inbox",
  title,
  description,
  actionText,
  onAction,
  actionIcon,
  children,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`
        p-8 sm:p-12 rounded-3xl border border-dashed border-outline-variant/20
        bg-surface-container-low/30 text-center flex flex-col items-center justify-center
        ${className}
      `}
    >
      <div className="w-16 h-16 rounded-3xl bg-secondary/10 text-secondary flex items-center justify-center mb-4">
        <Icon name={icon} size="lg" />
      </div>

      <h4 className="text-base sm:text-lg font-bold text-primary font-display mb-1.5">
        {title}
      </h4>

      {description && (
        <p className="text-xs sm:text-sm text-on-surface-variant/60 max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {actionText && onAction && (
        <Button
          variant="primary"
          size="sm"
          onClick={onAction}
          startIcon={actionIcon ? <Icon name={actionIcon} size="sm" /> : undefined}
        >
          {actionText}
        </Button>
      )}

      {children}
    </div>
  );
}
