import React, { useEffect, useState } from "react";
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
  const form = props.form;
  const readOnly = props.readOnly || false;

  return (
    <div className="my-1 grid grid-cols-6 gap-1" key={props.item.id}>
      <FormField
        control={form.control}
        name={`items.${props.idx}.name`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                placeholder="item name"
                disabled={props.disabled}
                {...field}
                readOnly={readOnly}
                className="border-gray-300 bg-white text-black px-2 py-1 read-only:bg-gray-100 read-only:text-gray-700"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`items.${props.idx}.description`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                placeholder="description"
                disabled={props.disabled}
                {...field}
                readOnly={readOnly}
                className="border-gray-300 bg-white text-black px-2 py-1 read-only:bg-gray-100 read-only:text-gray-700"
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
              <Input
                disabled={props.disabled}
                {...field}
                readOnly={readOnly}
                className="border-gray-300 bg-white text-black px-2 py-1 read-only:bg-gray-100 read-only:text-gray-700"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`items.${props.idx}.unit_of_measure`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                disabled={props.disabled}
                {...field}
                readOnly={readOnly}
                className="border-gray-300 bg-white text-black px-2 py-1 read-only:bg-gray-100 read-only:text-gray-700"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`items.${props.idx}.unit_cost`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                disabled={props.disabled}
                {...field}
                readOnly={readOnly}
                className="border-gray-300 bg-white text-black px-2 py-1 read-only:bg-gray-100 read-only:text-gray-700"
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
