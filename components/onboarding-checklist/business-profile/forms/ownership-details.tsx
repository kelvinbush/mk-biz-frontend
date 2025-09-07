import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, Pencil, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

const ownerSchema = z.object({
  isBeneficialOwner: z.enum(["yes", "no"], {
    required_error: "Please select whether you are a beneficial owner",
  }),
  otherOwners: z
    .array(
      z.object({
        name: z
          .string()
          .min(2, { message: "Name must be at least 2 characters" }),
        type: z.string().min(1, { message: "Please select an owner type" }),
      }),
    )
    .optional(),
});

export default function OwnershipDetails({ onNext }: { onNext: () => void }) {
  const [, setIsOwnerOpen] = useState(false);
  const form = useForm<z.infer<typeof ownerSchema>>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      isBeneficialOwner: undefined,
      otherOwners: [{ name: "John Doe", type: "individual" }],
    },
  });

  function onSubmit(values: z.infer<typeof ownerSchema>) {
    console.log(values);
    onNext();
  }

  const addOwner = () => {
    const currentOwners = form.getValues("otherOwners") || [];
    form.setValue("otherOwners", [...currentOwners, { name: "", type: "" }]);
  };

  const removeOwner = (index: number) => {
    const currentOwners = form.getValues("otherOwners") || [];
    form.setValue(
      "otherOwners",
      currentOwners.filter((_, i) => i !== index),
    );
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="isBeneficialOwner"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="flex items-center gap-2">
                  Are you a beneficial owner of the company?
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          A beneficial owner is a legal person who owns more
                          than 25% of the capital or voting rights of a company,
                          or has control over its management.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="yes" />
                      </FormControl>
                      <FormLabel className="font-normal">Yes, I am</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="no" />
                      </FormControl>
                      <FormLabel className="font-normal">No, I&apos;m not</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormLabel className="flex items-center gap-2">
              Are there any other beneficial owners of the company?
            </FormLabel>
            <FormDescription>
              Ensure the information provided aligns with your financial
              statements or any other documents mentioning your beneficial
              owners.
            </FormDescription>

            {form.watch("otherOwners")?.map((_owner, index) => (
              <Card key={index}>
                <CardContent className="flex gap-2 pt-6">
                  <FormField
                    control={form.control}
                    name={`otherOwners.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`otherOwners.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="individual">
                              Individual
                            </SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                            <SelectItem value="trust">Trust</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsOwnerOpen(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeOwner(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={addOwner}
            >
              Add a beneficial owner
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
