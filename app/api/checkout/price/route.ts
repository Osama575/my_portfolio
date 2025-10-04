import { NextRequest, NextResponse } from "next/server";

type PriceInfo = { currency: string; amount: number; display: string; country: string };

function resolvePriceByCountry(country: string | null | undefined): PriceInfo {
  const c = (country || "").toUpperCase();
  switch (c) {
    case "GB":
    case "UK":
      return { currency: "gbp", amount: 1000, display: "£10", country: c || "GB" };
    case "US":
      return { currency: "usd", amount: 1000, display: "$10", country: c || "US" };
    case "CA":
      return { currency: "cad", amount: 1000, display: "CA$10", country: c || "CA" };
    case "NG":
      return { currency: "ngn", amount: 10000 * 100, display: "₦10,000", country: c || "NG" };
    default:
      return { currency: "usd", amount: 1000, display: "$10", country: c || "US" };
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const qpCountry = url.searchParams.get("country");
    const countryHeader =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-country") ||
      req.headers.get("x-geo-country");

    const info = resolvePriceByCountry(qpCountry || countryHeader || undefined);
    return NextResponse.json(info);
  } catch (e: any) {
    return NextResponse.json(
      { currency: "usd", amount: 1000, display: "$10", country: "US" },
      { status: 200 }
    );
  }
}


