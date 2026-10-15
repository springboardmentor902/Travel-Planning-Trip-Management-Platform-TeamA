
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  { icon: "🗓️", title: "Smart Trip Planning", desc: "Build day-wise itineraries with activities, timings and notes." },
  { icon: "💰", title: "Budget Tracking", desc: "Set your travel budget and organize every expense." },
  { icon: "👥", title: "Travel Together", desc: "Plan trips with friends and family in one place." },
  { icon: "🧭", title: "Discover Places", desc: "Explore attractions and destinations for your next trip." },
  { icon: "📄", title: "Travel Documents", desc: "Keep tickets, bookings and important documents organized." },
  { icon: "🔔", title: "Smart Reminders", desc: "Stay ahead with reminders for your travel plans." },
];

const destinations = [
  {
    name: "Goa",
    tag: "Beaches",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Manali",
    tag: "Mountains",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Rajasthan",
    tag: "Heritage",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Kerala",
    tag: "Nature",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Agra",
    tag: "Architecture",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Varanasi",
    tag: "Culture",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Shimla",
    tag: "Hill Station",
    image: "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Ladakh",
    tag: "Adventure",
    image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Jaipur",
    tag: "Royal Heritage",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Pune",
    tag: "City Escape",
    image: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "London",
    tag: "International",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Paris",
    tag: "Romantic Getaway",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=85",
  },
];

const steps = [
  { num: "01", icon: "👤", title: "Create your account", desc: "Sign up and access your personal travel dashboard." },
  { num: "02", icon: "📍", title: "Choose your destination", desc: "Select destinations and add your travel details." },
  { num: "03", icon: "🗺️", title: "Build your itinerary", desc: "Organize places, activities and travel plans." },
  { num: "04", icon: "✈️", title: "Travel smarter", desc: "Manage expenses, documents and enjoy your journey." },
];

