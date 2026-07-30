"use client";

import React from "react";
import Gallery from "@/components/Gallery";
import { MapPin, Phone, Mail, User, MessageSquare } from "lucide-react";

const contactUs = () => {
  return (
    <>
      {/* TOP GALLERY */}
      <section className="mb-10">
        <Gallery />
      </section>

      {/* CONTACT SECTION */}
      <section className="relative mt-2 overflow-visible">
        <div className="relative w-full p-5 md:p-10 lg:max-w-7xl mx-auto pb-28 md:pb-40">
          {/* 👆 responsive padding for overlap */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 rounded-2xl p-6 md:p-10">
            {/* LEFT: CONTACT INFO */}
            <div className="order-1">
              <h2 className="text-3xl font-semibold text-gray-900 mb-2">
                Contact Information
              </h2>
              <p className="text-gray-600 mb-8">
                We're here to help. Whether you have a question or need support.
              </p>

              <div className="space-y-6">
                <InfoItem
                  icon={<MapPin />}
                  title="Address"
                  value="123 Street Name, City, State, ZIP"
                />
                <InfoItem
                  icon={<Phone />}
                  title="Phone"
                  value="+91 98765 43210"
                />
                <InfoItem
                  icon={<Mail />}
                  title="Email"
                  value="support@example.com"
                />
              </div>
            </div>

            {/* RIGHT: FORM */}
            <div className="order-2 bg-[#E6F4F2] rounded-2xl p-6 md:p-8 shadow-sm relative z-10 mt-6 md:mt-0">
              <h3 className="text-2xl text-center font-bold text-gray-900 mb-4">
                Send Us a Message
              </h3>
              <p className="text-gray-600 mb-6 text-center">
                Have a question or request? Tell us a little about it below and
                our team will get back to you shortly
              </p>

              <form className="space-y-2">
                <Input
                  id="name"
                  label="Full Name"
                  icon={<User />}
                  placeholder="Enter your full name"
                />
                <Input
                  id="email"
                  label="Email Address"
                  icon={<Mail />}
                  placeholder="Enter your email"
                />
                <Input
                  id="phone"
                  label="Phone Number (Optional)"
                  icon={<Phone />}
                  placeholder="Enter your phone number"
                />
                <Textarea
                  id="message"
                  label="Message"
                  icon={<MessageSquare />}
                  placeholder="Write your message here..."
                />

                <button
                  type="submit"
                  className="w-full bg-[#1EA766]  text-[#FFFFFF] py-3 rounded-lg font-medium transition"
                >
                  Submit Message →
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 🌄 OVERLAPPING IMAGE */}
        <img
          src="/AuthMountain.svg"
          alt="mountain"
          className="
            absolute bottom-0 left-0
            w-[95%] md:w-[80%]
            max-h-[180px] md:max-h-[320px] lg:max-h-[420px]
            object-contain
            z-0
            pointer-events-none
          "
        />
      </section>
    </>
  );
};

export default contactUs;

/* ---------------- Components ---------------- */

function InfoItem({ icon, title, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-3 bg-[#E5F2F0] text-[#1EA766] rounded-lg">{icon}</div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-gray-600 text-sm">{value}</p>
      </div>
    </div>
  );
}

function Input({ label, icon, placeholder, className = "" }) {
  return (
    <div className="mt-6">
      <label htmlFor="Name">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
        <input
          type="text"
          placeholder={placeholder}
          className={`
          w-full pl-10 pr-4 py-3 rounded-lg
          bg-[#F5FCFB]
          border border-gray-200
          focus:ring-2 focus:ring-green-600
          focus:bg-white
          outline-none
          ${className}
        `}
        />
      </div>
    </div>
  );
}

function Textarea({ label, icon, placeholder, className = "" }) {
  return (
    <div className="mt-6">
      <label htmlFor="message">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-3 text-gray-400">{icon}</span>
        <textarea
          rows="4"
          placeholder={placeholder}
          className={`
          w-full pl-10 pr-4 py-3 rounded-lg
          bg-[#F5FCFB]
          border border-gray-200
          focus:ring-2 focus:ring-green-600
          focus:bg-white
          outline-none resize-none
          ${className}
        `}
        />
      </div>
    </div>
  );
}
