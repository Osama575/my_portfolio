"use client";
import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Lottie from "react-lottie";
import confettiAnimation from "@/data/confetti.json";

type SpeedOption = "week" | "month" | "flexible" | "";
type CatalogOption = "variants" | "bundles" | "configurator" | "none";
type CheckoutOption = "tiered" | "discounts" | "approvals" | "standard" | "";
type SubsOption = "yes" | "later" | "no" | "";
type RegionOption = "multi" | "eu" | "single" | "";
type ToolsOption = "erp" | "analytics" | "none" | "";
type GrowthOption = "ab" | "spikes" | "works" | "";

function computeVerdict(params: {
  speed: SpeedOption;
  catalog: CatalogOption[];
  checkout: CheckoutOption;
  subs: SubsOption;
  regions: RegionOption;
  tools: ToolsOption;
  growth: GrowthOption;
}): {
  score: number;
  label: "Great fit for standard platforms" | "Borderline — could go either way" | "Custom build recommended";
  reason: string;
} {
  let score = 0;

  // Launch speed
  if (params.speed === "week") score += 0;
  else if (params.speed === "month") score += 1;
  else if (params.speed === "flexible") score += 2;

  // Catalog complexity
  const hasComplexCatalog = params.catalog.includes("bundles") || params.catalog.includes("configurator");
  if (hasComplexCatalog) score += 3;
  else if (params.catalog.includes("variants")) score += 1;
  else if (params.catalog.includes("none")) score += 0;

  // Checkout rules
  if (params.checkout === "standard") score += 0;
  else if (params.checkout === "discounts") score += 2;
  else if (params.checkout === "tiered" || params.checkout === "approvals") score += 3;

  // Subscriptions
  if (params.subs === "yes") score += 2;
  else if (params.subs === "later") score += 1;

  // Regions
  if (params.regions === "multi") score += 2;
  else if (params.regions === "eu") score += 2;

  // Tools
  if (params.tools === "erp") score += 3;
  else if (params.tools === "analytics") score += 0;

  // Growth
  if (params.growth === "ab") score += 2;
  else if (params.growth === "spikes") score += 2;

  let label: "Great fit for standard platforms" | "Borderline — could go either way" | "Custom build recommended";
  if (score <= 3) label = "Great fit for standard platforms";
  else if (score <= 7) label = "Borderline — could go either way";
  else label = "Custom build recommended";

  const reason = `Score ${score}. Higher scores indicate needs like configurators, ERP, complex checkout, multi-region, or subscriptions.`;

  return { score, label, reason };
}

