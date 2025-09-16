import React, { use, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useFetch from "@/hooks/useFetch";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import AuthCtx from "@/components/context/authContext";
import { useNavigate } from "react-router-dom";

const GlobalSearch = () => {
  const fetchData = useFetch();
  const authCtx = use(AuthCtx);
  const navigate = useNavigate();

  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });

  const mutation = useMutation({
    mutationFn: async (query) => {
      return await fetchData(
        `/requisitions/search?query=${query}`,
        "GET",
        undefined,
        authCtx.accessToken
      );
    },
  });

  const handleViewButton = (item) => {
    if (item.next_approver === authCtx.userId) {
      navigate(`/approvals/${item.pr_id}`);
    } else if (
      item.pr_status === "Approved" ||
      item.pr_status === "Completed" ||
      (item.pr_status === "Pending MMD" && authCtx.role.includes("MMD"))
    ) {
      navigate(`/poview/${item.pr_id}`);
    } else {
      navigate(`/pr/${item.pr_id}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="text-2xl font-extrabold dark:text-white">
        Global Search
      </div>
      <div>
        <Input onChange={(event) => mutation.mutate(event.target.value)} />

        {mutation.isSuccess &&
          mutation?.data?.map((item) => {
            return (
              <Card className="my-1" key={item.id}>
                <CardHeader>
                  <CardTitle>
                    PR{item.pr_id} - {item.title}
                  </CardTitle>
                  <CardAction>
                    SGD{" "}
                    {formatter.format(
                      item.po_amount_in_sgd || item.pr_amount_in_sgd
                    )}
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <p>Description: {item.description}</p>
                  <p>Requester: {item.requester_contact_name}</p>
                  <p>
                    Cost Centre: {item.po_cost_centre || item.pr_cost_centre}
                  </p>
                  <p>
                    Account Code: {item.po_account_code || item.pr_account_code}
                  </p>
                  <p>
                    Total Amount: {item.currency}{" "}
                    {formatter.format(
                      item.po_total_amount || item.pr_total_amount
                    )}
                  </p>
                  <p>Status: {item.status}</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleViewButton(item)}>View</Button>
                </CardFooter>
              </Card>
            );
          })}
      </div>
    </div>
  );
};

export default GlobalSearch;
