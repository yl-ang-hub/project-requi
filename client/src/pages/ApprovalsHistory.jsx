import React, { use, useEffect } from "react";
import {
  Table,
  TableBody,
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

const ApprovalsHistory = () => {
  const fetchData = useFetch();
  const authCtx = use(AuthCtx);
  const navigate = useNavigate();

  const getApprovalHistory = useMutation({
    mutationFn: async () => {
      return await fetchData(
        "/requisitions/approvals/history",
        "POST",
        { userId: authCtx.userId },
        authCtx.accessToken
      );
    },
  });

  const handleViewButton = (pr) => {
    if (pr.next_approver === authCtx.userId) {
      navigate(`/approvals/${pr.id}`);
    } else if (
      pr.status === "Approved" ||
      pr.status === "Completed" ||
      (pr.status === "Pending MMD" && authCtx.role.includes("MMD"))
    ) {
      navigate(`/poview/${pr.id}`);
    } else {
      navigate(`/pr/${pr.id}`);
    }
  };

  useEffect(() => {
    if (authCtx.accessToken.length !== 0) getApprovalHistory.mutate();
  }, []);

  return (
    <div className="w-full">
      <Card className="w-full h-screen mx-auto">
        <CardHeader>
          <CardTitle>My Approval History</CardTitle>
        </CardHeader>
        <CardContent>
          {/* PRs APPROVED BY USER */}
          <Card>
            <CardHeader>
              <CardTitle>PRs Approved</CardTitle>
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
                    <TableHead>PR Status</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {getApprovalHistory?.data?.approved?.map((pr) => {
                    return (
                      <TableRow key={pr.id}>
                        <TableCell className="font-medium">{pr.id}</TableCell>
                        <TableCell>{pr.title}</TableCell>
                        <TableCell>{pr.requester_contact_name}</TableCell>
                        <TableCell>{pr.cost_centre}</TableCell>
                        <TableCell>{pr.account_code}</TableCell>
                        <TableCell>{pr.amount_in_sgd}</TableCell>
                        <TableCell>{pr.status}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            id={pr.id}
                            onClick={() => handleViewButton(pr)}>
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

          {/* PRs REJECTED BY USER */}
          <Card>
            <CardHeader>
              <CardTitle>PRs Rejected</CardTitle>
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
                    <TableHead>PR Status</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {getApprovalHistory?.data?.rejected?.map((pr) => {
                    return (
                      <TableRow key={pr.id}>
                        <TableCell className="font-medium">{pr.id}</TableCell>
                        <TableCell>{pr.title}</TableCell>
                        <TableCell>{pr.requester_contact_name}</TableCell>
                        <TableCell>{pr.cost_centre}</TableCell>
                        <TableCell>{pr.account_code}</TableCell>
                        <TableCell>{pr.amount_in_sgd}</TableCell>
                        <TableCell>{pr.status}</TableCell>
                        <TableCell className="text-right">
                          <Button onClick={() => handleViewButton(pr)}>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovalsHistory;
