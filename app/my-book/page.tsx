"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FaLock, FaDownload, FaFilePdf } from "react-icons/fa6";

const NAIRA_TO_KOBO = 100;

export default function MyBookPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [priceAmount, setPriceAmount] = useState<number>(1000000); // default NGN 10,000 in kobo
  const [currency, setCurrency] = useState<string>("ngn");
  const [displayPrice, setDisplayPrice] = useState<string>("₦10,000");

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/checkout/price", { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to detect price");
        const data = await res.json();
        setCurrency(data.currency);
        setPriceAmount(data.amount);
        setDisplayPrice(data.display);
      } catch (e) {
        setCurrency("usd");
        setPriceAmount(1000);
        setDisplayPrice("$10");
      }
    })();
    return () => controller.abort();
  }, []);

  const handleBuy = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/checkout/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // price in kobo per Stripe's expected smallest currency unit
          amount: priceAmount,
          currency,
          product: {
            name: "HELLO FRAUD: Why you feel like an imposter in tech and how to fix it",
            description: "A practical guide to overcoming imposter syndrome in tech identify triggers, reframe self‑doubt, and apply evidence‑based habits to build confidence and ship consistently.",
            image: "/BOOK.png",
          },
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to create checkout session");
      }
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error(e);
      alert("Unable to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10 px-5">
      {/* Decorative gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-purple/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-10 h-[420px] w-[420px] rounded-full bg-blue-100/10 blur-3xl" />

      <div className="max-w-6xl w-full py-24">
        {/* Auto-download after Stripe returns with session_id */}
        <AutoDownloadHelper />

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex gap-2 items-center text-xs text-blue-100 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            <FaFilePdf className="opacity-80" />
            <span>eBook PDF</span>
            <span className="mx-1">•</span>
            <FaDownload className="opacity-80" />
            <span>Instant download</span>
          </div>
          <h1 className="mt-4 font-bold text-3xl md:text-5xl">HELLO FRAUD</h1>
          <p className="mt-3 text-white-100 md:text-lg">Why you feel like an imposter in tech and how to fix it</p>
        </div>

        {/* Card */}
        <div className="grid lg:grid-cols-2 gap-10 items-start bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 backdrop-blur-xl">
          {/* Cover */}
          <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-white/15">
            <Image src="/BOOK.png" alt="Book cover" fill className="object-cover" />
          </div>

          {/* Details */}
          <div>
            <p className="text-white-100 leading-relaxed">
              A concise, practitioner-first guide to understanding and overcoming imposter syndrome in tech—clear frameworks,
              practical exercises, and daily routines to build confidence and deliver with clarity.
            </p>

            {/* Features */}
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <li className="flex items-center gap-2 text-white-100"><FaDownload className="text-purple" /> Instant download after purchase</li>
              <li className="flex items-center gap-2 text-white-100"><FaFilePdf className="text-purple" /> PDF you can read anywhere</li>
              <li className="flex items-center gap-2 text-white-100"><FaLock className="text-purple" /> Secure Stripe checkout</li>
              <li className="flex items-center gap-2 text-white-100">No account or login required</li>
            </ul>

            {/* Price */}
            <div className="mt-8 flex items-center gap-4">
              <div className="inline-flex items-baseline gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <span className="text-3xl font-extrabold">{displayPrice}</span>
                <span className="text-white-200 text-xs">ebook (PDF)</span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleBuy}
              disabled={loading}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-purple px-6 py-3 font-semibold text-white disabled:opacity-60 hover:opacity-90 transition"
            >
              {loading ? "Redirecting…" : "Buy with Stripe"}
            </button>
            <p className="text-xs text-white-200 mt-3">No account needed. You will be redirected back here to download automatically.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

function AutoDownloadHelper() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const sessionId = params.get("session_id");
    if (success === "true" && sessionId) {
      const url = `/api/checkout/download?session_id=${encodeURIComponent(sessionId)}`;
      // Trigger browser download
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "HELLO-FRAUD.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }
  }, []);
  return null;
}


