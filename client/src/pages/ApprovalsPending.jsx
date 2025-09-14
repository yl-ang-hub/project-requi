import React, { use, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import useFetch from "@/hooks/useFetch";
import AuthCtx from "@/components/context/authContext";
import { useNavigate } from "react-router-dom";

const ApprovalsPending = () => {
  const fetchData = useFetch();
  const authCtx = use(AuthCtx);
  const navigate = useNavigate();

  const getPRPendingApprovals = useMutation({
    mutationFn: async () => {
      return await fetchData(
        "/requisitions/approvals/pending",
        "POST",
        { userId: authCtx.userId },
        authCtx.accessToken
      );
    },
  });

  const handleViewButton = (event) => {
    navigate(`/pr/${event.target.id}`);
  };

  useEffect(() => {
    if (authCtx.accessToken.length !== 0) getPRPendingApprovals.mutate();
  }, []);

  return (
    <div className="w-full">
      <Card className="w-full h-screen mx-auto">
        <CardHeader>
          <CardTitle>Requisitions - Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Cost Centre</TableHead>
                <TableHead>Account Code</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Required By</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {getPRPendingApprovals?.data?.map((pr) => {
                return (
                  <TableRow key={pr.id}>
                    <TableCell className="font-medium">{pr.id}</TableCell>
                    <TableCell>{pr.title}</TableCell>
                    <TableCell>{pr.requester_contact_name}</TableCell>
                    <TableCell>{pr.cost_centre}</TableCell>
                    <TableCell>{pr.account_code}</TableCell>
                    <TableCell>{pr.amount_in_sgd}</TableCell>
                    <TableCell>{pr.goods_required_by}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        id={pr.id}
                        onClick={(event) => handleViewButton(event)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovalsPending;

/*
PR id
PR title
Requester Name
Cost Centre
Account Code
Total Amount (SGD)
Goods Required By
*/
