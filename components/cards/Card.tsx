import React from "react";

type CardProps = {
  title: string;
  content: string;
  buttonText: string;
  onButtonClick: () => void;
};

export default function Card({ title, content, buttonText }: CardProps) {
  return (
    <div className="card bg-primary text-white w-96">
      <div className="card-body text-left bg-base-100 rounded-lg">
        <h2 className="card-title">{title}</h2>
        <p>{content}</p>
      </div>
    </div>
  );
}
