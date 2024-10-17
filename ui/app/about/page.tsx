"use client";

import { title } from "@/components/primitives";
import { BACKEND_ENDPOINT } from "@/config/backend";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/table";
import { Tab } from "@nextui-org/tabs";

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
          <TableRow key="2">
            <TableCell>Server Version</TableCell>
            <TableCell>v0.2.0-dev</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
