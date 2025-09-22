import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Link } from "react-router-dom";

const Disclaimer = () => {
  return (
    <Card className="w-2xl mx-auto my-6">
      <CardHeader>
        <CardTitle>Strictly For Demo Purposes</CardTitle>
        <CardDescription>
          <div className="text-red-600">
            This app is strictly for demo only and not meant to be used in
            production.
          </div>
          <div className="my-1">
            This is a spend management/procurement app designed for companies to
            manage their procurement workflow.
          </div>
          <div>
            For a sample workflow and also for more info about this app, please
            refer to{" "}
            <Link
              to="https://github.com/yl-ang-hub/project-requi"
              target="_blank"
              className="text-blue-500">
              this page
            </Link>
            .{" "}
            <div className="my-1">
              {
                "The user accounts required to test a complete procurement workflow (requester --> Finance Officer --> Department Head --> Director --> MMD --> MMD Head --> MMD Director --> MMD (verify goods delivery) --> Finance (verify payment)) are provided below."
              }
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Login ID</TableHead>
              <TableHead>Password</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow>
              <TableCell>Staff</TableCell>
              <TableCell>ops</TableCell>
              <TableCell>password123</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Finance Officer</TableCell>
              <TableCell>fin</TableCell>
              <TableCell>password123</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Department Head</TableCell>
              <TableCell>opshead</TableCell>
              <TableCell>password123</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Department Director</TableCell>
              <TableCell>opsdir</TableCell>
              <TableCell>password123</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>CFO</TableCell>
              <TableCell>csy</TableCell>
              <TableCell>password123</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>CEO</TableCell>
              <TableCell>boss</TableCell>
              <TableCell>password123</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>MMD Officer</TableCell>
              <TableCell>mmd</TableCell>
              <TableCell>password123</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>MMD Department Head</TableCell>
              <TableCell>mmdhead</TableCell>
              <TableCell>password123</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>MMD Director</TableCell>
              <TableCell>mmddir</TableCell>
              <TableCell>password123</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Disclaimer;
