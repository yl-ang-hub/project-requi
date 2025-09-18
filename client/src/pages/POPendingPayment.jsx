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
import { useMutation, useQuery } from "@tanstack/react-query";
import useFetch from "@/hooks/useFetch";
import AuthCtx from "@/components/context/authContext";
import { useNavigate, useParams } from "react-router-dom";

const POPendingPayment = () => {
  const params = useParams();
  const fetchData = useFetch();
  const authCtx = use(AuthCtx);
  const navigate = useNavigate();

  const getPendingPOs = useQuery({
    queryKey: ["poPendingPayment"],
    queryFn: async () => {
      return await fetchData(
        "/orders/pending/payment",
        "GET",
        undefined,
        authCtx.accessToken
      );
    },
    enabled: !!authCtx.accessToken,
  });

  const handleViewButton = (event) => {
    navigate(`/poview/${event.target.id}`);
  };

  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });

  const refreshAccessToken = useMutation({
    mutationFn: async () => {
      return await fetchData(
        `/auth/refresh`,
        "GET",
        undefined,
        localStorage.getItem("refresh")
      );
    },
    onSuccess: (data) => {
      try {
        authCtx.setAccessToken(data.access);
        const decoded = jwtDecode(data.access);
        if (decoded) {
          authCtx.setUserId(decoded.id);
          authCtx.setRole(decoded.role);
          authCtx.setName(decoded.name);
        }
      } catch (e) {
        console.error(e.message);
      }
    },
  });

  useEffect(() => {
    // Auto login for users with refresh token in localStorage
    const refresh = localStorage.getItem("refresh");
    if (refresh && authCtx.accessToken == "") refreshAccessToken.mutate();
  }, []);

  return (
    <div className="w-full h-screen m-10">
      <div className="mb-5 text-2xl font-bold text-gray-800 dark:text-white">
        PO Pending Payment
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Requisition ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Requester</TableHead>
            <TableHead>Cost Centre</TableHead>
            <TableHead>Account Code</TableHead>
            <TableHead>PO Total (SGD)</TableHead>
            <TableHead>Required By</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {getPendingPOs?.data?.map((po) => {
            return (
              <TableRow key={po.requisition_id}>
                <TableCell className="font-medium">
                  {po.requisition_id}
                </TableCell>
                <TableCell>{po.title}</TableCell>
                <TableCell>{po.requester_contact_name}</TableCell>
                <TableCell>{po.po_cost_centre}</TableCell>
                <TableCell>{po.account_code}</TableCell>
                <TableCell className="text-right pr-10">
                  ${formatter.format(po.po_amount_in_sgd)}
                </TableCell>
                <TableCell>
                  {new Date(po.goods_required_by).toLocaleDateString("en-SG", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    id={po.requisition_id}
                    onClick={(event) => handleViewButton(event)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default POPendingPayment;
