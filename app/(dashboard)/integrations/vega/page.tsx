"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import {
  useGetUserQuery,
  useGetBusinessProfileByPersonalGuidQuery,
} from "@/lib/redux/services/user";

function VegaIntegrationInner() {
  const userGuid = useAppSelector(selectCurrentToken);

  const { data: userResp, isLoading: userLoading } = useGetUserQuery(
    { guid: userGuid || "" },
    { skip: !userGuid },
  );

  const { data: businessResp, isLoading: bizLoading } =
    useGetBusinessProfileByPersonalGuidQuery(
      { guid: userGuid || "" },
      { skip: !userGuid },
    );

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewPayload = useMemo(() => {
    const personal = userResp?.personal;
    const business = businessResp?.business;
    return {
      userId: personal?.guid || userGuid || "",
      userName:
        [personal?.firstName, personal?.lastName].filter(Boolean).join(" ") ||
        "",
      email: personal?.email || "",
      companyName: business?.businessName || "",
      companyId: business?.businessGuid || "",
      companyAddress:
        [business?.street1, business?.street2, business?.city]
          .filter(Boolean)
          .join(", ") || "",
      companyCountry: business?.country || "",
      companyRcNumber: "", // unknown in current model
      companyBusiness: business?.businessDescription || "",
      companyIndustry: business?.sector || "",
    };
  }, [userResp, businessResp, userGuid]);

  const canGenerate = useMemo(() => {
    return (
      !!previewPayload.userId &&
      !!previewPayload.userName &&
      !!previewPayload.email
    );
  }, [previewPayload]);

  const handleGenerate = useCallback(async () => {
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/vega-sso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(previewPayload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to generate SSO token");
      }
      const json = (await res.json()) as { url: string };
      if (json?.url) {
        window.location.href = json.url;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      }
      setError("Unexpected error");
    } finally {
      setGenerating(false);
    }
  }, [previewPayload]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Vega (Lawyered Up) Integration</h1>
      <p className="text-sm text-muted-foreground">
        Generate a signed SSO token and continue to Vega. Ensure server env
        variables <code>VEGA_API_KEY</code> and <code>VEGA_PRIVATE_KEY</code>
        are configured.
      </p>

      <div className="rounded-md border p-4">
        <h2 className="font-medium mb-2">SSO Payload Preview</h2>
        {(userLoading || bizLoading) && <div>Loading profile…</div>}
        {!userLoading && !bizLoading && (
          <pre className="text-xs overflow-auto max-h-64 bg-muted/30 p-3 rounded">
            {JSON.stringify(previewPayload, null, 2)}
          </pre>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm" role="alert">
          {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={!canGenerate || generating}
        className="inline-flex items-center px-4 py-2 rounded bg-black text-white disabled:opacity-50"
      >
        {generating ? "Generating…" : "Continue to Vega"}
      </button>

      {!canGenerate && (
        <p className="text-xs text-muted-foreground">
          Fill in missing user fields (name/email) before continuing.
        </p>
      )}
    </div>
  );
}

export default function VegaIntegrationPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <VegaIntegrationInner />
    </Suspense>
  );
}
