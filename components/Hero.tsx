"use client";

import React from "react";
import Button from "./Button";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter(); // Initialize the router

  const handleSignUpAsApplicantButtonClick = () => {
    router.push("/registerApplicant"); // Navigate to the /register page
  };

  const handleSignUpAsInsiderButtonClick = () => {
    router.push("/registerInsider"); // Navigate to the /register page
  };

  return (
    <div className="flex-1">
      <div
        className="hero min-h-screen"
        style={{
          backgroundImage:
            "url(https://img.freepik.com/free-photo/close-up-young-colleagues-having-meeting_23-2149060226.jpg?t=st=1730647151~exp=1730650751~hmac=606876e66b24de6e192c8d735d0cf8dbe2296806c2e903ea1ce57ec2e375a569&w=1380)",
        }}
      >
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content text-neutral-content text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="mb-10 text-7xl font-bold">Mendu</h1>
            <p className="mb-10 text-2xl font-semibold">
              Wo Jobsuchende auf Unternehmensinsider treffen. Erhalte direkten
              Zugang, wertvolle Einblicke und fachkundige Ratschläge von denen,
              die bereits dort sind, wo du hinmöchtest. Hebe deine Jobsuche mit
              ConnectPro auf das nächste Level.
            </p>
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
              <Button
                variant="primary"
                onClick={handleSignUpAsApplicantButtonClick}
              >
                Registrieren als <strong>Suchender</strong>
              </Button>
              <Button
                variant="primary"
                onClick={handleSignUpAsInsiderButtonClick}
              >
                Registrieren als <strong>Mitarbeiter</strong>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
