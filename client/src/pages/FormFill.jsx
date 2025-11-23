import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { animate, stagger } from "animejs";
import axios from "axios";
import { API_ENDPOINTS, UPLOAD_URL } from "../config/api";
import CategorizeRenderer from "../components/FormRenderer/CategorizeRenderer";
import ClozeRenderer from "../components/FormRenderer/ClozeRenderer";
import ComprehensionRenderer from "../components/FormRenderer/ComprehensionRenderer";
import {
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

function FormFill() {
  const { id: formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchForm();

    // Page entrance animations
    animate(".form-fill-hero", {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 1000,
      easing: "out-expo",
      delay: 300,
    });

    animate(".form-question", {
      opacity: [0, 1],
      translateY: [50, 0],
      scale: [0.95, 1],
      duration: 800,
      easing: "out-expo",
      delay: stagger(150, { start: 600 }),
    });

    // Mouse parallax
    const handleMouseMove = (e) => {
      const x = (e.clientX - window.innerWidth / 2) / 100;
      const y = (e.clientY - window.innerHeight / 2) / 100;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [formId]);

  const fetchForm = async () => {
    try {
      console.log("Fetching form with ID:", formId);
      const response = await axios.get(`${API_ENDPOINTS.FORMS}/${formId}`);
      console.log("Raw form data received:", response.data);

      let formData = response.data;

      // Check if questions array is empty or missing - ALWAYS add demo questions for now
      console.log("Questions check:", formData.questions);
      console.log(
        "Questions length:",
        formData.questions ? formData.questions.length : "undefined"
      );

      if (!formData.questions || formData.questions.length === 0) {
        console.log("No questions found - adding demo questions...");
        formData = addDemoQuestions(formData);
        console.log("Form after adding demo questions:", formData);
      }

      setForm(formData);

      // Initialize answers
      const initialAnswers = {};
      formData.questions?.forEach((question) => {
        const questionId = question._id || question.id;
        initialAnswers[questionId] = null;
      });
      setAnswers(initialAnswers);
      console.log("Initialized answers:", initialAnswers);
    } catch (error) {
      console.error("Error fetching form:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add demo questions - simplified and guaranteed to work
  const addDemoQuestions = (formData) => {
    console.log("Adding demo questions to form:", formData.title);

    const demoQuestions = [
      {
        _id: "demo_categorize_001",
        id: "demo_categorize_001",
        type: "categorize",
        title: "Sort these items into their correct categories",
        data: {
          categories: ["Fruits", "Vegetables", "Grains"],
          items: [
            { text: "Apple", belongsTo: "Fruits" },
            { text: "Carrot", belongsTo: "Vegetables" },
            { text: "Banana", belongsTo: "Fruits" },
            { text: "Broccoli", belongsTo: "Vegetables" },
            { text: "Rice", belongsTo: "Grains" },
            { text: "Wheat", belongsTo: "Grains" },
          ],
        },
      },
      {
        _id: "demo_cloze_002",
        id: "demo_cloze_002",
        type: "cloze",
        title: "Fill in the missing words",
        data: {
          sentence:
            "The quick brown [fox] jumps over the lazy [dog] on a [sunny] day.",
          blanks: [
            { id: "blank1", text: "fox" },
            { id: "blank2", text: "dog" },
            { id: "blank3", text: "sunny" },
          ],
        },
      },
      {
        _id: "demo_comprehension_003",
        id: "demo_comprehension_003",
        type: "comprehension",
        title: "Read the passage and answer the questions",
        data: {
          passage:
            "Climate change refers to long-term shifts in global temperatures and weather patterns. While climate change is natural, human activities have been the main driver since the 1800s, primarily through burning fossil fuels like coal, oil and gas. This produces greenhouse gas emissions that act like a blanket wrapped around Earth, trapping the sun's heat and raising temperatures.",
          mcqs: [
            {
              id: "mcq1",
              question:
                "What is the main driver of climate change since the 1800s?",
              options: [
                "Natural causes",
                "Human activities",
                "Solar radiation",
                "Ocean currents",
              ],
              correctAnswer: 1,
            },
            {
              id: "mcq2",
              question: "What do greenhouse gases do?",
              options: [
                "Cool the Earth",
                "Trap heat around Earth",
                "Create wind patterns",
                "Reduce solar energy",
              ],
              correctAnswer: 1,
            },
          ],
        },
      },
    ];

    return {
      ...formData,
      questions: demoQuestions,
    };
  };

  const handleAnswer = (questionId, answer) => {
    console.log("Answer received for question", questionId, ":", answer);
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    animate(".submit-button", {
      scale: [1, 0.95, 1],
      duration: 200,
      easing: "out-quad",
    });

    try {
      const submissionData = {
        formId: formId,
        answers: Object.keys(answers).map((questionId) => ({
          questionId,
          answer: answers[questionId],
        })),
      };

      console.log("Submitting form data:", submissionData);
      await axios.post(API_ENDPOINTS.RESPONSES, submissionData);
      navigate("/success");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question, index) => {
    const questionId = question._id || question.id;
    console.log("Rendering question:", questionId, question.type);

    switch (question.type) {
      case "categorize":
        return (
          <CategorizeRenderer
            key={questionId}
            question={question}
            onAnswer={(answer) => handleAnswer(questionId, answer)}
          />
        );
      case "cloze":
        return (
          <ClozeRenderer
            key={questionId}
            question={question}
            onAnswer={(answer) => handleAnswer(questionId, answer)}
          />
        );
      case "comprehension":
        return (
          <ComprehensionRenderer
            key={questionId}
            question={question}
            onAnswer={(answer) => handleAnswer(questionId, answer)}
          />
        );
      default:
        console.warn("Unknown question type:", question.type);
        return (
          <div key={questionId} className="text-center py-8 text-white/60">
            <p>Unknown question type: {question.type}</p>
            <pre className="text-xs mt-4 bg-white/5 p-4 rounded text-left overflow-auto">
              {JSON.stringify(question, null, 2)}
            </pre>
          </div>
        );
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    
    console.log('Original imagePath:', imagePath);
    console.log('UPLOAD_URL:', UPLOAD_URL);
    
    // Clean the image path - remove any leading slashes and uploads prefix
    let cleanPath = imagePath;
    
    // Remove leading slashes
    cleanPath = cleanPath.replace(/^\/+/, '');
    
    // Remove uploads/ prefix if it exists (to avoid double uploads/uploads/)
    cleanPath = cleanPath.replace(/^uploads\//, '');
    
    console.log('Cleaned path:', cleanPath);
    
    // Construct the final URL - UPLOAD_URL already contains /uploads
    const finalUrl = `${UPLOAD_URL}/${cleanPath}`;
    console.log('Final URL:', finalUrl);
    
    return finalUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-spin">
              <SparklesIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-light text-white mb-4">
              Loading interactive form...
            </h2>
            <p className="text-white/60 font-light">
              Please wait while we prepare your experience
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <DocumentTextIcon className="w-10 h-10 text-red-400/50" />
            </div>
            <h2 className="text-3xl font-light text-white mb-4">
              Form not found
            </h2>
            <p className="text-white/60 font-light mb-8">
              The form you're looking for doesn't exist.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-medium hover:scale-105 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>

        {/* Floating orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl opacity-30"
          style={{
            transform: `translate(${mousePosition.x * 0.3}px, ${
              mousePosition.y * 0.3
            }px)`,
          }}
        ></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl opacity-30"
          style={{
            transform: `translate(${mousePosition.x * -0.2}px, ${
              mousePosition.y * -0.2
            }px)`,
          }}
        ></div>

        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            transform: `translate(${mousePosition.x * 0.1}px, ${
              mousePosition.y * 0.1
            }px)`,
          }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-light bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent tracking-wide">
                  Form Builder
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-white/60 text-sm font-light">
                <ClockIcon className="w-4 h-4 inline mr-2" />
                Interactive Form
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-8 py-12">
        {/* Hero Section */}
        <div className="form-fill-hero text-center mb-16">
          {form.headerImage && (
            <div className="mb-8">
              <img
                src={getImageUrl(form.headerImage)}
                alt="Form header"
                className="w-full max-w-2xl mx-auto rounded-3xl shadow-2xl object-cover border border-white/10"
                style={{ maxHeight: "300px" }}
              />
            </div>
          )}

          <h1 className="text-5xl md:text-6xl font-thin tracking-tight mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              {form.title}
            </span>
          </h1>

          {form.description && (
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
              {form.description}
            </p>
          )}

          <div className="flex items-center justify-center space-x-8 text-white/50">
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="w-5 h-5" />
              <span className="font-light">
                {form.questions?.length || 0} questions
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5" />
              <span className="font-light">
                ~{Math.ceil((form.questions?.length || 0) * 1.5)} min
              </span>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        {form.questions?.some((q) => q._id.startsWith("demo_")) && (
          <div className="mb-12 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <SparklesIcon className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-medium text-blue-300">
                🎯 Demo Mode Active
              </h3>
            </div>
            <p className="text-blue-200/80 font-light">
              This form doesn't have questions yet, so we're showing interactive
              demo questions. The form creator can add real questions in the
              form builder.
            </p>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-12">
          {form.questions && form.questions.length > 0 ? (
            form.questions.map((question, index) => {
              console.log(`Mapping question ${index}:`, question);
              return (
                <div
                  key={question._id || question.id}
                  className="form-question bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-medium shadow-lg">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-light text-white mb-2">
                          {question.title}
                        </h2>
                        <div className="flex items-center space-x-4">
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-xl text-sm font-light border border-purple-500/30">
                            {question.type}
                          </span>
                          {question._id?.startsWith("demo_") && (
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-xl text-sm font-light border border-blue-500/30">
                              Demo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {question.image && (
                      <div className="mb-8">
                        <img
                          src={getImageUrl(question.image)}
                          alt="Question illustration"
                          className="w-full max-w-lg mx-auto rounded-2xl shadow-lg object-cover border border-white/10"
                          style={{ maxHeight: "400px" }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="question-content">
                    {renderQuestion(question, index)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <DocumentTextIcon className="w-16 h-16 text-purple-400/50" />
              </div>
              <h3 className="text-3xl font-thin text-white mb-4">
                No questions available
              </h3>
              <p className="text-white/60 mb-8 max-w-md mx-auto font-light text-lg leading-relaxed">
                This form doesn't have any questions yet.
              </p>
            </div>
          )}
        </div>

        {/* Submit Section - Only show if there are questions */}
        {form.questions && form.questions.length > 0 && (
          <div className="text-center pt-16">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12">
              <div className="mb-8">
                <CheckCircleIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-3xl font-light text-white mb-4">
                  Ready to submit?
                </h3>
                <p className="text-white/70 font-light">
                  {form.questions?.some((q) => q._id.startsWith("demo_"))
                    ? "This is a demo form - your answers will be recorded for testing purposes"
                    : "Review your answers and submit when ready"}
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="submit-button group bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-12 py-6 rounded-2xl text-lg font-medium shadow-2xl hover:shadow-emerald-500/25 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center space-x-3">
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Form</span>
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default FormFill;
