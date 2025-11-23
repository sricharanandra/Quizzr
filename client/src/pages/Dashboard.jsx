import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { animate, stagger } from "animejs";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import {
  PlusIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  CalendarIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

function Dashboard() {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchForms();

    // Mouse parallax effect
    const handleMouseMove = (e) => {
      const x = (e.clientX - window.innerWidth / 2) / 100;
      const y = (e.clientY - window.innerHeight / 2) / 100;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const fetchForms = async () => {
    setLoading(true);
    try {
      console.log("Fetching forms from API...");
      const response = await axios.get(API_ENDPOINTS.FORMS);
      console.log("API Response:", response.data);

      let formsData = [];

      if (Array.isArray(response.data)) {
        formsData = response.data;
      } else if (response.data && Array.isArray(response.data.forms)) {
        formsData = response.data.forms;
      } else {
        console.warn("Unexpected response format:", response.data);
        formsData = [];
      }

      // Ensure each form has required properties
      const validatedForms = formsData.map((form) => ({
        _id: form._id || form.id || Date.now(),
        title: form.title || "Untitled Form",
        description: form.description || "",
        questions: form.questions || [],
        isPublished: Boolean(form.isPublished),
        createdAt: form.createdAt || new Date().toISOString(),
        updatedAt: form.updatedAt || new Date().toISOString(),
        responses: form.responses || 0,
      }));

      console.log("Setting forms:", validatedForms);
      setForms(validatedForms);
    } catch (error) {
      console.error("Error fetching forms:", error);
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (formId) => {
    if (window.confirm("Are you sure you want to delete this form?")) {
      try {
        await axios.delete(`${API_ENDPOINTS.FORMS}/${formId}`);
        setForms((prev) => prev.filter((form) => form._id !== formId));
      } catch (error) {
        console.error("Error deleting form:", error);
        alert("Error deleting form. Please try again.");
      }
    }
  };

  // Filter forms based on search and filter
  const filteredForms = forms.filter((form) => {
    const matchesSearch =
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "published" && form.isPublished) ||
      (selectedFilter === "drafts" && !form.isPublished);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalForms: forms.length,
    publishedForms: forms.filter((f) => f.isPublished).length,
    draftForms: forms.filter((f) => !f.isPublished).length,
    totalResponses: forms.reduce((sum, f) => sum + (f.responses || 0), 0),
    averageCompletion: 85,
  };

  // Add test data function with proper question structure
  const addTestData = () => {
    const testForms = [
      {
        _id: "test-1",
        title: "Animal Categorization Quiz",
        description: "Sort different animals into their correct categories",
        questions: [
          {
            _id: "q1",
            id: "q1",
            type: "categorize",
            title: "Sort these animals into their correct categories",
            data: {
              categories: ["Mammals", "Birds", "Fish"],
              items: [
                { text: "Dog", belongsTo: "Mammals" },
                { text: "Eagle", belongsTo: "Birds" },
                { text: "Shark", belongsTo: "Fish" },
                { text: "Cat", belongsTo: "Mammals" },
                { text: "Parrot", belongsTo: "Birds" },
                { text: "Salmon", belongsTo: "Fish" },
              ],
            },
          },
        ],
        isPublished: true,
        createdAt: new Date().toISOString(),
        responses: 12,
      },
      {
        _id: "test-2",
        title: "Reading Comprehension Test",
        description: "Read a passage and answer multiple choice questions",
        questions: [
          {
            _id: "q2",
            id: "q2",
            type: "comprehension",
            title: "Read the passage and answer the questions",
            data: {
              passage:
                "The solar system consists of the Sun and the celestial objects that are bound to it by gravity. This includes eight planets, their moons, asteroids, comets, and other small bodies. The four inner planets - Mercury, Venus, Earth, and Mars - are terrestrial planets composed primarily of rock and metal. The four outer planets - Jupiter, Saturn, Uranus, and Neptune - are gas giants composed primarily of hydrogen and helium.",
              mcqs: [
                {
                  id: "mcq1",
                  question: "How many planets are in our solar system?",
                  options: ["Six", "Seven", "Eight", "Nine"],
                  correctAnswer: 2,
                },
                {
                  id: "mcq2",
                  question: "What are the outer planets primarily composed of?",
                  options: [
                    "Rock and metal",
                    "Hydrogen and helium",
                    "Ice and dust",
                    "Carbon and oxygen",
                  ],
                  correctAnswer: 1,
                },
              ],
            },
          },
        ],
        isPublished: false,
        createdAt: new Date().toISOString(),
        responses: 5,
      },
      {
        _id: "test-3",
        title: "Grammar Fill-in-the-Blanks",
        description: "Complete sentences by filling in the missing words",
        questions: [
          {
            _id: "q3",
            id: "q3",
            type: "cloze",
            title: "Fill in the missing words",
            data: {
              sentence:
                "The quick brown [fox] jumps over the lazy [dog] in the sunny [morning].",
              blanks: [
                { id: "blank1", text: "fox" },
                { id: "blank2", text: "dog" },
                { id: "blank3", text: "morning" },
              ],
            },
          },
        ],
        isPublished: true,
        createdAt: new Date().toISOString(),
        responses: 8,
      },
    ];

    console.log("Adding test data with proper questions:", testForms);
    setForms(testForms);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>

        {/* Floating orbs with parallax */}
        <div
          className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl opacity-30"
          style={{
            transform: `translate(${mousePosition.x * 0.3}px, ${
              mousePosition.y * 0.3
            }px)`,
          }}
        ></div>
        <div
          className="absolute bottom-1/3 right-1/5 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl opacity-30"
          style={{
            transform: `translate(${mousePosition.x * -0.3}px, ${
              mousePosition.y * -0.3
            }px)`,
          }}
        ></div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            transform: `translate(${mousePosition.x * 0.2}px, ${
              mousePosition.y * 0.2
            }px)`,
          }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity group"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-xl shadow-lg group-hover:scale-105 transition-transform"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <span className="text-2xl font-light bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent tracking-wide">
                    Form Builder
                  </span>
                  <p className="text-xs text-white/40 -mt-1 font-light">
                    Form Builder Pro
                  </p>
                </div>
              </button>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search forms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-xl"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">

              <button className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-2xl transition-all relative">
                <BellIcon className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-medium shadow-lg hover:scale-105 transition-all"
                >
                  JD
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 py-2 z-50">
                    <a
                      href="#"
                      className="block px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition-colors"
                    >
                      Profile Settings
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition-colors"
                    >
                      Billing
                    </a>
                    <hr className="my-2 border-white/10" />
                    <a
                      href="#"
                      className="block px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition-colors"
                    >
                      Sign out
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 py-12">
        {/* Hero Section */}
        <div className="mb-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-5xl md:text-6xl font-thin text-white mb-4 tracking-tight">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  John
                </span>{" "}
                👋
              </h1>
              <p className="text-xl text-white/70 mb-8 font-light leading-relaxed max-w-2xl">
                Create, manage, and analyze your interactive forms with elegance
                and precision
              </p>

              {/* Quick Stats */}
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white/60 text-sm font-light">
                    {stats.publishedForms} Published
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-white/60 text-sm font-light">
                    {stats.draftForms} Drafts
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-white/60 text-sm font-light">
                    {stats.totalResponses} Responses
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 lg:mt-0">
              <button
                onClick={() => navigate("/builder/new")}
                className="group relative bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white px-12 py-6 rounded-2xl font-medium shadow-2xl hover:shadow-purple-500/25 transition-all transform hover:-translate-y-1 flex items-center space-x-3"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <PlusIcon className="w-6 h-6 relative z-10" />
                <span className="relative z-10 text-lg">Create New Form</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <DocumentDuplicateIcon className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl">📝</span>
            </div>
            <div>
              <p className="text-4xl font-thin text-white mb-2">
                {stats.totalForms}
              </p>
              <p className="text-sm text-white/60 font-light">Total Forms</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircleIcon className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl">🚀</span>
            </div>
            <div>
              <p className="text-4xl font-thin text-white mb-2">
                {stats.publishedForms}
              </p>
              <p className="text-sm text-white/60 font-light">Published</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <UserGroupIcon className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-4xl font-thin text-white mb-2">
                {stats.totalResponses}
              </p>
              <p className="text-sm text-white/60 font-light">
                Total Responses
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <ChartBarIcon className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <p className="text-4xl font-thin text-white mb-2">
                {stats.averageCompletion}%
              </p>
              <p className="text-sm text-white/60 font-light">
                Avg. Completion
              </p>
            </div>
          </div>
        </div>

        {/* Forms Section */}
        <div className="space-y-8">
          {/* Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/10">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-6 py-3 rounded-xl font-medium transition-all text-sm ${
                  selectedFilter === "all"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                All Forms ({stats.totalForms})
              </button>
              <button
                onClick={() => setSelectedFilter("published")}
                className={`px-6 py-3 rounded-xl font-medium transition-all text-sm ${
                  selectedFilter === "published"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                Published ({stats.publishedForms})
              </button>
              <button
                onClick={() => setSelectedFilter("drafts")}
                className={`px-6 py-3 rounded-xl font-medium transition-all text-sm ${
                  selectedFilter === "drafts"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                Drafts ({stats.draftForms})
              </button>
            </div>
          </div>

          {/* Forms Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/60">Loading forms...</p>
              </div>
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <DocumentDuplicateIcon className="w-16 h-16 text-purple-400/50" />
              </div>
              <h3 className="text-3xl font-thin text-white mb-4">
                {searchQuery || selectedFilter !== "all"
                  ? "No forms found"
                  : "No forms yet"}
              </h3>
              <p className="text-white/60 mb-12 max-w-md mx-auto font-light text-lg leading-relaxed">
                {searchQuery || selectedFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first interactive form. It only takes a few minutes!"}
              </p>
              {!searchQuery && selectedFilter === "all" && (
                <button
                  onClick={() => navigate("/builder/new")}
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white px-12 py-6 rounded-2xl font-medium shadow-2xl hover:shadow-purple-500/25 transition-all transform hover:-translate-y-1"
                >
                  Create Your First Form
                </button>
              )}

              {/* Debug info */}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredForms.map((form, index) => {
                console.log(`Rendering form ${index}:`, form.title);
                return (
                  <div
                    key={form._id}
                    className="form-card group bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-medium text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
                            {form.title}
                          </h3>
                          <div
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              form.isPublished
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {form.isPublished ? "🟢 Live" : "🟡 Draft"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-white/50 mb-4">
                        <span className="flex items-center space-x-1">
                          <DocumentDuplicateIcon className="w-4 h-4" />
                          <span>{form.questions?.length || 0} questions</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>
                            {new Date(form.createdAt).toLocaleDateString()}
                          </span>
                        </span>
                      </div>

                      {/* Question Types */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {form.questions?.slice(0, 3).map((q, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-white/10 text-white/70 rounded-lg text-xs"
                          >
                            {q.type}
                          </span>
                        ))}
                        {form.questions?.length > 3 && (
                          <span className="px-2 py-1 bg-white/10 text-white/70 rounded-lg text-xs">
                            +{form.questions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="px-6 py-4 bg-white/5 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/fill/${form._id}`)}
                            className="p-2 text-white/60 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-all"
                            title="Fill Form"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/builder/${form._id}`)}
                            className="p-2 text-white/60 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-all"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteForm(form._id)}
                            className="p-2 text-white/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <button className="p-2 text-white/60 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all">
                          <ShareIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
