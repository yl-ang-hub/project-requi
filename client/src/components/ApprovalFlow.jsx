import React from "react";
import { FormDescription, FormLabel } from "./ui/form";
import { Input } from "./ui/input";

const ApprovalFlow = (props) => {
  const newPR = props.newPR || false;

  return (
    <div>
      <FormDescription>
        Approval flow is determined based on total cost in SGD. Please contact
        MMD for any clarifications.
      </FormDescription>
      <br />
      {newPR ? (
        <div className="my-1 grid grid-cols-3 gap-1">
          <FormLabel>Sequence</FormLabel>
          <FormLabel>Role</FormLabel>
          <FormLabel>Approver</FormLabel>
        </div>
      ) : (
        <div className="my-1 grid grid-cols-5 gap-1">
          <FormLabel>Sequence</FormLabel>
          <FormLabel>Role</FormLabel>
          <FormLabel>Approver</FormLabel>
          <FormLabel>Status</FormLabel>
          <FormLabel>Comments</FormLabel>
        </div>
      )}

      {props.data?.map((line, idx) => {
        return (
          <div key={idx}>
            {newPR ? (
              <div className="my-1 grid grid-cols-3 gap-1">
                <Input
                  disabled={true}
                  defaultValue={line.requisition_approval_sequence}
                />
                <Input disabled={true} defaultValue={line.approver_role} />
                <Input disabled={true} defaultValue={line.approver} />
              </div>
            ) : (
              <div className="my-1 grid grid-cols-5 gap-1">
                <Input
                  disabled={true}
                  defaultValue={line.requisition_approval_sequence}
                />
                <Input disabled={true} defaultValue={line.approver_role} />
                <Input disabled={true} defaultValue={line.approver} />
                <Input disabled={true} defaultValue={line.approval_status} />
                <Input disabled={true} defaultValue={line.approver_comments} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ApprovalFlow;
