import Navbar from "../../components/Navbar.jsx";
import Hero from "../../components/Hero.jsx";
import About from "../../components/About.jsx";
import Features from "../../components/Features.jsx";
import Workflow from "../../components/Workflow.jsx";
import WhyChoose from "../../components/WhyChoose.jsx";
import Contact from "../../components/Contact.jsx";
import Footer from "../../components/Footer.jsx";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Features />
        <Workflow />
        <WhyChoose />
        <Contact />
      </main>
      <Footer />
    </>
  );
}