import React from "react";

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  className = "",
}) => (
  <div className={`card w-full relative ${className}`}>
    <div className="card-body bg-white text-left rounded-lg p-6">
      {children}
    </div>
  </div>
);

export default DashboardCard;
