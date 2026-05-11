"use client";
import { useState, useRef, useEffect } from "react";
import { Send, X, MessageCircle, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send initial greeting
      const greeting =
        language === "en"
          ? "👋 Hello! I'm NADRA Assistant. How can I help you today?"
          : "👋 السلام علیکم! میں نادرا اسسٹنٹ ہوں۔ آج میں آپ کی کیسے مدد کر سکتا ہوں؟";
      setMessages([{ sender: "bot", text: greeting }]);
    }
  }, [isOpen, language, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (directMessage) => {
    const userMessage = (directMessage || inputMessage).trim();
    if (!userMessage) return;

    setInputMessage("");
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          language,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.response },
        ]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMsg =
        language === "ur"
          ? "معذرت، کوئی خرابی ہوئی۔ براہ کرم دوبارہ کوشش کریں۔"
          : "Sorry, something went wrong. Please try again.";
      setMessages((prev) => [...prev, { sender: "bot", text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = language === "en" ? "ur" : "en";
    setLanguage(newLang);
    const langChangeMsg =
      newLang === "ur"
        ? "زبان اردو میں تبدیل ہو گئی"
        : "Language changed to English";
    setMessages((prev) => [...prev, { sender: "bot", text: langChangeMsg }]);
  };

  const quickQuestions =
    language === "en"
      ? [
          "How to apply for ID card?",
          "What are the fees?",
          "Track my application",
          "Required documents",
        ]
      : [
          "شناختی کارڈ کے لیے کیسے اپلائی کریں؟",
          "فیس کیا ہے؟",
          "اپنی درخواست ٹریک کریں",
          "مطلوبہ دستاویزات",
        ];

  return (
    <>
      {/* Chatbot Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-linear-to-br from-green-600 to-emerald-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group"
        >
          <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-linear-to-r from-green-600 to-emerald-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {language === "en" ? "NADRA Assistant" : "نادرا اسسٹنٹ"}
                </h3>
                <p className="text-xs text-green-100">
                  {language === "en" ? "Online • 24/7" : "آن لائن • 24/7"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title={language === "en" ? "Switch to Urdu" : "انگریزی میں تبدیل کریں"}
              >
                <Globe className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.sender === "user"
                      ? "bg-green-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"
                  }`}
                  style={{
                    direction: language === "ur" ? "rtl" : "ltr",
                  }}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-white">
              <p className="text-xs text-gray-500 mb-2" style={{ direction: language === "ur" ? "rtl" : "ltr" }}>
                {language === "en" ? "Quick Questions:" : "فوری سوالات:"}
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleSendMessage(question);
                    }}
                    className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors border border-green-200"
                    style={{ direction: language === "ur" ? "rtl" : "ltr" }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={
                  language === "en"
                    ? "Type your message..."
                    : "اپنا پیغام لکھیں..."
                }
                className="flex-1 rounded-xl"
                style={{ direction: language === "ur" ? "rtl" : "ltr" }}
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-green-600 hover:bg-green-700 rounded-xl px-4"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
