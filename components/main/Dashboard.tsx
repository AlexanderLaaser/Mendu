import React from "react";

export default function Dashboard() {
  const branchenInteressenTags = ["Tag 1", "Tag 2", "Tag 3"];
  const berufsfeldTags = ["Tag 1", "Tag 2", "Tag 3"];
  const unternehmenTags = ["Tag 1", "Tag 2", "Tag 3"];

  return (
    <div className="flex justify-center pr-8 pl-8 3xl:pr-0 3xl:pl-0 flex-1">
      <div className="flex w-full flex-col max-w-3xl flex-1">
        {/* Erste Komponente */}
        <div className="card bg-base-300 rounded-box grid place-items-center h-96 p-6">
          <div className="flex flex-col w-full h-full">
            {/* Bild Platzhalter */}
            <div className="flex items-center mb-4">
              <div className="w-24 h-24 bg-gray-400 rounded-full flex-shrink-0 flex justify-center items-center">
                Bild
              </div>
              <div className="ml-4">
                <p className="text-xl font-semibold">Vorname</p>
                <p className="text-xl font-semibold">Nachname</p>
              </div>
            </div>

            {/* Bearbeiten Button */}
            <div className="text-right w-full">
              <button className="text-sm underline">bearbeiten</button>
            </div>

            {/* Tags Section */}
            <div className="mt-4">
              <p className="font-medium">Brancheninteressen</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {branchenInteressenTags.map((tag, index) => (
                  <span key={index} className="badge badge-outline">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <p className="font-medium">Berufsfeld</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {berufsfeldTags.map((tag, index) => (
                  <span key={index} className="badge badge-outline">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <p className="font-medium">Unternehmen</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {unternehmenTags.map((tag, index) => (
                  <span key={index} className="badge badge-outline">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Zweite Komponente */}
        <div className="divider"></div>
        <div className="card bg-base-300 rounded-box grid h-64 place-items-center mb-6">
          content
        </div>
      </div>
    </div>
  );
}
