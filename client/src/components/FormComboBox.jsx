import React, { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const FormComboBox = (props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    props.clearForm ? setValue("") : "";
  });

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between">
            {value
              ? props.data.find((item) => item.value === value)?.label
              : "Select"}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search" className="h-9" />
            <CommandList>
              <CommandEmpty>Not found.</CommandEmpty>
              <CommandGroup>
                {props.data.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={(currentValue) => {
                      setValue((prevState) =>
                        currentValue === value ? "" : currentValue
                      );
                      props.setFormValue(
                        props.field.name,
                        currentValue === value ? "" : currentValue
                      );
                      setOpen(false);
                    }}>
                    {item.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default FormComboBox;
