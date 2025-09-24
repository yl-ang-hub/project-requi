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
import { useMutation } from "@tanstack/react-query";
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
      <Card className="w-full mx-auto border-transparent shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
            My Approval History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* PRs APPROVED BY USER */}
          <Card className="overflow-y-auto">
            <CardHeader>
              <CardTitle>My Approvals</CardTitle>
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
                    <TableHead>PR Total (SGD)</TableHead>
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
          <Card className="my-6  overflow-y-auto">
            <CardHeader>
              <CardTitle>My Rejections</CardTitle>
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
                    <TableHead>PR Total (SGD)</TableHead>
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
