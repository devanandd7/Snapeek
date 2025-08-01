import Navbar from "../components/Navbar";
import Image from "next/image";
import { motion } from "framer-motion";

const screenshots = [
  "/file.svg",
  "/window.svg",
  "/globe.svg",
  "/next.svg",
  "/vercel.svg",
];

const mockups = [
  { src: "/Screenshot (133).png", alt: "Image Upload Interface" },
  { src: "/Screenshot (132).png", alt: "AI-Generated Notes Display" },
  { src: "/Screenshot (135).png", alt: "AI Chat Functionality" },
  { src: "/Screenshot (137).png", alt: "Notes Editing/Management View" },
];

// Placeholder for handleDemoClick if not defined elsewhere
const handleDemoClick = () => {
  console.log("Demo button clicked!");
  const youtubeSection = document.getElementById("youtube-demo");
  if (youtubeSection) {
    youtubeSection.scrollIntoView({ behavior: "smooth" });
  }
};

export default function Home() {
  return (
    <>
      <Navbar />
      
      <div className="min-h-screen font-inter relative">
       
      
        <main className="relative z-10">
          {/* Hero Section - Designed to be full screen */}
          <section className="min-h-screen relative flex items-center justify-center overflow-hidden">
            <video
              autoPlay
              loop
              muted
              className="absolute top-0 left-0 w-full h-full object-cover z-0"
            >
              <source
                src="/AI_Manages_Files_Makes_Notes.mp4"
                type="video/mp4"
              />
            </video>
            <div className="relative z-10 w-full">
              {/* Text content */}
              <div className="text-center">
                <motion.h1
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-6xl md:text-8xl font-extrabold text-white drop-shadow-lg"
                >
                  Snapeek
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl md:text-2xl mt-4 mb-8 text-gray-200"
                >
                  Your Visual Knowledge, Instantly Organized.
                </motion.p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.a
                    href="/register"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-lg shadow-lg"
                  >
                    Create Account
                  </motion.a>
                  <motion.button
                    onClick={handleDemoClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 font-bold text-lg shadow-lg"
                  >
                    Watch Demo
                  </motion.button>
                </div>
              </div>
            </div>
          </section>

          {/* Online Website Section */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 body-font bg-blue-100 dark:bg-blue-900 shadow-lg py-16"
          >
            <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center"
              >
                <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900 dark:text-white">
                  Online website
                  <br className="hidden lg:inline-block" />
                  Any time / Any where
                </h1>
                <p className="mb-8 leading-relaxed text-gray-700 dark:text-gray-300">
                  User can upload any type of images (images, notes images,
                  movie screenshot, study screenshot etc.). AI categorizes
                  images, and if you want notes, it can also generate notes for
                  you. Try now!
                </p>
                <div className="flex justify-center">
                  <a
                    href="https://snapeek.vercel.app/upload"
                    className="px-10 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-lg shadow-lg transition-transform transform hover:scale-105"
                  >
                    Upload
                  </a>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6"
              >
                <div className="relative w-full h-64 md:h-80">
                  <Image
                    src="/Screenshot (137).png"
                    alt="Online Website Interface"
                    className="object-cover object-center rounded"
                    fill
                  />
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Offline Window EXE Section */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 body-font bg-blue-100 dark:bg-blue-900 shadow-lg py-16"
          >
            <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6 mb-10 md:mb-0"
              >
                <div className="relative w-full h-64 md:h-80">
                  <Image
                    src="/Screenshot (135).png"
                    alt="Offline Windows App"
                    className="object-cover object-center rounded"
                    fill
                  />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center"
              >
                <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900 dark:text-white">
                  Offline Windows .exe
                  <br className="hidden lg:inline-block" />
                  Access Locally, Without Internet
                </h1>
                <p className="mb-8 leading-relaxed text-gray-700 dark:text-gray-300">
                  After downloading Snapeek.exe, open and log in (Login/Signup
                  or downloading images and notes requires internet). Once all
                  data is downloaded, you can access it without internet at any
                  time.
                </p>
                <div className="flex justify-center">
                  <a
                    href="/Snapeek.zip"
                    download
                    onClick={() => {
                      alert(
                        'It will download zip file , unzip file the file you will see the ".exe" and "how to use" file. also read the "how to use file"!'
                      ); // Alert for download
                    }}
                    className="px-10 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-lg shadow-lg transition-transform transform hover:scale-105"
                  >
                    Download .exe
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* "About Snapeek" Section */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full bg-blue-100 dark:bg-blue-900 shadow-lg py-16"
          >
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold mb-6 text-yellow-600 text-center">
                What is Snapeek?
              </h2>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h3 className="font-bold text-xl mb-2 text-gray-700 dark:text-gray-200">
                    The Problem: Digital Clutter & Lost Insights
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    We all have overwhelming screenshot galleries and disorganized
                    notes. This "digital clutter" not only consumes storage but
                    also buries valuable information, making it nearly impossible
                    to find what you need when you need it.
                  </p>
                  <h3 className="font-bold text-xl mb-2 text-gray-700 dark:text-gray-200">
                    How Snapeek Solves It
                  </h3>
                  <ul className="list-disc pl-6 space-y-3 text-gray-600 dark:text-gray-300">
                    <li>
                      <strong>Smart Image Organization:</strong> Upload any
                      image—lecture slides, diagrams, receipts—and let our AI
                      intelligently categorize and understand its context.
                    </li>
                    <li>
                      <strong>AI-Powered Note Generation:</strong> Snapeek
                      automatically generates comprehensive, editable notes from
                      the content of your images.
                    </li>
                    <li>
                      <strong>Interactive AI Chat:</strong> Chat with our AI about
                      your uploaded images to clarify concepts, ask follow-up
                      questions, and deepen your understanding.
                    </li>
                    <li>
                      <strong>Flexible Note Management:</strong> Easily modify,
                      update, and download your generated notes as PDFs to fit
                      your workflow.
                    </li>
                  </ul>
                </motion.div>
                {/* Replaced Slider with a simple grid for mockups */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="grid grid-cols-2 gap-4"
                >
                  {mockups.map((mockup, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-100 dark:bg-gray-700 rounded-lg shadow p-4 flex flex-col items-center justify-center"
                    >
                      <img
                        src={mockup.src}
                        alt={mockup.alt}
                        className="object-contain w-full h-full mb-2"
                      />
                      <p className="text-sm text-center font-semibold">
                        {mockup.alt}
                      </p>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* YouTube Video Section */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            id="youtube-demo"
            className="w-full bg-blue-100 dark:bg-blue-900 shadow-lg py-16"
          >
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold mb-6 text-blue-600 text-center">
                See Snapeek in Action
              </h2>
              <div className="aspect-w-16 aspect-h-9 relative">
                <div
                  className="absolute inset-0 z-10 cursor-pointer"
                  onClick={(e) => e.preventDefault()}
                  onMouseDown={(e) => e.preventDefault()}
                ></div>
                <iframe
                  className="w-full h-full rounded-lg pointer-events-none"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </motion.section>

          {/* "The Snapeek Advantage" Section */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full bg-blue-600 text-white shadow-lg py-16"
          >
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold mb-6 text-center">
                The Snapeek Advantage: Web + Desktop Synergy
              </h2>
              <div className="grid md:grid-cols-2 gap-8 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-blue-700 p-6 rounded-lg"
                >
                  <h3 className="font-bold text-xl mb-2">Web Application</h3>
                  <p>
                    Conveniently upload images and get instant AI-powered notes
                    from anywhere with an internet connection. Perfect for quick
                    captures and on-the-go processing.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-blue-700 p-6 rounded-lg flex flex-col items-center"
                >
                  {/* Using one of the provided images for the desktop app visual */}
                  <img
                    src="/image.png"
                    alt="Snapeek Desktop App"
                    className="w-24 h-24 mb-3 rounded-lg"
                  />
                  <h3 className="font-bold text-xl mb-2">
                    Snapeek.exe (Desktop)
                  </h3>
                  <p>
                    Access all your images and notes locally, **completely
                    offline**. With Snapeek's desktop app, you maintain full
                    control over your data and enjoy an uninterrupted workflow.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* Call to Action */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full flex flex-col items-center py-16 text-center"
          >
            <div className="container mx-auto px-6 flex flex-col items-center">
              <h2 className="text-3xl font-bold mb-4 text-white dark:text-white">
                Ready to Take Control of Your Visual Notes?
              </h2>
              <p className="text-lg mb-6 max-w-2xl text-gray-700 dark:text-gray-300 text-center">
                Download the Snapeek desktop application to experience seamless
                offline access and ensure your data remains yours.
              </p>
              <a
                href="/Snapeek.exe"
                download
                className="mt-2 px-12 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl font-bold text-xl shadow-lg hover:from-blue-600 hover:to-blue-800 transition-transform transform hover:scale-105"
              >
                Download Now
              </a>
            </div>
          </motion.section>
        </main>
      </div>
    </>
  );
}
