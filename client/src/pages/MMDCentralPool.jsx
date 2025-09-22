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
import { Loader } from "lucide-react";

const MMDCentralPool = () => {
  const fetchData = useFetch();
  const authCtx = use(AuthCtx);
  const navigate = useNavigate();

  const getPRInMMDCentralPool = useMutation({
    mutationFn: async () => {
      return await fetchData(
        "/requisitions/approvals/mmd_central_pool",
        "GET",
        undefined,
        authCtx.accessToken
      );
    },
  });

  const pullPRMutation = useMutation({
    mutationFn: async (id) => {
      const body = {
        userId: authCtx.userId,
        role: authCtx.role,
        requisitionId: id,
      };

      return await fetchData(
        "/requisitions/approvals/mmd_central_pool",
        "PATCH",
        body,
        authCtx.accessToken
      );
    },
    onSuccess: (data) => {
      navigate(`/approvals/${data.requisition_id}`);
    },
  });

  useEffect(() => {
    if (authCtx.accessToken.length !== 0) getPRInMMDCentralPool.mutate();
  }, []);

  return (
    <div className="w-full">
      <Card className="w-full mx-auto overflow-y-auto border-transparent shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
            PRs in Central Pool (MMD)
          </CardTitle>
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
              {getPRInMMDCentralPool?.data?.map((pr) => {
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
                        disabled={pullPRMutation.isPending}
                        onClick={(event) =>
                          pullPRMutation.mutate(event.target.id)
                        }>
                        {pullPRMutation.isPending ? (
                          <Loader />
                        ) : (
                          "Pull to my worklist"
                        )}
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

export default MMDCentralPool;
