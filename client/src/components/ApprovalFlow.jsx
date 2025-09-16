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

      {props.data === undefined && (
        <div className="my-1 grid grid-cols-5 gap-1">
          <Input
            readOnly={true}
            className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
            defaultValue={""}
          />
          <Input
            readOnly={true}
            className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
            defaultValue={""}
          />
          <Input
            readOnly={true}
            className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
            defaultValue={""}
          />
          <Input
            readOnly={true}
            className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
            defaultValue={""}
          />
          <Input
            readOnly={true}
            className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
            defaultValue={""}
          />
        </div>
      )}

      {props.data?.map((line, idx) => {
        return (
          <div key={idx}>
            {newPR ? (
              <div className="my-1 grid grid-cols-3 gap-1">
                <Input
                  readOnly={true}
                  className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                  defaultValue={line.requisition_approval_sequence}
                />
                <Input
                  readOnly={true}
                  className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                  defaultValue={line.approver_role}
                />
                <Input
                  readOnly={true}
                  className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                  defaultValue={line.approver}
                />
              </div>
            ) : (
              <div className="my-1 grid grid-cols-5 gap-1">
                <Input
                  readOnly={true}
                  className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                  defaultValue={line.requisition_approval_sequence}
                />
                <Input
                  readOnly={true}
                  className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                  defaultValue={line.approver_role}
                />
                <Input
                  readOnly={true}
                  className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                  defaultValue={line.approver}
                />
                <Input
                  readOnly={true}
                  className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                  defaultValue={line.approval_status}
                />
                <Input
                  readOnly={true}
                  className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                  defaultValue={line.approver_comments}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ApprovalFlow;
