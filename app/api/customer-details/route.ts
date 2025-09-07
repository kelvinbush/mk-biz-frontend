// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Use hardcoded refId as requested
    const refId = "tspcoxfKZBqgX1V5";

    const myHeaders = new Headers();
    myHeaders.append("api-key", "SM161F4dmQvLYTYuH43gZl");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow" as RequestRedirect,
    };

    // Call the Presta API to get specific loan details
    const response = await fetch(
      `https://lending.presta.co.ke/zohointegration/api/v1/loans/${refId}?tenantId=t25219`,
      requestOptions,
    );

    if (!response.ok) {
      console.log(response);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Log the original response on the server side
    console.log("Loan details API response:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching loan details:", error);
    return NextResponse.json(
      { error: "Failed to fetch loan details" },
      { status: 500 },
    );
  }
}
