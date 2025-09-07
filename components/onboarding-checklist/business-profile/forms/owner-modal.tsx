"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  shareholderType: z
    .string()
    .min(1, { message: "Shareholder type is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phoneNumber: z.string().min(10, { message: "Phone number is required" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  ownershipPercentage: z
    .string()
    .min(1, { message: "Ownership percentage is required" }),
  ownershipType: z.string().min(1, { message: "Ownership type is required" }),
  documentType: z.string().min(1, { message: "Document type is required" }),
  identificationNumber: z
    .string()
    .min(1, { message: "Identification number is required" }),
  taxIdentificationNumber: z
    .string()
    .min(1, { message: "Tax identification number is required" }),
  frontIdImage: z.any(),
  backIdImage: z.any(),
});

interface OwnerModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function OwnerModal({ open, setOpen }: OwnerModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      shareholderType: "",
      email: "",
      phoneNumber: "",
      gender: "",
      ownershipPercentage: "",
      ownershipType: "",
      documentType: "",
      identificationNumber: "",
      taxIdentificationNumber: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                      <Input placeholder="John Doe" {...field} />
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
                          <SelectValue placeholder="Individual" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="trust">Trust</SelectItem>
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone number <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex">
                          <Select defaultValue="+254">
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="+254" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="+254">🇰🇪 +254</SelectItem>
                              <SelectItem value="+1">🇺🇸 +1</SelectItem>
                              <SelectItem value="+44">🇬🇧 +44</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            className="ml-2 flex-1"
                            placeholder="712345678"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Gender <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Date of birth{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? format(field.value, "PPP")
                                : "Enter date of birth"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              <h3 className="text-lg font-medium">Verification documents</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>
                        Document type{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Identity Card" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="id">Identity Card</SelectItem>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="driving">
                            Driving License
                          </SelectItem>
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
                      <FormLabel>
                        Identification number{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter ID number" {...field} />
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
                      <FormLabel>
                        Tax identification number{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter tax identification number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="frontIdImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Upload front ID image{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="cursor-pointer rounded-lg border-2 border-dashed p-4 hover:bg-muted/50">
                          <Input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) =>
                              field.onChange(e.target.files?.[0])
                            }
                          />
                          <div className="text-center text-sm text-muted-foreground">
                            Click or drag and drop to upload
                          </div>
                        </div>
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
                      <FormLabel>
                        Upload back ID image{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="cursor-pointer rounded-lg border-2 border-dashed p-4 hover:bg-muted/50">
                          <Input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) =>
                              field.onChange(e.target.files?.[0])
                            }
                          />
                          <div className="text-center text-sm text-muted-foreground">
                            Click or drag and drop to upload
                          </div>
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
