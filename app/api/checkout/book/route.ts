import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (!stripeSecretKey) {
  console.warn("STRIPE_SECRET_KEY is not set. Checkout will not work.");
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" })
  : (null as unknown as Stripe);

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const body = await req.json();
    const amount: number = body?.amount ?? 1000000; // default 10,000 NGN in kobo
    const currency: string = body?.currency ?? "ngn";
    const product = body?.product ?? {
      name: "HELLO FRAUD: Why you feel like an imposter in tech and how to fix it",
      description:
        "A practical guide to overcoming imposter syndrome in tech—identify triggers, reframe self‑doubt, and apply evidence‑based habits to build confidence.",
      image: "/BOOK.png",
    };

    const envBase = siteUrl?.trim();
    const originHeader = req.headers.get("origin") ?? undefined;
    const fProto = req.headers.get("x-forwarded-proto") ?? undefined;
    const fHost = req.headers.get("x-forwarded-host") ?? undefined;
    const forwardedOrigin = fProto && fHost ? `${fProto}://${fHost}` : undefined;
    const nextOrigin = req.nextUrl?.origin ?? undefined;
    const baseUrl = (envBase && /^https?:\/\//i.test(envBase)
      ? envBase
      : originHeader || forwardedOrigin || nextOrigin || "http://localhost:3000").replace(/\/$/, "");

    const successUrl = `${baseUrl}/my-book?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/my-book?canceled=true`;

    const absoluteImage = product.image?.startsWith("http")
      ? product.image
      : `${baseUrl}${product.image?.startsWith("/") ? product.image : `/${product.image}`}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: amount,
            product_data: {
              name: product.name,
              description: product.description,
              images: absoluteImage ? [absoluteImage] : undefined,
            },
          },
          quantity: 1,
        },
      ],
      payment_method_types: ["card"],
      allow_promotion_codes: false,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}


