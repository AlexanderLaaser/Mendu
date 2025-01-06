"use client";

import React from "react";

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  className = "",
}) => (
  <div className={`card-body text-left rounded-lg ${className}`}>
    {children}
  </div>
);

export default DashboardCard;