export default function FitCheckPage() {
  const [speed, setSpeed] = useState<SpeedOption>("");
  const [catalog, setCatalog] = useState<CatalogOption[]>([]);
  const [checkout, setCheckout] = useState<CheckoutOption>("");
  const [subs, setSubs] = useState<SubsOption>("");
  const [regions, setRegions] = useState<RegionOption>("");
  const [tools, setTools] = useState<ToolsOption>("");
  const [growth, setGrowth] = useState<GrowthOption>("");
  const [submitted, setSubmitted] = useState(false);
  const [finalVerdict, setFinalVerdict] = useState<"CUSTOM" | "BUILDERS" | "">("");
  const [finalExplanation, setFinalExplanation] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const finalVerdictRef = useRef<HTMLDivElement | null>(null);

  const verdict = useMemo(
    () =>
      computeVerdict({
        speed,
        catalog,
        checkout,
        subs,
        regions,
        tools,
        growth,
      }),
    [speed, catalog, checkout, subs, regions, tools, growth]
  );

  function toggleCatalog(option: CatalogOption) {
    setCatalog((prev) => {
      if (option === "none") return ["none"];
      const withoutNone = prev.filter((o) => o !== "none");
      return withoutNone.includes(option)
        ? withoutNone.filter((o) => o !== option)
        : [...withoutNone, option];
    });
  }

  const allAnswered = Boolean(
    speed && checkout && subs && regions && tools && growth && catalog.length > 0
  );

  function handleSubmit() {
    if (!allAnswered) return;
    const simplified: "CUSTOM" | "BUILDERS" = verdict.score >= 8 ? "CUSTOM" : "BUILDERS";
    const explanation =
      simplified === "CUSTOM"
        ? "You have advanced needs (e.g., configurators, ERP, complex pricing/rules). A custom build will fit better."
        : "Your requirements match standard ecommerce features. Use a builder to launch fast and iterate.";
    setFinalVerdict(simplified);
    setFinalExplanation(explanation);
    setSubmitted(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    if (finalVerdictRef.current) {
      finalVerdictRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const confettiOptions = {
    loop: false,
    autoplay: true,
    animationData: confettiAnimation as any,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <main className="relative min-h-screen bg-black-100 text-white flex flex-col items-center sm:px-10 px-5 py-20">
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-[6000] flex items-center justify-center">
          <Lottie options={confettiOptions} height={400} width={400} />
        </div>
      )}
      <div className="w-full max-w-3xl">
        <div className="mb-8">
          <Link href="/" className="text-sm text-neutral-300 hover:underline">
            ← Back to home
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold mb-2">
          1‑Minute Ecommerce Fit Check
        </h1>
        <p className="text-neutral-300 mb-8">Answer 7 questions to get a quick verdict.</p>

        <div className="space-y-8">
          <section>
            <h2 className="font-medium mb-3">1) How fast do you need to launch?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${speed === "week" ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => setSpeed("week")}>This week</button>
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${speed === "month" ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => setSpeed("month")}>This month</button>
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${speed === "flexible" ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => setSpeed("flexible")}>Flexible</button>
            </div>
          </section>

          <section>
            <h2 className="font-medium mb-3">2) Catalog complexity — any of these? (tick all that apply)</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${catalog.includes("variants") ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => toggleCatalog("variants")}>Variants (sizes/colors)</button>
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${catalog.includes("bundles") ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => toggleCatalog("bundles")}>Bundles/kits</button>
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${catalog.includes("configurator") ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => toggleCatalog("configurator")}>Build-to-order/configurator</button>
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${catalog.includes("none") ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => toggleCatalog("none")}>None of these</button>
            </div>
          </section>

          <section>
            <h2 className="font-medium mb-3">3) Checkout rules — anything custom?</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${checkout === "tiered" ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => setCheckout("tiered")}>Tiered/wholesale pricing</button>
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${checkout === "discounts" ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => setCheckout("discounts")}>Complex discounts/fees/shipping rules</button>
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${checkout === "approvals" ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => setCheckout("approvals")}>Approvals or PO/net terms</button>
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${checkout === "standard" ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => setCheckout("standard")}>Nope, standard checkout is fine</button>
            </div>
          </section>

          <section>
            <h2 className="font-medium mb-3">4) Subscriptions or memberships?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${subs === "yes" ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => setSubs("yes")}>Yes</button>
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${subs === "later" ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => setSubs("later")}>Maybe later</button>
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${subs === "no" ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => setSubs("no")}>No</button>
            </div>
          </section>

          <section>
            <h2 className="font-medium mb-3">5) Regions & currency/tax differences?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${regions === "multi" ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => setRegions("multi")}>Multiple countries or currencies</button>
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${regions === "eu" ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => setRegions("eu")}>UK/EU SCA/3DS quirks to consider</button>
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${regions === "single" ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => setRegions("single")}>Single country, single currency</button>
            </div>
          </section>

          <section>
            <h2 className="font-medium mb-3">6) Tools to integrate (real-time)?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${tools === "erp" ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => setTools("erp")}>ERP / Warehouse / Accounting / CRM</button>
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${tools === "analytics" ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => setTools("analytics")}>Just email & analytics</button>
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${tools === "none" ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => setTools("none")}>None yet</button>
            </div>
          </section>

          <section>
            <h2 className="font-medium mb-3">7) Growth & performance — what matters most?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${growth === "ab" ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => setGrowth("ab")}>A/B test the whole funnel (incl. checkout)</button>
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${growth === "spikes" ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => setGrowth("spikes")}>Handle big promo spikes smoothly</button>
              <button className={`w-full px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 ${growth === "works" ? "bg-indigo-600/20 border-indigo-500/50" : ""}`} onClick={() => setGrowth("works")}>Just need it to work</button>
            </div>
          </section>

          <section className="pt-2">
            <button
              className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium border border-white/10 hover:bg-white/10 ${
                allAnswered ? "opacity-100 cursor-pointer" : "opacity-50 cursor-not-allowed"
              }`}
              onClick={handleSubmit}
              disabled={!allAnswered}
            >
              Submit
            </button>
          </section>

          {submitted && (
            <section className="mt-6 p-5 rounded-lg border border-white/10 bg-white/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-neutral-300">Your verdict</p>
                  <p className="text-lg md:text-xl font-semibold mt-1">{verdict.label}</p>
                  <p className="text-sm text-neutral-300 mt-1">{verdict.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-300">Score</p>
                  <p className="text-2xl font-bold">{verdict.score}</p>
                </div>
              </div>
            </section>
          )}

          {submitted && (
            <section ref={finalVerdictRef} className="mt-4 p-5 rounded-lg border border-white/20 bg-white/10">
              <p className="text-sm text-neutral-300">Final verdict</p>
              <p className="text-2xl md:text-3xl font-bold tracking-wide mt-1">
                {finalVerdict}
              </p>
              <p className="text-sm text-neutral-200 mt-2">{finalExplanation}</p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}


