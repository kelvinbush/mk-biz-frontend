import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import { userApiSlice } from "@/lib/redux/services/user";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import { Loader2 } from "lucide-react";
import { BusinessDocument, DocType } from "@/lib/types/user";
import { CompanyRegistrationForm } from "./company-registration-form";
import { PartnershipRegistrationForm } from "./partnership-registration-form";
import SolePropRegistrationForm from "./sole-prop-registration-form";

type ProofRegistrationProps = {
  onNext: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
};

const ProofRegistration = ({
  onNext,
  onLoadingChange,
}: ProofRegistrationProps) => {
  const [existingDocuments, setExistingDocuments] = useState<
    BusinessDocument[]
  >([]);

  const personalGuid = useAppSelector(selectCurrentToken);

  const { data: businessProfile, isLoading: isLoadingProfile } =
    userApiSlice.useGetBusinessProfileByPersonalGuidQuery(
      { guid: personalGuid || "" },
      { skip: !personalGuid },
    );

  const { data: documentResponse, isLoading: isLoadingDocuments } =
    userApiSlice.useGetBusinessDocumentsQuery(
      {
        businessGuid: businessProfile?.business?.businessGuid || "",
      },
      { skip: !businessProfile?.business?.businessGuid },
    );

  useEffect(() => {
    if (!documentResponse?.documents?.length) return;

    const relevantDocs = documentResponse.documents.filter(
      (doc) =>
        doc.docType === DocType.BusinessRegistration ||
        doc.docType === DocType.CertificateOfIncorporation ||
        doc.docType === DocType.MemorandumOfAssociation ||
        doc.docType === DocType.ArticlesOfAssociation ||
        doc.docType === DocType.PartnershipDeed ||
        doc.docType === DocType.TaxRegistrationDocument ||
        doc.docType === DocType.TaxClearanceDocument,
    );

    setExistingDocuments(relevantDocs);
  }, [documentResponse?.documents]);

  const onHelpClick = (text: string) => {
    console.log("text", text);
    const SUPPORT_EMAIL = "support@melaninkapital.com";
    window.location.href = `mailto:${SUPPORT_EMAIL}`;
  };

  const renderForm = () => {
    const commonProps = {
      onNext,
      businessGuid: businessProfile?.business?.businessGuid || "",
      existingDocuments,
      onLoadingChange,
      onHelpClick,
    };

    switch (businessProfile?.business?.typeOfIncorporation?.toLowerCase()) {
      case "private-limited-company":
      case "public-limited-company":
      case "limited-liability-company-llc":
      case "s-corporation":
      case "c-corporation":
        return <CompanyRegistrationForm {...commonProps} />;
      case "general-partnership":
      case "limited-liability-partnership-llp":
        return <PartnershipRegistrationForm {...commonProps} />;
      case "sole-proprietorship":
        return <SolePropRegistrationForm {...commonProps} />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-red-500">
              Unsupported business type:{" "}
              {businessProfile?.business?.typeOfIncorporation}
            </p>
          </div>
        );
    }
  };

  if (isLoadingProfile || isLoadingDocuments) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary-green" />
      </div>
    );
  }

  if (!businessProfile) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load business profile</p>
      </div>
    );
  }

  return <div className="mx-auto">{renderForm()}</div>;
};

export default ProofRegistration;
