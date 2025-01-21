import React from "react";
import OfferCreation from "./OfferCreation";
import MarketplaceSearch from "./MarketplaceSearch";
import MarketplaceFilter from "./MarketplaceFilter";

export default function Marketplace() {
  return (
    <div className="flex flex-1 text-sm p-4">
      <div className="flex flex-col w-full gap-4">
        <OfferCreation />
        <MarketplaceSearch />
      </div>
    </div>
  );
}
