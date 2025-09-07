"use client";

import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Copy, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";

const formSchema = z.object({
  invitationLink: z.string().url(),
  members: z.array(
    z.object({
      fullName: z.string().min(1, "Full name is required"),
      emailAddress: z.string().email("Invalid email address"),
    }),
  ),
});

export default function InviteTeamMember({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invitationLink: "https://melaninkapital.com/invite/accept",
      members: [{ fullName: "", emailAddress: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Here you would typically send the invitations
    setIsOpen(false);
  }

  const copyLink = () => {
    navigator.clipboard.writeText(form.getValues("invitationLink"));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="p-10 sm:max-w-5xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className={"text-4xl"}>Invite team member</DialogTitle>
          <DialogDescription className={"text-2xl"}>
            Add your team members to help complete your onboarding checklist
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={"mt-2"}>
            <FormField
              control={form.control}
              name="invitationLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Share an invitation link</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        className={"border-2 border-dashed border-gray-300"}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      size="icon"
                      className="flex w-max gap-2 px-4 text-white"
                      onClick={copyLink}
                    >
                      <Copy className="h-4 w-4" />
                      Copy link
                    </Button>
                  </div>
                </FormItem>
              )}
            />
            <div className="relative my-12">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
            <div className={"space-y-4"}>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-2 gap-x-4">
                  <FormField
                    control={form.control}
                    name={`members.${index}.fullName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Full name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className={"flex items-end gap-x-2"}>
                    <FormField
                      control={form.control}
                      name={`members.${index}.emailAddress`}
                      render={({ field }) => (
                        <FormItem className={"flex-1"}>
                          <FormLabel required>Email address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter email address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="-ml-3.5 mt-2"
              onClick={() => append({ fullName: "", emailAddress: "" })}
            >
              <Icons.plusIcon className="mr-2 h-4 w-4" /> Add another member
            </Button>
            <Separator className={"my-8"} />
            <div className="flex justify-end space-x-6">
              <Button
                type="button"
                variant="outline"
                size={"lg"}
                className={"border-midnight-blue"}
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size={"lg"}
                type="submit"
                className="bg-primary-green text-white hover:bg-green-600"
              >
                Send Invite
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
