import Sermons from "@/components/sections/Sermons";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";
import Navbar from "@/components/layout/Navbar";

export default function SermonsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      {/* Page Header */}
      <div className="bg-gray-900 text-white pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="container mx-auto px-4 text-center">
            <div className="mb-6 flex justify-center">
              <BackToHome />
            </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sermon Library</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Browse our collection of life-changing messages. Watch, listen, or read sermon notes.
          </p>
        </div>
      </div>

      {/* Main Sermons List (Reusing our powerful component) */}
      <Sermons />

      <Footer />
    </div>
  );
}