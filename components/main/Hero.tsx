"use client";

import React from "react";
import {
  UserPlus,
  Building,
  Users,
  CheckIcon,
  ArrowRight,
  FileUser,
  CirclePlus,
} from "lucide-react";

import { Card, CardContent } from "../ui/card";
import Login from "./Login";
import profilePic from "../../public/menduicon.png";
import Image from "next/image";
import Register from "./Register";
import { Separator } from "../ui/separator";
import Background from "../../public/background.jpeg";

export default function Hero() {
  return (
    <div className="min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full md:py-24 lg:py-32 xl:py-20 sm:py-20 py-20">
          {/* Änderung: Überschrift zentriert */}
          <div className="flex items-center justify-center">
            <Image
              src={profilePic}
              alt="Company Logo"
              width={100}
              height={100}
              className="rounded-full mr-2"
            />
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl xl:text-6xl">
              Mendu
            </h1>
          </div>

          <div
            className="flex flex-col md:flex-row justify-center items-center md:items-stretch mx-auto pt-10 w-full"
            style={{ maxWidth: "1200px" }}
          >
            {/* Linke Spalte: Text rechtsbündig */}
            <div className="flex md:w-[400px] md:text-right sm:text-center items-center justify-center sm:p-6">
              <div className="space-y-2 md:pb-4 md:pt-4 p-4">
                <p className="md:max-w-[800px] sm:max-w-[1200px] text-muted-foreground md:text-lg text-center">
                  <p className="font-bold text-center">
                    Talents treffen Insider.
                  </p>{" "}
                  Insider geben persönliche Einblicke, Talents finden
                  Arbeitgeber die tatsächlich zu ihnen passen.{" "}
                  <p className="font-bold pt-6">
                    Mendu - Die Bewerbung, ohne Bewerbung.
                  </p>
                </p>
              </div>
            </div>
            <Separator
              orientation="vertical"
              className="mx-4 h-auto bg-gray-300"
            />

            {/* Rechte Spalte (Login) */}
            <div className="w-[400px] flex flex-col space-y-4 text-center">
              <div className="w-full max-w-sm space-y-2 mx-auto">
                <Login />
              </div>
            </div>
          </div>
        </section>
        {/* Features Section */}
        <section
          id="features"
          /* Änderung: Setze das Bild als Hintergrundbild für die gesamte Section */
          style={{
            backgroundImage: `url(${Background.src})`, // <-- Hintergrundbild
            backgroundSize: "cover", // Bild füllt die Fläche komplett aus
            backgroundPosition: "center", // Bild ist mittig ausgerichtet
            backgroundRepeat: "no-repeat", // Bild wird nicht gekachelt
          }}
          className="w-full py-12 md:py-24 lg:py-24 justify-center relative"
        >
          <div className="relative px-4 md:px-6 max-w-[1000px] mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
              Deine Vorteile
            </h2>
            <div className="grid gap-6 lg:grid-cols-2 justify-items-center">
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <UserPlus className="h-12 w-12 text-primary" />
                  <h3 className="text-2xl font-bold text-center">
                    Für Talents
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Du möchtest vor deiner Bewerbung mit einem Insider sprechen
                    und von einer persönlichen Empfehlung profitieren?
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <Building className="h-12 w-12 text-primary" />
                  <h3 className="text-2xl font-bold text-center">
                    Für Insider
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Du willst mit spannenden neuen Kollegen sprechen und dabei
                    vom attraktiven Empfehlungsbonus profitieren?
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works Section als responsives Prozessdiagramm */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-24">
          <div className="container px-4 md:px-6 max-w-[1200px] mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
              Wie funktioniert Mendu?
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Linke Gruppe: Für Talente und Insider in einem Stack */}
              <div className="flex flex-col gap-6">
                {/* Box: Für Talente */}
                <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
                  <h3 className="text-2xl font-bold text-center mb-2">
                    Talente
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <FileUser className="h-6 w-6 text-primary" />
                      <span className="ml-2">
                        Erstelle ein Profil und gib deine Zielunternehmen an.
                      </span>
                    </li>
                    <li className="flex items-center">
                      <Users className="h-6 w-6 text-primary" />
                      <span className="ml-2">
                        Automatische Suche nach Insidern, ohne zeitintensive
                        Suche.
                      </span>
                    </li>
                    <li className="flex items-center">
                      <CirclePlus className="h-6 w-6 text-primary" />
                      <span className="ml-2">
                        Erhalte Insights und profitiere von persönlichen
                        Empfehlungen.
                      </span>
                    </li>
                  </ul>
                </div>
                {/* Box: Für Insider */}
                <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
                  <h3 className="text-2xl font-bold text-center mb-2">
                    Für Insider
                  </h3>
                  <ul className="space-y-5">
                    <li className="flex items-center">
                      <FileUser className="h-6 w-6 text-primary" />
                      <span className="ml-2">
                        Erstelle ein Profil und teile uns deinen aktuellen
                        Arbeitgeber mit.
                      </span>
                    </li>
                    <li className="flex items-center">
                      <Users className="h-6 w-6 text-primary" />
                      <span className="ml-2">
                        Automatische Suche nach Talenten, ohne zeitintensive
                        Suche.
                      </span>
                    </li>
                    <li className="flex items-center">
                      <CirclePlus className="h-6 w-6 text-primary" />
                      <span className="ml-2">
                        Bestimme deine Kollegen selbst und profitiere vom
                        Referral-Bonus.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Pfeil von links nach Mitte */}
              <div className="hidden md:flex items-center">
                <ArrowRight className="h-8 w-8 text-primary" />
              </div>

              {/* Zentrale Komponente: KI-basierter Match-Algorithmus */}
              <div className="flex flex-col items-center">
                <div className="p-6 bg-gray-100 rounded-full shadow-lg flex items-center justify-center w-48 h-48">
                  <span className="text-xl font-bold text-center">
                    KI-basierter Match-Algorithmus
                  </span>
                </div>
              </div>

              {/* Pfeil von Mitte nach rechts */}
              <div className="hidden md:flex items-center">
                <ArrowRight className="h-8 w-8 text-primary" />
              </div>

              {/* Rechte Box: Match Vorteile */}
              <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
                <h3 className="text-2xl font-bold text-center mb-4">
                  Match Vorteile
                </h3>
                <ul className="space-y-6">
                  <li className="flex items-center">
                    <CheckIcon className="h-6 w-6 text-green-500" />
                    <span className="ml-2">
                      Passgenaues Match zwischen Talenten und Unternehmen
                    </span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-6 w-6 text-green-500" />
                    <span className="ml-2">
                      Win-Win Situation für beide Seiten, ohne auch nur 5
                      Minuten für die Suche zu investieren.
                    </span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-6 w-6 text-green-500" />
                    <span className="ml-2">
                      Hohe Erfolgsquote durch datenbasierte Entscheidungen
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Join Section */}
        <section id="join" className="w-full py-12 md:py-24 lg:py-24 bg-muted">
          <div className="container px-4 md:px-6 max-w-[1000px] mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Werde Teil des Mendu-Netzwerks
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl lg:text-base xl:text-xl">
                  Ob du auf der Suche nach deiner nächsten Karrierechance bist
                  oder als Insider großartige Kandidaten empfehlen möchtest -
                  starte jetzt!
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2 pt-6">
                <Register />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t justify-center">
        <p className="text-xs text-muted-foreground">
          © 2025 Mendu. Alle Rechte vorbehalten.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6"></nav>
      </footer>
    </div>
  );
}
