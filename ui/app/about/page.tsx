"use client";

import { title } from "@/components/primitives";
import { BACKEND_ENDPOINT } from "@/config/backend";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/table";

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className={title()}>About</h1>
      <Table aria-label="About info">
        <TableHeader>
          <TableColumn>NAME</TableColumn>
          <TableColumn>VALUE</TableColumn>
        </TableHeader>
        <TableBody>
          <TableRow key="1">
            <TableCell>Backend URL Endpoint</TableCell>
            <TableCell>{BACKEND_ENDPOINT}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
