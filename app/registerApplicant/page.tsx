"use client";
import React, { useState } from "react";
import Main from "@/components/Main";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [branche, setBranche] = useState("");
  const [berufbeschreibung, setBerufbeschreibung] = useState("");

  return (
    <Main>
      <div className="flex justify-center">
        <div className="card w-96 bg-base-100 shadow-xl mt-20 mb-20">
          <div className="card-body">
            <h2 className="card-title">Register!</h2>
            <div className="items-center mt-2">
              {/* Name Input */}
              <label className="input input-bordered flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 opacity-70"
                >
                  <path d="M7.25 2A4.25 4.25 0 1 1 3 6.25c0 2.228 1.693 5.75 4.25 5.75S11.5 8.478 11.5 6.25A4.25 4.25 0 0 1 7.25 2ZM4.75 6.25a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z" />
                  <path d="M2.75 13.5c-.724 0-1.5.538-1.5 1.5h9c0-.962-.776-1.5-1.5-1.5h-6Z" />
                </svg>
                <input
                  type="text"
                  className="grow"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              {/* Profile Picture Upload */}
              <label className="flex flex-col gap-2 mb-2">
                <span className="font-medium">Upload Picture</span>
                <input type="file" className="file-input file-input-bordered" />
              </label>

              {/* Branche Input */}
              <label className="input input-bordered flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 opacity-70"
                >
                  <path d="M8 0a8 8 0 1 0 8 8A8 8 0 0 0 8 0ZM4.5 12.5l1.5-3.5H3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3l1.5-3.5h1l-1.5 3.5h3a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H7l-1.5 3.5Z" />
                </svg>
                <input
                  type="text"
                  className="grow"
                  placeholder="Branche"
                  value={branche}
                  onChange={(e) => setBranche(e.target.value)}
                />
              </label>

              {/* Berufbeschreibung Input */}
              <label className="flex flex-col gap-2 mb-2">
                <span className="font-medium">Berufbeschreibung</span>
                <textarea
                  className="textarea textarea-bordered"
                  placeholder="Describe your profession"
                  value={berufbeschreibung}
                  onChange={(e) => setBerufbeschreibung(e.target.value)}
                />
              </label>

              {/* Optional CV Upload */}
              <label className="flex flex-col gap-2 mb-2">
                <span className="font-medium">Upload CV (Optional)</span>
                <input type="file" className="file-input file-input-bordered" />
              </label>

              {/* Email Input */}
              <label className="input input-bordered flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 opacity-70"
                >
                  <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                  <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                </svg>
                <input
                  type="text"
                  className="grow"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              {/* Password Input */}
              <label className="input input-bordered flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 opacity-70"
                >
                  <path
                    fillRule="evenodd"
                    d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="password"
                  className="grow"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            </div>
            <div className="card-actions justify-end">
              <button className="btn btn-primary w-full">Register</button>
            </div>
          </div>
        </div>
      </div>
    </Main>
  );
}
