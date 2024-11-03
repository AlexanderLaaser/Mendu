import React from "react";

export default function Hero() {
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
          <div className="max-w-3xl">
            <h1 className="mb-10 text-7xl font-bold">Recommend</h1>
            <p className="mb-10 text-2xl font-semibold">
              Where job seekers meet company insiders. Unlock direct
              connections, real insights, and expert guidance from those already
              where you want to be. Elevate your job search with ConnectPro
            </p>
            <button className="btn btn-primary">Sign Up</button>
          </div>
        </div>
      </div>
    </div>
  );
}
