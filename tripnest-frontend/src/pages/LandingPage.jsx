import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: "🗓️",
    title: "Smart Trip Planning",
    desc: "Build beautiful day-wise itineraries with activities, timings and notes.",
  },
  {
    icon: "💰",
    title: "Budget Tracking",
    desc: "Set your travel budget and keep every expense organized in one place.",
  },
  {
    icon: "👥",
    title: "Travel Together",
    desc: "Plan trips with friends and family and keep everyone on the same page.",
  },
  {
    icon: "🧭",
    title: "Discover Places",
    desc: "Find attractions, experiences and destinations worth adding to your trip.",
  },
  {
    icon: "📄",
    title: "Travel Documents",
    desc: "Keep tickets, bookings and important travel documents organized.",
  },
  {
    icon: "🔔",
    title: "Smart Reminders",
    desc: "Stay ahead with helpful reminders for your trips, plans and budget.",
  },
];

const destinations = [
  {
    name: "Goa",
    tag: "Beach",
    trips: "2.4k trips",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Manali",
    tag: "Mountains",
    trips: "1.8k trips",
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Rajasthan",
    tag: "Heritage",
    trips: "3.1k trips",
    image:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Kerala",
    tag: "Nature",
    trips: "2.0k trips",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=85",
  },
];

const testimonials = [
  {
    name: "Aarav Sharma",
    role: "Weekend Traveler",
    text: "TripNest made planning our group trip ridiculously simple. Everyone knew where we had to be and what we were spending.",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Priya Mehta",
    role: "Frequent Traveler",
    text: "The day-wise itinerary is my favorite part. I can plan the whole trip without jumping between five different apps.",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    name: "Rahul Verma",
    role: "Group Traveler",
    text: "Finally a travel app that actually helps with both planning and expenses. Super useful for trips with friends.",
    avatar: "https://i.pravatar.cc/150?img=33",
  },
];

