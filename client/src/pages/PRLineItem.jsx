import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRLineItem = (props) => {
  const [itemDisabled, setItemDisabled] = useState(false);

  const form = props.form;

  return (
    <div className="my-1 grid grid-cols-6 gap-1" key={props.item.id}>
      <FormField
        control={form.control}
        name={`items.${props.idx}.itemName`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                placeholder="item name"
                disabled={itemDisabled}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`items.${props.idx}.itemDescription`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                placeholder="description"
                disabled={itemDisabled}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`items.${props.idx}.quantity`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input disabled={itemDisabled} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`items.${props.idx}.unitOfMeasure`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input disabled={itemDisabled} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`items.${props.idx}.unitCost`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                disabled={itemDisabled}
                {...field}
                // TODO: Display total amount for PR
                // onChange={(event) => {
                //   field.value = event.target.value;
                //   totalAmount = parseFloat(event.target.value);
                // }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button
        type="button"
        onClick={() => props.itemsFormArray.remove(props.idx)}>
        Delete
      </Button>
    </div>
  );
};

export default PRLineItem;