const testimonials = [
  {
    name: "Aarav Sharma",
    role: "Weekend Traveler",
    text: "TripNest made planning our group trip simple. Everyone knew where we had to be and what we were spending.",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Priya Mehta",
    role: "Frequent Traveler",
    text: "The day-wise itinerary is my favorite feature. I can organize a complete trip in one place.",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    name: "Rahul Verma",
    role: "Group Traveler",
    text: "A useful way to manage travel plans and expenses when travelling with friends.",
    avatar: "https://i.pravatar.cc/150?img=33",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleRegister = () => {
    closeMobileMenu();
    navigate("/register");
  };

  const handleLogin = () => {
    closeMobileMenu();
    navigate("/login");
  };

  const scrollToTop = () => {
    closeMobileMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Destinations", href: "#destinations" },
    { label: "How it works", href: "#how-it-works" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-gray-900">
      {/* NAVBAR */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-gray-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2.5"
            aria-label="TripNest home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl shadow-lg shadow-blue-600/20">
              ✈️
            </span>
            <span className="text-xl font-bold tracking-tight">
              Trip<span className="text-blue-600">Nest</span>
            </span>
          </button>

          <div className="hidden items-center gap-8 text-sm font-medium text-gray-500 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition hover:text-blue-600"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={handleLogin}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:text-blue-600"
            >
              Log in
            </button>
            <button
              onClick={handleRegister}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Get started
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="text-xl">{mobileMenuOpen ? "✕" : "☰"}</span>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white px-5 py-4 shadow-xl md:hidden">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={handleLogin}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold"
              >
                Log in
              </button>
              <button
                onClick={handleRegister}
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
              >
                Get started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute right-0 top-20 h-[400px] w-[400px] rounded-full bg-indigo-100/50 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-sm font-medium text-blue-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                Your journey starts here
              </div>

              <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-gray-950 sm:text-6xl lg:text-7xl">
                Travel more.
                <br />
                <span className="text-blue-600">Plan less.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-gray-500 sm:text-xl">
                Plan your entire journey in one place — from day-wise
                itineraries and budgets to group trips and travel documents.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleRegister}
                  className="rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-1 hover:bg-blue-700"
                >
                  Start planning for free <span className="ml-2">→</span>
                </button>
                <button
                  onClick={handleLogin}
                  className="rounded-xl border border-gray-200 bg-white px-7 py-4 font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50/50"
                >
                  I already have an account
                </button>
              </div>

              <div className="mt-9 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[12, 32, 44, 52].map((img) => (
                    <img
                      key={img}
                      src={`https://i.pravatar.cc/100?img=${img}`}
                      alt=""
                      loading="lazy"
                      className="h-9 w-9 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="tracking-wide text-yellow-500">★★★★★</span>
                    <span className="font-semibold text-gray-800">4.9/5</span>
                  </div>
                  <p className="text-xs text-gray-400">Loved by travelers</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-blue-200/30 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border-8 border-white shadow-2xl shadow-gray-300/50">
                <img
                  src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=85"
                  alt="Beautiful travel destination"
                  fetchPriority="high"
                  className="h-[430px] w-full object-cover sm:h-[500px] lg:h-[560px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur-xl sm:bottom-6 sm:left-6 sm:right-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                        🗺️
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Your next adventure</p>
                        <p className="font-semibold text-gray-900">
                          Explore somewhere new
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl">✈️</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-gray-100 bg-gray-50/70">
        <div className="mx-auto grid max-w-5xl grid-cols-3 divide-x divide-gray-200">
          {[
            ["10K+", "Trips planned"],
            ["50K+", "Happy travelers"],
            ["200+", "Destinations"],
          ].map(([number, label]) => (
            <div key={label} className="px-2 py-8 text-center sm:py-10">
              <div className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {number}
              </div>
              <div className="mt-1 text-xs text-gray-400 sm:text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-24 px-5 py-24 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="text-sm font-semibold text-blue-600">
              EVERYTHING IN ONE PLACE
            </span>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Everything you need
              <br />
              <span className="text-gray-400">for a better trip.</span>
            </h2>
            <p className="mt-5 text-lg text-gray-500">
              Keep your itinerary, budget, travel documents and plans organized.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-100 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/30"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl transition group-hover:bg-blue-600">
                  <span className="transition group-hover:scale-110">
                    {feature.icon}
                  </span>
                </div>
                <div className="mt-6 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <span className="text-xs font-medium text-gray-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-500">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALL DESTINATIONS */}
      <section
        id="destinations"
        className="scroll-mt-20 bg-gray-50 px-5 py-24 sm:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-sm font-semibold text-blue-600">
                GET INSPIRED
              </span>
              <h2 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
                Where will you go?
              </h2>
              <p className="mt-3 text-gray-500">
                Explore destinations and find inspiration for your next trip.
              </p>
            </div>

            <button
              onClick={handleRegister}
              className="self-start text-sm font-semibold text-blue-600 transition hover:text-blue-700 sm:self-auto"
            >
              Start planning <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {destinations.map((destination) => (
              <article
                key={destination.name}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/60"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 backdrop-blur-sm">
                    {destination.tag}
                  </span>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white">
                      {destination.name}
                    </h3>
                    <p className="mt-1 text-sm text-white/80">
                      Discover this destination
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500">
              Find your next adventure with TripNest.
            </p>
            <button
              onClick={handleRegister}
              className="mt-4 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Start planning your trip →
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="scroll-mt-24 px-5 py-24 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="text-sm font-semibold text-blue-600">
              SIMPLE PROCESS
            </span>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              From idea to itinerary.
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Four simple steps and you're ready to go.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.num} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="absolute left-[65%] top-6 hidden w-[75%] border-t border-dashed border-gray-200 lg:block" />
                )}
                <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
                  {step.num}
                </div>
                <div className="mb-4 mt-6 text-3xl">{step.icon}</div>
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-gray-500">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-gray-50 px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <span className="text-sm font-semibold text-blue-600">
              TRAVELER STORIES
            </span>
            <h2 className="mt-3 text-4xl font-bold tracking-tight">
              People are planning better.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className="rounded-2xl border border-gray-100 bg-white p-7 transition hover:shadow-lg"
              >
                <div className="text-sm tracking-wide text-yellow-500">
                  ★★★★★
                </div>
                <p className="mt-5 text-sm leading-7 text-gray-600">
                  “{testimonial.text}”
                </p>
                <div className="mt-7 flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    loading="lazy"
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 py-24 sm:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-blue-600 px-7 py-16 text-center sm:px-12 sm:py-20">
          <div className="absolute -left-20 -top-32 h-72 w-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-40 -right-20 h-80 w-80 rounded-full bg-white/10" />

          <div className="relative">
            <div className="mb-6 text-5xl">✈️</div>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Your next adventure
              <br />
              starts with a plan.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-blue-100">
              Create your first trip on TripNest and turn your travel ideas
              into an organized adventure.
            </p>
            <button
              onClick={handleRegister}
              className="mt-9 rounded-xl bg-white px-8 py-4 font-bold text-blue-600 shadow-xl transition hover:-translate-y-1 hover:bg-blue-50"
            >
              Start planning — it's free →
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <div className="max-w-sm">
              <button
                onClick={scrollToTop}
                className="flex items-center gap-2 text-xl font-bold text-white"
              >
                <span>✈️</span>
                TripNest
              </button>
              <p className="mt-4 text-sm leading-6">
                A smarter way to plan, organize and enjoy your journeys.
              </p>
            </div>

            <div className="flex gap-12 text-sm sm:gap-16">
              <div>
                <p className="mb-4 font-semibold text-white">Explore</p>
                <div className="space-y-3">
                  <a href="#features" className="block transition hover:text-white">
                    Features
                  </a>
                  <a href="#destinations" className="block transition hover:text-white">
                    Destinations
                  </a>
                  <a href="#how-it-works" className="block transition hover:text-white">
                    How it works
                  </a>
                </div>
              </div>

              <div>
                <p className="mb-4 font-semibold text-white">Account</p>
                <div className="space-y-3">
                  <button onClick={handleLogin} className="block transition hover:text-white">
                    Log in
                  </button>
                  <button onClick={handleRegister} className="block transition hover:text-white">
                    Sign up
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row">
            <p>© {new Date().getFullYear()} TripNest. All rights reserved.</p>
            <p>Travel planning made simple.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
