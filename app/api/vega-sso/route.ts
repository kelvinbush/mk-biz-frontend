import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Helper to base64url-encode a string or Buffer
function base64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

// Create an RS256-signed JWT using Node crypto
function signJwtRS256(payload: Record<string, unknown>, privateKeyPem: string) {
  const header = { alg: "RS256", typ: "JWT" };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  // Build a KeyObject from PEM; supports PKCS#1 (RSA PRIVATE KEY) and PKCS#8 (PRIVATE KEY)
  let keyObject: crypto.KeyObject;
  try {
    keyObject = crypto.createPrivateKey({
      key: privateKeyPem,
      format: "pem",
    });
  } catch (e) {
    console.error(e);
    // Provide a clearer error for troubleshooting key formatting
    throw new Error(
      "Failed to parse VEGA_PRIVATE_KEY. Ensure it is a valid RSA private key PEM (PKCS#1 or PKCS#8).",
    );
  }

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(data);
  signer.end();
  const signature = signer.sign(keyObject);
  const encodedSignature = base64url(signature);
  return `${data}.${encodedSignature}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Expect the body to contain the SSO payload fields already mapped on the client
    const {
      userId,
      userName,
      email,
      companyName,
      companyId,
      companyAddress,
      companyCountry,
      companyRcNumber,
      companyBusiness,
      companyIndustry,
    } = body || {};

    if (!userId || !userName || !email) {
      return NextResponse.json(
        { error: "Missing required user fields (userId, userName, email)" },
        { status: 400 },
      );
    }

    // Read and sanitize env configuration
    const apiKey = process.env.VEGA_API_KEY?.trim();
    let privateKey = process.env.VEGA_PRIVATE_KEY;
    // Normalize escaped newlines and strip surrounding quotes if present
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, "\n").replace(/^"|"$/g, "");
    }

    if (!apiKey || !privateKey) {
      return NextResponse.json(
        {
          error:
            "Server not configured. Set VEGA_API_KEY and VEGA_PRIVATE_KEY env vars.",
        },
        { status: 500 },
      );
    }

    // Construct JWT payload as specified by Vega docs
    const payload = {
      userId: String(userId),
      userName: String(userName),
      email: String(email),
      companyName: companyName ? String(companyName) : "",
      companyId: companyId ? String(companyId) : "",
      companyAddress: companyAddress ? String(companyAddress) : "",
      companyCountry: companyCountry ? String(companyCountry) : "",
      companyRcNumber: companyRcNumber ? String(companyRcNumber) : "",
      companyBusiness: companyBusiness ? String(companyBusiness) : "",
      companyIndustry: companyIndustry ? String(companyIndustry) : "",
      // Optional standard claims (iat/exp) if desired by vendor; keeping minimal unless requested
    };

    const token = signJwtRS256(payload, privateKey);

    const redirectUrl = `https://app.lawyeredapp.com/partners?apiKey=${encodeURIComponent(
      apiKey,
    )}&token=${encodeURIComponent(token)}`;

    return NextResponse.json({ url: redirectUrl, token });
  } catch (err) {
    console.error("/api/vega-sso error", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
