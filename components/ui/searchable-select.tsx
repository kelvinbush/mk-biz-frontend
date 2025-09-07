import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronDown } from "lucide-react";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Control, useController } from "react-hook-form";

interface SearchableSelectProps {
  name: string;
  label: string;
  notFound: string;
  options: { label: string; value: string }[];
  placeholder: string;
  required?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  className?: string;
  labelClassName?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  name,
  label,
  notFound,
  options,
  placeholder,
  required = false,
  control,
  className,
  labelClassName,
}) => {
  const { field } = useController({ name, control });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FormItem className={cn(className, "flex flex-col w-full")}>
      <FormLabel className={labelClassName} required={required}>
        {label}
      </FormLabel>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              className={cn("w-full justify-between pl-3 font-normal h-10")}
              onClick={() => setIsOpen(!isOpen)}
            >
              {field.value
                ? options.find((opt) => opt.value === field.value)?.label
                : placeholder}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>{notFound}</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    value={opt.label}
                    key={opt.value}
                    onSelect={() => {
                      field.onChange(opt.value);
                      setIsOpen(false); // Close the popover
                    }}
                  >
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
};
