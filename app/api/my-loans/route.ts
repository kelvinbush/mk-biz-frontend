// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // Get customerRefId from the URL query parameters
    const { searchParams } = new URL(request.url);
    const customerRefId = searchParams.get("customerRefId");

    // Return error if customerRefId is not provided
    if (!customerRefId) {
      return NextResponse.json(
        { error: "Customer reference is required" },
        { status: 400 },
      );
    }

    const myHeaders = new Headers();
    myHeaders.append("api-key", "SM161F4dmQvLYTYuH43gZl");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow" as RequestRedirect,
    };

    // Call the Presta API to get customer loans
    const response = await fetch(
      `https://lending.presta.co.ke/zohointegration/api/v1/loans?customerRefId=${customerRefId}&tenantId=t25219`,
      requestOptions,
    );

    if (!response.ok) {
      console.log(response);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Log the original response on the server side
    console.log("Customer loans API response:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching customer loans:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer loans" },
      { status: 500 },
    );
  }
}
