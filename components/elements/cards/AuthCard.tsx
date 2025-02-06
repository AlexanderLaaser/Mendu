import React from "react";

interface AuthCardProps {
  title: string;
  children: React.ReactNode;
}

const AuthCard: React.FC<AuthCardProps> = ({ title, children }) => (
  <div className="flex justify-center ">
    <div className="card w-96 bg-base-100 mt-20 mb-20 ">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        {children}
      </div>
    </div>
  </div>
);

export default AuthCard;
