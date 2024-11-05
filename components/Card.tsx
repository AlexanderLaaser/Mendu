import React from "react";

type CardProps = {
  title: string;
  content: string;
  buttonText: string;
  onButtonClick: () => void;
};

export default function Card({
  title,
  content,
  buttonText,
  onButtonClick,
}: CardProps) {
  return (
    <div className="card bg-primary text-primary-content w-96">
      <div className="card-body text-left">
        <h2 className="card-title">{title}</h2>
        <p>{content}</p>
        <div className="card-actions justify-center mt-5">
          <button className="btn" onClick={onButtonClick}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
