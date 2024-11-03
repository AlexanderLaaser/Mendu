import Dashboard from "@/components/Dashboard";
import Hero from "@/components/Hero";
import Main from "@/components/Main";

export default function HomePage() {
  const currentUser = "";

  if (currentUser) {
    return (
      <Main>
        <Dashboard></Dashboard>
      </Main>
    );
  }

  return (
    <Main>
      <Hero></Hero>
    </Main>
  );
}
