// components/Formular.tsx
"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "@/firebase"; // Firebase configuration file

// Define types for each piece of state
interface FormularProps {}

type BrancheOption =
  | "Automobil"
  | "Technologie"
  | "Finanzen"
  | "Gesundheitswesen";

export default function Formular({}: FormularProps) {
  // Define state with types
  const [image, setImage] = useState<File | null>(null);
  const [cv, setCv] = useState<File | null>(null);
  const [branche, setBranche] = useState<BrancheOption | "">("");
  const [berufsfeld, setBerufsfeld] = useState<string>("");
  const [background, setBackground] = useState<string>("");
  const [backgroundError, setBackgroundError] = useState<string>("");

  // Define type for file change event
  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = e.target.files ? e.target.files[0] : null;
    setter(file);
  };

  // Firebase upload handler with file and path validation
  const handleUpload = async (file: File | null, path: string) => {
    if (!file) return;
    const fileRef = ref(storage, `${path}/${file.name}`);
    await uploadBytes(fileRef, file);
    alert(`${file.name} hochgeladen!`);
  };

  // Form submission handler with type safety
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (background.length > 250) {
      setBackgroundError("Maximal 250 Zeichen erlaubt.");
      return;
    }
    await handleUpload(cv, "CVs");
    await handleUpload(image, "Images");
    alert("Formular abgesendet!");
  };

  return (
    <form className="space-y-4 max-w-md mx-auto p-4" onSubmit={handleSubmit}>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Bild hochladen</span>
        </label>
        <input
          type="file"
          className="file-input file-input-bordered w-full"
          accept="image/*"
          onChange={(e) => handleFileChange(e, setImage)}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Branche</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={branche}
          onChange={(e) => setBranche(e.target.value as BrancheOption)}
        >
          <option disabled value="">
            Wähle eine Branche
          </option>
          <option value="Automobil">Automobilbranche</option>
          <option value="Technologie">Technologie</option>
          <option value="Finanzen">Finanzen</option>
          <option value="Gesundheitswesen">Gesundheitswesen</option>
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Berufsfeld</span>
        </label>
        <input
          type="text"
          placeholder="Beispiel: IT"
          className="input input-bordered w-full"
          value={berufsfeld}
          onChange={(e) => setBerufsfeld(e.target.value)}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Beruflicher Background</span>
          <span className="label-text-alt">
            {background.length}/250 Zeichen
          </span>
        </label>
        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Kurzbeschreibung"
          maxLength={250}
          value={background}
          onChange={(e) => {
            setBackground(e.target.value);
            if (e.target.value.length <= 250) {
              setBackgroundError("");
            }
          }}
        />
        {backgroundError && (
          <p className="text-red-500 text-sm">{backgroundError}</p>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">CV hochladen (optional)</span>
        </label>
        <input
          type="file"
          className="file-input file-input-bordered w-full"
          accept=".pdf,.doc,.docx"
          onChange={(e) => handleFileChange(e, setCv)}
        />
      </div>

      <div className="form-control mt-4">
        <button type="submit" className="btn btn-primary w-full">
          Registrieren
        </button>
      </div>
    </form>
  );
}