const steps = [
  {
    num: "01",
    icon: "👤",
    title: "Create your account",
    desc: "Sign up for free and get your personal travel dashboard.",
  },
  {
    num: "02",
    icon: "📍",
    title: "Choose your destination",
    desc: "Add your destination, dates and travel companions.",
  },
  {
    num: "03",
    icon: "🗺️",
    title: "Build your itinerary",
    desc: "Organize places, activities, timings and travel plans.",
  },
  {
    num: "04",
    icon: "✈️",
    title: "Travel smarter",
    desc: "Track expenses, manage documents and enjoy your trip.",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleRegister = () => {
    closeMobileMenu();
    navigate("/register");
  };

  const handleLogin = () => {
    closeMobileMenu();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/70">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
          {/* LOGO */}
          <button
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
              closeMobileMenu();
            }}
            className="flex items-center gap-2.5"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="text-xl">✈️</span>
            </div>

            <div className="text-xl font-bold tracking-tight">
              Trip<span className="text-blue-600">Nest</span>
            </div>
          </button>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-blue-600 transition">
              Features
            </a>

            <a href="#destinations" className="hover:text-blue-600 transition">
              Destinations
            </a>

            <a href="#how-it-works" className="hover:text-blue-600 transition">
              How it works
            </a>
          </div>

          {/* DESKTOP AUTH */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={handleLogin}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
            >
              Log in
            </button>

            <button
              onClick={handleRegister}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
            >
              Get started
            </button>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* MOBILE NAVIGATION */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-gray-100 bg-white shadow-xl">
            <div className="px-5 py-5 space-y-2">
              <a
                href="#features"
                onClick={closeMobileMenu}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition"
              >
                <span>Features</span>
                <span>→</span>
              </a>

              <a
                href="#destinations"
                onClick={closeMobileMenu}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition"
              >
                <span>Destinations</span>
                <span>→</span>
              </a>

              <a
                href="#how-it-works"
                onClick={closeMobileMenu}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition"
              >
                <span>How it works</span>
                <span>→</span>
              </a>

              <div className="border-t border-gray-100 my-3" />

              <button
                onClick={handleLogin}
                className="w-full px-4 py-3.5 rounded-xl text-gray-700 font-medium text-left hover:bg-gray-50 transition"
              >
                Log in
              </button>

              <button
                onClick={handleRegister}
                className="w-full px-4 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/20"
              >
                Get started for free →
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute w-[500px] h-[500px] bg-blue-100/60 rounded-full blur-3xl -top-40 -left-40" />

          <div className="absolute w-[400px] h-[400px] bg-indigo-100/50 rounded-full blur-3xl top-20 right-0" />
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            {/* HERO CONTENT */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-7">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                Your journey starts here
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-gray-950">
                Travel more.
                <br />
                <span className="text-blue-600">Plan less.</span>
              </h1>

              <p className="mt-7 text-lg sm:text-xl text-gray-500 leading-relaxed max-w-xl">
                Plan your entire journey in one place — from day-wise
                itineraries and budgets to group trips and travel documents.
              </p>

              {/* CTA BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 mt-9">
                <button
                  onClick={handleRegister}
                  className="px-7 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1"
                >
                  Start planning for free
                  <span className="ml-2">→</span>
                </button>

                <button
                  onClick={handleLogin}
                  className="px-7 py-4 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  I already have an account
                </button>
              </div>

              {/* TRUST */}
              <div className="flex items-center gap-4 mt-9">
                <div className="flex -space-x-3">
                  {[12, 32, 44, 52].map((img) => (
                    <img
                      key={img}
                      src={`https://i.pravatar.cc/100?img=${img}`}
                      alt=""
                      loading="lazy"
                      className="w-9 h-9 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>

                <div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-yellow-500 tracking-wide">★★★★★</span>

                    <span className="font-semibold text-gray-800">4.9/5</span>
                  </div>

                  <p className="text-xs text-gray-400">Loved by travelers</p>
                </div>
              </div>
            </div>

            {/* HERO IMAGE */}
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-200/30 rounded-[2rem] blur-2xl" />

              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-300/50 border-8 border-white">
                <img
                  src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=85"
                  alt="Beautiful travel destination"
                  className="w-full h-[430px] sm:h-[500px] lg:h-[560px] object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* FLOATING ITINERARY CARD */}
                <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
                        🗺️
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Upcoming adventure
                        </p>

                        <p className="font-semibold text-gray-900">
                          Explore the mountains
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-400">Days</p>

                      <p className="font-bold text-blue-600">07</p>
                    </div>
                  </div>

                  <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[68%] bg-blue-600 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATS
      ===================================================== */}
      <section className="border-y border-gray-100 bg-gray-50/70">
        <div className="max-w-5xl mx-auto grid grid-cols-3 divide-x divide-gray-200">
          {[
            ["10K+", "Trips planned"],
            ["50K+", "Happy travelers"],
            ["200+", "Destinations"],
          ].map(([number, label]) => (
            <div key={label} className="py-8 sm:py-10 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {number}
              </div>

              <div className="text-xs sm:text-sm text-gray-400 mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}
      <section id="features" className="py-24 lg:py-32 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-sm font-semibold text-blue-600">
              EVERYTHING IN ONE PLACE
            </span>

            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mt-3">
              Everything you need
              <br />
              <span className="text-gray-400">for a better trip.</span>
            </h2>

            <p className="text-gray-500 text-lg mt-5">
              Forget spreadsheets, notes and scattered booking information.
              TripNest keeps your entire trip organized.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-7 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-600 flex items-center justify-center text-xl transition-colors duration-300">
                  <span className="group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </span>
                </div>

                <div className="mt-6 flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>

                  <span className="text-xs text-gray-300 font-medium">
                    0{index + 1}
                  </span>
                </div>

                <p className="mt-3 text-sm text-gray-500 leading-6">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          DESTINATIONS
      ===================================================== */}
      <section
        id="destinations"
        className="py-24 lg:py-32 px-5 sm:px-8 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-12">
            <div>
              <span className="text-sm font-semibold text-blue-600">
                GET INSPIRED
              </span>

              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mt-2">
                Where will you go?
              </h2>

              <p className="text-gray-500 mt-3">
                Explore some of the most loved destinations.
              </p>
            </div>

            <button
              onClick={handleRegister}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Explore all destinations →
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {destinations.map((destination) => (
              <div
                key={destination.name}
                onClick={handleRegister}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                    {destination.tag}
                  </span>

                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold">{destination.name}</h3>

                    <p className="text-xs text-white/80 mt-1">
                      {destination.trips}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}
      <section id="how-it-works" className="py-24 lg:py-32 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-blue-600">
              SIMPLE PROCESS
            </span>

            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mt-3">
              From idea to itinerary.
            </h2>

            <p className="text-gray-500 mt-4 text-lg">
              Four simple steps and you're ready to go.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.num} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[65%] w-[75%] border-t border-dashed border-gray-200" />
                )}

                <div className="relative z-10 w-12 h-12 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-600/20">
                  {step.num}
                </div>

                <div className="text-3xl mt-6 mb-4">{step.icon}</div>

                <h3 className="font-semibold text-gray-900">{step.title}</h3>

                <p className="text-sm text-gray-500 leading-6 mt-2 max-w-xs mx-auto">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          TESTIMONIALS
      ===================================================== */}
      <section className="py-24 px-5 sm:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-blue-600">
              TRAVELER STORIES
            </span>

            <h2 className="text-4xl font-bold mt-3">
              People are planning better.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-white border border-gray-100 rounded-2xl p-7 hover:shadow-lg transition"
              >
                <div className="text-yellow-500 text-sm tracking-wide">
                  ★★★★★
                </div>

                <p className="text-gray-600 leading-7 mt-5 text-sm">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-3 mt-7">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    loading="lazy"
                    className="w-11 h-11 rounded-full object-cover"
                  />

                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {testimonial.name}
                    </p>

                    <p className="text-xs text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}
      <section className="px-5 sm:px-8 py-24">
        <div className="max-w-6xl mx-auto relative overflow-hidden rounded-[2rem] bg-blue-600 px-7 sm:px-12 py-16 sm:py-20 text-center">
          <div className="absolute w-72 h-72 rounded-full bg-white/10 -top-32 -left-20" />

          <div className="absolute w-80 h-80 rounded-full bg-white/10 -bottom-40 -right-20" />

          <div className="relative">
            <div className="text-5xl mb-6">✈️</div>

            <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Your next adventure
              <br />
              starts with a plan.
            </h2>

            <p className="text-blue-100 mt-5 max-w-xl mx-auto text-lg">
              Create your first trip on TripNest and turn your travel ideas into
              an organized adventure.
            </p>

            <button
              onClick={handleRegister}
              className="mt-9 px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl shadow-xl transition-all hover:-translate-y-1"
            >
              Start planning — it's free →
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
          <div className="flex flex-col md:flex-row justify-between gap-10">
            <div className="max-w-sm">
              <div className="flex items-center gap-2 text-white text-xl font-bold">
                <span>✈️</span>
                TripNest
              </div>

              <p className="text-sm leading-6 mt-4">
                A smarter way to plan, organize and enjoy your journeys.
              </p>
            </div>

            <div className="flex gap-16 text-sm">
              <div>
                <p className="text-white font-semibold mb-4">Product</p>

                <div className="space-y-3">
                  <a
                    href="#features"
                    className="block hover:text-white transition"
                  >
                    Features
                  </a>

                  <a
                    href="#destinations"
                    className="block hover:text-white transition"
                  >
                    Destinations
                  </a>

                  <a
                    href="#how-it-works"
                    className="block hover:text-white transition"
                  >
                    How it works
                  </a>
                </div>
              </div>

              <div>
                <p className="text-white font-semibold mb-4">Account</p>

                <div className="space-y-3">
                  <button
                    onClick={handleLogin}
                    className="block hover:text-white transition"
                  >
                    Login
                  </button>

                  <button
                    onClick={handleRegister}
                    className="block hover:text-white transition"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs">
            <p>© 2026 TripNest. All rights reserved.</p>

            <p>Travel planning made simple.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
