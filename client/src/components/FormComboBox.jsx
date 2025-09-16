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
  const [value, setValue] = useState(props.field.value);

  const readOnly = props.readOnly || false;

  useEffect(() => {
    props?.clearForm ? setValue("") : "";
  }, [props.clearForm]);

  useEffect(() => setValue(props.field.value || ""), [props.field.value]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            disabled={readOnly}
            readOnly={readOnly}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between enabled:bg-white read-only:bg-gray-200 read-only:cursor-grab read-only:select-text">
            {value !== ""
              ? props.data?.find((item) => item.includes(value))
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
                {props.data?.map((item) => (
                  <CommandItem
                    key={item}
                    value={item}
                    onSelect={(currentValue) => {
                      setValue(currentValue);
                      props.setFormValue(props.field.name, currentValue);
                      setOpen(false);
                    }}>
                    {item}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === item ? "opacity-100" : "opacity-0"
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
