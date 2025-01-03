import React from "react";

type HeroCardProps = {
  title: string;
  content: string;
};

export default function HeroCard({ title, content }: HeroCardProps) {
  return (
    <div className="card text-primary w-96 w-full">
      <div className="card-body bg-base-100 text-left bg-base-100 rounded-lg">
        <h2 className="card-title">{title}</h2>
        <div className="text-black">
          <p>{content}</p>
        </div>
      </div>
    </div>
  );
}
