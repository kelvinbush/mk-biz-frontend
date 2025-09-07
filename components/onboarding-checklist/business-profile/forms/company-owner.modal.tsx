import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { X } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Company name is required" }),
  shareholderType: z
    .string()
    .min(1, { message: "Shareholder type is required" }),
  ownershipPercentage: z
    .string()
    .min(1, { message: "Ownership percentage is required" })
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Please enter a valid percentage" }),
  ownershipType: z.string().min(1, { message: "Ownership type is required" }),
  registrationProof: z
    .any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, "Max file size is 5MB")
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
      "Only .pdf, .jpg, and .png files are accepted",
    ),
  additionalDocuments: z
    .any()
    .optional()
    .nullable()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      "Max file size is 5MB",
    )
    .refine(
      (file) => !file || ACCEPTED_FILE_TYPES.includes(file?.type),
      "Only .pdf, .jpg, and .png files are accepted",
    ),
  taxRegistrationCert: z
    .any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, "Max file size is 5MB")
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
      "Only .pdf, .jpg, and .png files are accepted",
    ),
  taxClearanceCert: z
    .any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, "Max file size is 5MB")
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
      "Only .pdf, .jpg, and .png files are accepted",
    ),
});

export default function CompanyOwnerModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      shareholderType: "company",
      ownershipPercentage: "",
      ownershipType: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Beneficial Owner</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                Add beneficial owner
              </DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Provide the details of the company&apos;s beneficial owners
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-md"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Full name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="ABC Limited" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shareholderType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Shareholder type{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="trust">Trust</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <h3 className="text-lg font-medium">Basic information</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="ownershipPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Ownership shareholding{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter the percentage of company shares owned"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ownershipType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Ownership type{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ownership type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="direct">Direct</SelectItem>
                          <SelectItem value="indirect">Indirect</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Proof of registration</h3>
              <div className="mt-4 space-y-4">
                <FormField
                  control={form.control}
                  name="registrationProof"
                  render={({ field: { onChange, value } }) => (
                    <FormItem>
                      <FormLabel>
                        Upload the company&apos;s proof of registration{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormDescription>
                        Business Name Registration Certificate or Certificate of
                        Incorporation
                      </FormDescription>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="secondary"
                            className="w-[120px]"
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = ACCEPTED_FILE_TYPES.join(",");
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement)
                                  .files?.[0];
                                onChange(file);
                              };
                              input.click();
                            }}
                          >
                            Choose file
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            {value?.name || "No file chosen"}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalDocuments"
                  render={({ field: { onChange, value } }) => (
                    <FormItem>
                      <FormLabel>Any other documents (optional)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="secondary"
                            className="w-[120px]"
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = ACCEPTED_FILE_TYPES.join(",");
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement)
                                  .files?.[0];
                                onChange(file);
                              };
                              input.click();
                            }}
                          >
                            Choose file
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            {value?.name || "No file chosen"}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Tax compliance documents</h3>
              <div className="mt-4 space-y-4">
                <FormField
                  control={form.control}
                  name="taxRegistrationCert"
                  render={({ field: { onChange, value } }) => (
                    <FormItem>
                      <FormLabel>
                        Tax registration certificate{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="secondary"
                            className="w-[120px]"
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = ACCEPTED_FILE_TYPES.join(",");
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement)
                                  .files?.[0];
                                onChange(file);
                              };
                              input.click();
                            }}
                          >
                            Choose file
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            {value?.name || "No file chosen"}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxClearanceCert"
                  render={({ field: { onChange, value } }) => (
                    <FormItem>
                      <FormLabel>
                        Tax clearance certificate{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="secondary"
                            className="w-[120px]"
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = ACCEPTED_FILE_TYPES.join(",");
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement)
                                  .files?.[0];
                                onChange(file);
                              };
                              input.click();
                            }}
                          >
                            Choose file
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            {value?.name || "No file chosen"}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
