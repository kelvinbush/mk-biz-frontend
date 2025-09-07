import { NextResponse } from "next/server";

export const revalidate = 0;
const API_KEY = "SM161F4dmQvLYTYuH43gZl";
const API_URL =
  "https://lending.presta.co.ke/zohointegration/api/v1/quotation/generate?tenantId=t25219";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("Request Body:", body);

    if (
      !body.customerRefId ||
      !body.loanProductRefId ||
      !body.amount ||
      !body.period ||
      !body.periodUnits
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const myHeaders = new Headers();
    myHeaders.append("api-key", API_KEY);
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        customerRefId: body.customerRefId,
        loanProductRefId: body.loanProductRefId,
        amount: body.amount,
        period: body.period,
        periodUnits: body.periodUnits,
      }),
    };

    const response = await fetch(API_URL, requestOptions);

    if (!response.ok) {
      const responseText = await response.text();
      console.log("Error Response Body:", responseText);

      return NextResponse.json(
        {
          error: "Failed to generate loan quotation",
          status: response.status,
          statusText: response.statusText,
          responseBody: responseText.substring(0, 500), // Limit the size for logging
        },
        { status: response.status || 500 },
      );
    }

    try {
      const data = await response.json();

      console.log("Original loan quotation API response here:", data);

      return NextResponse.json(data);
    } catch (jsonError) {
      console.error("Error parsing JSON response:", jsonError);

      const responseText = await response.text();
      console.log("JSON Parse Error - Response Body:", responseText);

      return NextResponse.json(
        { error: "Failed to parse API response" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error generating loan quotation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
