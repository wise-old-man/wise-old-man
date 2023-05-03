"use client";

import { Button } from "~/components/Button";
import {
  TableContainer,
  TableHeader,
  Table,
  TableColumns,
  TableColumn,
  TableSorting,
  TableBody,
  TableRow,
  TableCell,
} from "~/components/Table";
import { useTableSorting } from "~/hooks/useTableSorting";

export function TestTable() {
  const { sortingOptions, ...sortingProps } = useTableSorting();

  const rows = []; // TODO: sort these based on sortingOptions, then render them

  return (
    <TableContainer>
      <TableHeader>
        <div className="flex flex-col">
          <h3 className="text-h3 font-medium">Current stats</h3>
          <p className="text-sm text-gray-200">Sethmare&apos;s stats as of 3 hours ago</p>
        </div>
        <Button>Export table</Button>
      </TableHeader>
      <Table>
        <TableColumns>
          <TableColumn>
            Skill
            <TableSorting value="skill" {...sortingProps} />
          </TableColumn>
          <TableColumn>
            Exp.
            <TableSorting value="experience" {...sortingProps} />
          </TableColumn>
          <TableColumn>Level</TableColumn>
          <TableColumn>Rank</TableColumn>
          <TableColumn>EHP</TableColumn>
        </TableColumns>
        <TableBody>
          <TableRow>
            <TableCell className="flex items-center gap-x-2 text-white">
              <img src={`/img/metrics_small/overall.png`} />
              Overall
            </TableCell>
            <TableCell>301.68m</TableCell>
            <TableCell>2188</TableCell>
            <TableCell>65k</TableCell>
            <TableCell>749.42</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="flex items-center gap-x-2 text-white">
              <img src={`/img/metrics_small/attack.png`} />
              Attack
            </TableCell>
            <TableCell>301.68m</TableCell>
            <TableCell>2188</TableCell>
            <TableCell>65k</TableCell>
            <TableCell>749.42</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="flex items-center gap-x-2 text-white">
              <img src={`/img/metrics_small/defence.png`} />
              Defence
            </TableCell>
            <TableCell>301.68m</TableCell>
            <TableCell>2188</TableCell>
            <TableCell>65k</TableCell>
            <TableCell>749.42</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="flex items-center gap-x-2 text-white">
              <img src={`/img/metrics_small/strength.png`} />
              Strength
            </TableCell>
            <TableCell>301.68m</TableCell>
            <TableCell>2188</TableCell>
            <TableCell>65k</TableCell>
            <TableCell>749.42</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
