// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import {
  useGetUserQuery,
  useUpdateUserProfileMutation,
  useUploadPersonalDocumentMutation,
} from "@/lib/redux/services/user";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UploadField } from "./upload-field";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

const VerifyIdentitySchema = z
  .object({
    documentType: z.enum(["passport", "identity_card"]),
    identificationNumber: z
      .string()
      .min(1, "Identification number is required")
      .max(10, "Max. 10 characters"),
    taxIdentificationNumber: z
      .string()
      .min(1, "Tax identification number is required")
      .max(20, "Max. 20 characters"),
    frontIdImage: z.string().optional(),
    backIdImage: z.string().optional(),
    taxRegistrationCertificate: z
      .string()
      .min(1, "Tax registration certificate is required"),
    passportPhoto: z.string().optional(),
    passportBioPage: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.documentType === "passport") {
      if (!data.passportBioPage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passport bio page is required",
          path: ["passportBioPage"],
        });
      }
    } else if (data.documentType === "identity_card") {
      if (!data.frontIdImage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Front ID image is required",
          path: ["frontIdImage"],
        });
      }
      if (!data.backIdImage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Back ID image is required",
          path: ["backIdImage"],
        });
      }
    }
  });

type TVerifyIdentity = z.infer<typeof VerifyIdentitySchema>;

