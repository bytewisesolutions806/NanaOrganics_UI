"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Mail } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = encodeURIComponent("Join the NANA Circle");
    const body = encodeURIComponent(
      `Please add ${email} to the NANA Circle mailing list.`,
    );
    window.location.href = `mailto:support@nanaorganics.com?subject=${subject}&body=${body}`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex h-12 w-full max-w-[490px] overflow-hidden rounded-md border border-white/80"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Enter your email to join the NANA Circle
      </label>
      <span className="flex shrink-0 items-center bg-white pl-3 pr-2 text-[#27382d] sm:px-4">
        <Mail aria-hidden="true" className="size-4 shrink-0" />
      </span>
      <input
        id="newsletter-email"
        type="email"
        name="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Enter your email here"
        autoComplete="email"
        required
        className="min-h-0 min-w-0 flex-1 bg-white px-2 text-sm text-[#27382d] outline-none placeholder:text-[#7b887e]"
      />
      <button
        type="submit"
        className="inline-flex shrink-0 items-center justify-center gap-1 border-l border-white/40 bg-[#214d39]/90 px-2.5 text-[11px] font-medium whitespace-nowrap text-white transition-colors hover:bg-[#183d2d] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white sm:gap-2 sm:px-5 sm:text-xs"
      >
        Join the Circle
        <ArrowRight aria-hidden="true" className="size-4" />
      </button>
    </form>
  );
}
