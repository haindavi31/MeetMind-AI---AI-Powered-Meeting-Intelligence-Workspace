import Navbar from "../../components/layout/Navbar";

import Hero from "../../components/landing/Hero";

import Features from "../../components/landing/Features";

import CTA from "../../components/landing/CTA";


function Landing() {

  return (

    <>

      <Navbar />

      <main>

        <Hero />

        <Features />

        <CTA />

      </main>

    </>

  );

}


export default Landing;