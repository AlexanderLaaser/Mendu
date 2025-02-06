import React from "react";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import DashboardCard from "@/components/elements/cards/DashboardCard";

interface MatchStatusProps {
  searchImmediately: boolean;
}

const MatchStatus: React.FC<MatchStatusProps> = ({ searchImmediately }) => {
  return searchImmediately ? (
    <DashboardCard className="mt-4 p-4 bg-green-100">
      <div className="flex items-center gap-2 text-green-600 ">
        <FaSpinner className="animate-spin text-green-500 " />
        <p className="font-semibold text-sm ">
          Suche ist aktiv - Wir suchen nach deinem Match!
        </p>
      </div>
    </DashboardCard>
  ) : (
    <DashboardCard className="mt-4 p-4 bg-red-100">
      <div className="flex items-center gap-2 text-red-600">
        <FaExclamationTriangle className="text-red-500" />
        <p className="font-semibold text-sm">Die Suche wurde ausgesetzt.</p>
      </div>
    </DashboardCard>
  );
};

export default MatchStatus;
