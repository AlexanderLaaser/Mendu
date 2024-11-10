"use client";

import React, { useState } from "react";
import AutocompleteTagInput from "../components/Inputs/AutoCompleteTagInput";

const Information: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  // Function to fetch company suggestions from OpenCorporates API
  const fetchCompanySuggestions = async (query: string): Promise<string[]> => {
    try {
      const response = await fetch(
        `https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(
          query
        )}&api_token=YOUR_API_TOKEN`
      );
      const data = await response.json();
      if (data.results.companies) {
        const companyNames = data.results.companies.map(
          (company: any) => company.company.name
        );
        return companyNames;
      }
      return [];
    } catch (error) {
      console.error("Error fetching company suggestions:", error);
      return [];
    }
  };

  const handleTagsChange = (tags: string[]) => {
    console.log("Selected companies:", tags);
    // You can store the selected companies in state or perform other actions
  };

  return (
    <div className="container mx-auto p-4 flex-1">
      <div className="modal modal-open">
        <div className="modal-box relative">
          {/* Close Button */}
          {/* <button
            className="btn btn-sm btn-circle absolute right-2 top-2"
            onClick={() => setIsModalOpen(false)}
          >
            ✕
          </button> */}
          <h3 className="text-lg font-bold mb-4">Select Companies</h3>
          {/* AutocompleteTagInput Component */}
          <AutocompleteTagInput
            fetchSuggestions={fetchCompanySuggestions}
            placeholder="Type a company name"
            onTagsChange={handleTagsChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Information;
