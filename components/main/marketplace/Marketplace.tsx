import React from "react";
import ReferralCreation from "./ReferralCreation";
import MarketplaceSearch from "./MarketplaceSearch";

export default function Marketplace() {
  return (
    <div className="flex flex-1 text-sm p-4">
      <div className="flex flex-col w-full gap-4">
        <ReferralCreation />
        <MarketplaceSearch />
      </div>
    </div>
  );
}
