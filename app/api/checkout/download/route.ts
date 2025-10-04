import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import path from "path";
import fs from "fs/promises";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" })
  : (null as unknown as Stripe);

export async function GET(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not verified" }, { status: 402 });
    }

    const filePath = path.join(process.cwd(), "public", "HELLO-FRAUD.pdf");
    const file = await fs.readFile(filePath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="HELLO-FRAUD.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    if (e?.code === "ENOENT") {
      return NextResponse.json({ error: "File not found. Place HELLO-FRAUD.pdf in /public" }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}


