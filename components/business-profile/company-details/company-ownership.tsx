"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  shareholderType: z.string().min(1, "Shareholder type is required"),
});

interface Owner {
  id: string;
  name: string;
  type: string;
}

type IProps = React.HTMLAttributes<HTMLDivElement>

export default function ComapnyOwnershipDetails({
                                                  className,
                                                  ...props
                                                }: IProps) {
  const [owners, setOwners] = useState<Owner[]>([
    { id: "1", name: "John Doe", type: "Individual" },
    {
      id: "2",
      name: "ABC Limited",
      type: "Company",
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      shareholderType: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newOwner = {
      id: Math.random().toString(36).substr(2, 9),
      name: values.fullName,
      type: values.shareholderType,
    };
    setOwners([...owners, newOwner]);
    setIsOpen(false);
    form.reset();
  }

  const deleteOwner = (id: string) => {
    setOwners(owners.filter((owner) => owner.id !== id));
  };

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="mb-8 flex items-center gap-8 text-2xl font-medium">
        <h2 className="shrink-0">Ownership Details</h2>
        <div className="h-[1.5px] w-full bg-gray-400" />
      </div>

      <ScrollArea className="h-[calc(100vh-22rem)] max-w-4xl overflow-y-auto pr-4">
        <div className="space-y-4">
          {owners.map((owner) => (
            <div key={owner.id} className="flex gap-4">
              <Input value={owner.name} readOnly className="flex-1" />
              <Select defaultValue={owner.type} disabled>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => deleteOwner(owner.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-16 w-full gap-2 border-dashed"
              >
                <Plus className="h-4 w-4" />
                Add a beneficial owner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>Add beneficial owner</DialogTitle>
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogClose>
                </div>
                <DialogDescription>
                  Provide the details of the company&apos;s beneficial owners
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid gap-4 py-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Full name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter full name" {...field} />
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
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select shareholder type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Individual">
                                Individual
                              </SelectItem>
                              <SelectItem value="Company">Company</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </ScrollArea>

      <footer className="sticky bottom-0 border-t bg-white p-4">
        <div className="flex max-w-4xl justify-end">
          <Button>Save Changes</Button>
        </div>
      </footer>
    </div>
  );
}
