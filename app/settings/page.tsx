"use client";

import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
} from "react";
import { ref, uploadBytes } from "firebase/storage";
import { storage, auth, db, doc, setDoc, getDoc } from "@/firebase";
import { useRouter } from "next/navigation";
import TagInput from "../../components/TagInput";

interface FormularProps {}

export default function Formular({}: FormularProps) {
  const [image, setImage] = useState<File | null>(null);
  const [cv, setCv] = useState<File | null>(null);
  const [berufsfeld, setBerufsfeld] = useState<string>("");
  const [background, setBackground] = useState<string>("");
  const [backgroundError, setBackgroundError] = useState<string>("");
  const [themes, setThemes] = useState<string[]>([]);
  const [themeInput, setThemeInput] = useState<string>("");
  const [loading, setLoading] = useState(true); // Zustand für Ladeanzeige
  const router = useRouter();

  useEffect(() => {
    // Benutzer-ID abrufen und Daten aus Firestore laden
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setBerufsfeld(userData.berufsfeld || "");
          setBackground(userData.background || "");
          setThemes(userData.themes || []);
        }
      }
      setLoading(false); // Ladeanzeige beenden, wenn Daten geladen sind
    };

    loadUserData();
  }, []);

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = e.target.files ? e.target.files[0] : null;
    setter(file);
  };

  const handleUpload = async (file: File | null, path: string) => {
    if (!file) return;
    const fileRef = ref(storage, `${path}/${file.name}`);
    await uploadBytes(fileRef, file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (background.length > 250) {
      setBackgroundError("Maximal 250 Zeichen erlaubt.");
      return;
    }

    const user = auth.currentUser;
    if (user) {
      // Daten in Firestore ergänzen statt überschreiben
      await setDoc(
        doc(db, "users", user.uid),
        {
          berufsfeld,
          background,
          themes,
          settingsCompleted: true,
        },
        { merge: true } // Bestehende Felder beibehalten
      );

      await handleUpload(cv, "CVs");
      await handleUpload(image, "Images");

      // Weiterleitung zum Dashboard
      router.push("/dashboard");
    } else {
      alert("User is not authenticated.");
    }
  };

  const handleThemeInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && themeInput.trim()) {
      e.preventDefault();
      setThemes((prevThemes) => [...prevThemes, themeInput.trim()]);
      setThemeInput(""); // Eingabefeld leeren
    }
  };

  const handleRemoveTheme = (index: number) => {
    setThemes((prevThemes) => prevThemes.filter((_, i) => i !== index));
  };

  if (loading) return <p>Lädt...</p>;
  return (
    <form
      className=" flex-1 space-y-4 max-w-md mx-auto p-4"
      onSubmit={handleSubmit}
    >
      <div>
        <TagInput
          label="Branche/Berufsfeld"
          placeholderExamples={["IT", "Marketing", "Vertrieb"]}
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

      {/* Bild-Upload und CV-Upload */}
      {/* <div className="form-control">
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
          <span className="label-text">CV hochladen (optional)</span>
        </label>
        <input
          type="file"
          className="file-input file-input-bordered w-full"
          accept=".pdf,.doc,.docx"
          onChange={(e) => handleFileChange(e, setCv)}
        />
      </div> */}

      <div className="form-control mt-4">
        <button type="submit" className="btn btn-primary w-full px-5">
          Einstellung speichern
        </button>
      </div>
    </form>
  );
}
