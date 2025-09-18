import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import FeaturedGear from "@/components/FeaturedGear";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Categories />
        <FeaturedGear />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
