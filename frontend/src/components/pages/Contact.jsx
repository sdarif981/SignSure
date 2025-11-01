import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import Footer from "./Footer";
import Navbar from "./Navbar";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields.");
      return;
    }

    toast.success("Message sent! We’ll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 text-[#002D74] min-h-[calc(100vh-160px)] py-20 px-6 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-6">Contact Us</h1>
          <p className="text-center text-gray-600 mb-10">
            Have questions or ideas? We’re always open to feedback and collaboration.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="border-[#002D74]/40"
              />
              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your Email"
                className="border-[#002D74]/40"
              />
            </div>
            <Textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={6}
              placeholder="Your Message"
              className="border-[#002D74]/40"
            />
            <Button
              type="submit"
              className="bg-[#002D74] hover:bg-[#001e52] text-white w-full sm:w-auto px-6 py-3"
            >
              Send Message
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Contact;
