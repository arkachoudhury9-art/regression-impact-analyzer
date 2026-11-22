"use client";

import AnalyticsIcon from "@mui/icons-material/Analytics";
import InboxIcon from "@mui/icons-material/Inbox";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { storeChangeIds } from "../lib/analysis";
import { type Change, type Criticality, CRITICALITY_RANK, formatCategory } from "../lib/changes";
import CriticalityChip from "./CriticalityChip";

type SortKey = "file_name" | "category" | "criticality" | "created_at";
type SortDirection = "asc" | "desc";
type CriticalityFilter = "all" | Criticality;

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "file_name", label: "File" },
  { key: "category", label: "Category" },
  { key: "criticality", label: "Criticality" },
  { key: "created_at", label: "Detected" },
];

const COLUMN_COUNT = COLUMNS.length + 2;
const SKELETON_ROWS = 5;

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function compareChanges(a: Change, b: Change, key: SortKey): number {
  switch (key) {
    case "criticality":
      return (
        (a.criticality ? CRITICALITY_RANK[a.criticality] : 0) -
        (b.criticality ? CRITICALITY_RANK[b.criticality] : 0)
      );
    case "created_at":
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    case "category":
      return formatCategory(a.category).localeCompare(formatCategory(b.category));
    case "file_name":
      return (a.file_name ?? "").localeCompare(b.file_name ?? "");
  }
}

type ChangesTableProps = {
  changes: Change[];
  loading: boolean;
};

export default function ChangesTable({ changes, loading }: ChangesTableProps) {
  const [search, setSearch] = useState("");
  const [criticalityFilter, setCriticalityFilter] = useState<CriticalityFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("criticality");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const router = useRouter();

  const selectedChangeIds = useMemo(
    () => changes.filter((change) => selectedIds.has(change.id)).map((change) => change.id),
    [changes, selectedIds],
  );
  const selectedCount = selectedChangeIds.length;

  const generateAnalysis = () => {
    storeChangeIds(selectedChangeIds);
    router.push("/analysis");
  };

  const toggleSelected = (id: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const visibleChanges = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = changes.filter((change) => {
      if (criticalityFilter !== "all" && change.criticality !== criticalityFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [change.file_name, change.change_id, formatCategory(change.category)].some(
        (value) => value?.toLowerCase().includes(query),
      );
    });
    const direction = sortDirection === "asc" ? 1 : -1;
    return filtered.sort(
      (a, b) =>
        direction * compareChanges(a, b, sortKey) ||
        compareChanges(b, a, "created_at"),
    );
  }, [changes, search, criticalityFilter, sortKey, sortDirection]);

  const pageChanges = visibleChanges.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const hasFilters = search.trim() !== "" || criticalityFilter !== "all";

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection(key === "file_name" || key === "category" ? "asc" : "desc");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCriticalityFilter("all");
    setPage(0);
  };

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ p: 2, alignItems: { md: "center" }, justifyContent: "space-between" }}
      >
        <TextField
          size="small"
          placeholder="Search by file, category, or change ID"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
          sx={{ width: { xs: "100%", md: 360 } }}
          slotProps={{
            htmlInput: { "aria-label": "Search changes" },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Stack
          direction="row"
          spacing={2}
          useFlexGap
          sx={{ alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}
        >
          <ToggleButtonGroup
            size="small"
            exclusive
            value={criticalityFilter}
            onChange={(_, value: CriticalityFilter | null) => {
              if (value) {
                setCriticalityFilter(value);
                setPage(0);
              }
            }}
            aria-label="Filter by criticality"
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="high">High</ToggleButton>
            <ToggleButton value="medium">Medium</ToggleButton>
            <ToggleButton value="low">Low</ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<AnalyticsIcon />}
            disabled={selectedCount === 0}
            onClick={generateAnalysis}
          >
            {selectedCount > 0 ? `Generate analysis (${selectedCount})` : "Generate analysis"}
          </Button>
        </Stack>
      </Stack>

      <TableContainer>
        <Table aria-label="Code changes" sx={{ minWidth: 760 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ pl: 2 }}>
                Select
              </TableCell>
              {COLUMNS.map((column) => (
                <TableCell
                  key={column.key}
                  sortDirection={sortKey === column.key ? sortDirection : false}
                >
                  <TableSortLabel
                    active={sortKey === column.key}
                    direction={sortKey === column.key ? sortDirection : "asc"}
                    onClick={() => handleSort(column.key)}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell>Change ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: COLUMN_COUNT }, (_, cell) => (
                      <TableCell key={cell}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : pageChanges.map((change) => {
                  const selected = selectedIds.has(change.id);
                  const fileLabel = change.file_name ?? "change";
                  return (
                    <TableRow key={change.id} hover selected={selected}>
                      <TableCell padding="checkbox" sx={{ pl: 1 }}>
                        <Checkbox
                            checked={selected}
                            onChange={() => toggleSelected(change.id)}
                            slotProps={{ input: { "aria-label": `Select ${fileLabel}` } }}
                          />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 360 }}>
                        <Tooltip title={change.file_name ?? ""} placement="top-start">
                          <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                            {change.file_name ?? "Unknown file"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={formatCategory(change.category)} />
                      </TableCell>
                      <TableCell>
                        <CriticalityChip criticality={change.criticality} />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {dateFormatter.format(new Date(change.created_at))}
                      </TableCell>
                      <TableCell>
                        {change.change_id ? (
                          <Tooltip title={change.change_id}>
                            <Typography
                              variant="body2"
                              component="code"
                              sx={{ fontFamily: "monospace", color: "text.secondary" }}
                            >
                              {change.change_id.slice(0, 7)}
                            </Typography>
                          </Tooltip>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
            {!loading && pageChanges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMN_COUNT} sx={{ border: 0 }}>
                  <Stack spacing={1} sx={{ alignItems: "center", py: 6, textAlign: "center" }}>
                    {hasFilters ? (
                      <ManageSearchIcon color="disabled" sx={{ fontSize: 40 }} />
                    ) : (
                      <InboxIcon color="disabled" sx={{ fontSize: 40 }} />
                    )}
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {hasFilters ? "No changes match your filters" : "No changes recorded yet"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {hasFilters
                        ? "Try a different search term or criticality."
                        : "Changes appear here after a push triggers the GitHub webhook."}
                    </Typography>
                    {hasFilters ? (
                      <Button onClick={clearFilters} sx={{ mt: 1 }}>
                        Clear filters
                      </Button>
                    ) : null}
                  </Stack>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={visibleChanges.length}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number(event.target.value));
          setPage(0);
        }}
      />
    </Paper>
  );
}
