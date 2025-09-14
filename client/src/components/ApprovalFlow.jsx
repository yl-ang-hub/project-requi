import React from "react";
import { FormDescription, FormLabel } from "./ui/form";
import { Input } from "./ui/input";

const ApprovalFlow = (props) => {
  return (
    <div>
      <FormDescription>
        Approval flow is determined based on total cost in SGD. Please contact
        MMD for any clarifications.
      </FormDescription>
      <br />
      <div className="my-1 grid grid-cols-5 gap-1">
        <FormLabel>No</FormLabel>
        <FormLabel>Role</FormLabel>
        <FormLabel>Approver</FormLabel>
      </div>

      {props.data?.map((line, idx) => {
        return (
          <div className="my-1 grid grid-cols-5 gap-1" key={idx}>
            <Input
              disabled={true}
              defaultValue={line.requisition_approval_sequence}
            />
            <Input disabled={true} defaultValue={line.approver_role} />
            <Input disabled={true} defaultValue={line.approver} />
          </div>
        );
      })}
    </div>
  );
};

export default ApprovalFlow;