export default function VerifyIdentityForm() {
  const router = useRouter();
  const guid = useAppSelector(selectCurrentToken);
  const [uploadPersonalDocs] = useUploadPersonalDocumentMutation();
  const [updateUser] = useUpdateUserProfileMutation();

  const { data: user, isLoading: userIsLoading } = useGetUserQuery({
    guid: guid!,
  });

  const form = useForm<TVerifyIdentity>({
    resolver: zodResolver(VerifyIdentitySchema),
    defaultValues: {
      documentType: "identity_card",
      identificationNumber: "",
      taxIdentificationNumber: "",
      frontIdImage: "",
      backIdImage: "",
      taxRegistrationCertificate: "",
      passportPhoto: "",
      passportBioPage: "",
    },
    mode: "onChange",
  });

  const {
    formState: { isValid },
  } = form;

  useEffect(() => {
    if (user) {
      if (user.personal) {
        const { identityDocType, identityDocNumber, taxIdNumber } =
          user.personal;
        if (
          identityDocNumber !== "" ||
          identityDocType !== "" ||
          taxIdNumber !== ""
        ) {
          // router.push("/onboarding-checklist");
        }
      }
    }
  }, [router, user]);

  const handleDocumentUpload = async (path: string, docType: number) => {
    if (!guid) return;
    try {
      await uploadPersonalDocs({
        personalGuid: guid,
        path,
        docType,
      }).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateUserProfile = async (
    docType: string,
    docNumber: string,
    tax: string,
  ) => {
    if (!guid) return;
    try {
      await updateUser({
        profile: {
          ...user.personal,
          identityDocType: docType,
          identityDocNumber: docNumber,
          taxIdNumber: tax,
        },
        guid: guid!,
      }).unwrap();
    } catch (e) {
      throw e;
    }
  };

  const onSubmit = async (data: TVerifyIdentity) => {
    try {
      // Upload tax registration certificate first
      if (data.taxRegistrationCertificate) {
        await handleDocumentUpload(data.taxRegistrationCertificate, 3); // TaxComplaintDocument
      }

      if (data.documentType === "identity_card") {
        // Upload front ID image
        if (data.frontIdImage) {
          await handleDocumentUpload(data.frontIdImage, 0); // NationalIdFront
        }

        // Upload back ID image
        if (data.backIdImage) {
          await handleDocumentUpload(data.backIdImage, 1); // NationalIdBack
        }
      } else if (data.documentType === "passport") {
        // Upload passport bio page
        if (data.passportBioPage) {
          await handleDocumentUpload(data.passportBioPage, 2); // Passport
        }
      }
      // Upload passport photo
      if (data.passportPhoto) {
        await handleDocumentUpload(data.passportPhoto, 4); // PassportPhoto
      }

      await handleUpdateUserProfile(
        data.documentType,
        data.identificationNumber,
        data.taxIdentificationNumber,
      );

      router.push("/onboarding-checklist");
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Failed to upload documents. Please try again.");
    }
  };

  if (userIsLoading) {
    return (
      <div className="space-y-4 p-4 md:p-6 h-full flex flex-col justify-center">
        <div className="mb-4 md:mb-6 space-y-2 md:space-y-4">
          <p className="text-sm font-medium uppercase text-primary-green">
            Step 3/3
          </p>
          <h1 className="text-2xl md:text-4xl font-bold">
            Verify your identity
          </h1>
          <p className="text-lg md:text-2xl text-midnight-blue">
            Provide the necessary identification details for{" "}
            <span className="text-pink-500">verification </span>
            purposes
          </p>
        </div>
        <div className={"grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"}>
          <Skeleton className="h-12 md:h-16 w-full" />
          <Skeleton className="h-12 md:h-16 w-full" />
          <Skeleton className="h-12 md:h-16 w-full" />
          <Skeleton className="h-12 md:h-16 w-full" />
          <Skeleton className="h-12 md:h-16 w-full" />
          <Skeleton className="h-12 md:h-16 w-full" />
        </div>
      </div>
    );
  }

  const documentType = form.watch("documentType");

  return (
    <div className="flex items-center justify-center">
      <div className="w-full rounded-lg bg-white">
        <div className="mb-4 md:mb-6 space-y-2 md:space-y-4 px-4 md:px-8">
          <p className="text-sm font-medium uppercase text-primary-green">
            Step 3/3
          </p>
          <h1 className="text-2xl md:text-4xl font-bold">
            Verify your identity
          </h1>
          <p className="text-lg md:text-2xl text-midnight-blue">
            Provide the necessary identification details for{" "}
            <span className="text-pink-500">verification </span>
            purposes
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[50svh] md:h-[60svh] w-full">
              <div className="space-y-4 p-4 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="documentType"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel className="text-sm md:text-base" required>
                          Document type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 md:h-12">
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="identity_card">
                              Identity Card
                            </SelectItem>
                            <SelectItem value="passport">Passport</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="identificationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base" required>
                          {documentType === "passport"
                            ? "Passport number"
                            : "Identification number"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              documentType === "passport"
                                ? "Enter passport number"
                                : "Enter ID number"
                            }
                            {...field}
                            className="h-11 md:h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="taxIdentificationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base" required>
                          Tax identification number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter tax identification number"
                            {...field}
                            className="h-11 md:h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {documentType === "passport" ? (
                    <FormField
                      control={form.control}
                      name="passportBioPage"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-2">
                          <FormLabel className="text-sm md:text-base" required>
                            Upload passport bio page
                          </FormLabel>
                          <FormControl>
                            <UploadField
                              onChange={field.onChange}
                              value={field.value}
                              accept="image/*,.pdf"
                              maxSize={2 * 1024 * 1024} // 2MB
                              type="passport"
                              supportingText="Supported formats: PNG, JPG, JPEG or PDF. Max. File Size: 2MB"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <>
                      <FormField
                        control={form.control}
                        name="frontIdImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              className="text-sm md:text-base"
                              required
                            >
                              Upload front ID image
                            </FormLabel>
                            <FormControl>
                              <UploadField
                                onChange={field.onChange}
                                value={field.value}
                                accept="image/*,.pdf"
                                maxSize={2 * 1024 * 1024} // 2MB
                                type="identity"
                                supportingText="Supported formats: PNG, JPG, JPEG or PDF. Max. File Size: 2MB"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="backIdImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              className="text-sm md:text-base"
                              required
                            >
                              Upload back ID image
                            </FormLabel>
                            <FormControl>
                              <UploadField
                                onChange={field.onChange}
                                value={field.value}
                                accept="image/*,.pdf"
                                maxSize={2 * 1024 * 1024} // 2MB
                                type="identity"
                                supportingText="Supported formats: PNG, JPG, JPEG or PDF. Max. File Size: 2MB"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  <FormField
                    control={form.control}
                    name="taxRegistrationCertificate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base" required>
                          Upload your personal tax certificate
                        </FormLabel>
                        <FormControl>
                          <UploadField
                            onChange={field.onChange}
                            value={field.value}
                            accept=".pdf,image/*"
                            maxSize={5 * 1024 * 1024} // 5MB
                            type="tax"
                            supportingText="Supported formats: PNG, JPG, JPEG or PDF. Max. File Size: 2MB"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="passportPhoto"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="text-sm md:text-base">
                          Upload your passport photo
                        </FormLabel>
                        <FormControl>
                          <UploadField
                            onChange={field.onChange}
                            value={field.value}
                            accept="image/*,.pdf"
                            maxSize={2 * 1024 * 1024} // 2MB
                            type="passport"
                            supportingText="Supported formats: PNG, JPG, JPEG or PDF. Max. File Size: 2MB"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </ScrollArea>
            <div className="px-4 md:px-8 py-4">
              <Button
                type="submit"
                className="w-full h-12 md:h-14 text-base"
                disabled={!isValid}
              >
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
