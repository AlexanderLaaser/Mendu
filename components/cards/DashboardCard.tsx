import React from "react";

interface AuthCardProps {
  children: React.ReactNode;
}

const DashboardCard: React.FC<AuthCardProps> = ({ children }) => (
  <div className="card w-96 w-full mb-6 relative">
    <div className="card-body bg-base-100 text-left bg-blue-50 rounded-lg ">
      {children}
    </div>
  </div>
);

export default DashboardCard;
