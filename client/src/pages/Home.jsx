import AiTools from "../components/AiTools";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import Plan from "../components/Plan";
import Testimonial from "../components/Testimonial";
import ErrorBoundary from "../components/ErrorBoundary";

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <AiTools />
      <Testimonial />
      <ErrorBoundary>
        <Plan />
      </ErrorBoundary>
      <Footer />
    </>
  );
};

export default Home;
