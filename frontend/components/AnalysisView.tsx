"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { type AnalysisResponse, type ChangedFile, readStoredChangeIds, requestAnalysis } from "../lib/analysis";
import { type Criticality, CRITICALITY_RANK } from "../lib/changes";

type RequestState = "requesting" | "ready" | "failed";

const VISIBLE_ID_CHIPS = 24;

const CRITICALITY_STYLE = {
  high: { label: "High", color: "error.main", tint: "#fdecea", icon: ReportProblemIcon },
  medium: { label: "Medium", color: "warning.dark", tint: "#fff4e5", icon: WarningAmberIcon },
  low: { label: "Low", color: "success.main", tint: "#edf7ed", icon: CheckCircleIcon },
  unrated: { label: "Unrated", color: "text.secondary", tint: "#f4f6f9", icon: HelpOutlineIcon },
} as const;

const sectionAccordionSx = {
  borderRadius: 2,
  overflow: "hidden",
  "&:before": { display: "none" },
  "&.Mui-expanded": { margin: 0 },
} as const;

function toCriticality(value: string): Criticality | null {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }
  return null;
}

function highestCriticality(files: ChangedFile[]): Criticality | null {
  return files.reduce<Criticality | null>((highest, file) => {
    const criticality = toCriticality(file.criticality);
    if (!criticality) {
      return highest;
    }
    if (!highest || CRITICALITY_RANK[criticality] > CRITICALITY_RANK[highest]) {
      return criticality;
    }
    return highest;
  }, null);
}

function fileCountLabel(count: number): string {
  return count === 1 ? "1 file" : `${count} files`;
}

function AnalysisResult({ analysis }: { analysis: AnalysisResponse }) {
  const criticality = highestCriticality(analysis.changed_files);
  const style = CRITICALITY_STYLE[criticality ?? "unrated"];
  const Icon = style.icon;
  const distinctLevels = new Set(
    analysis.changed_files.map((file) => toCriticality(file.criticality)).filter((level) => level !== null),
  );
  const riskCount = analysis.regression_risks.length;

  return (
    <Stack spacing={2}>
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 2,
          bgcolor: style.tint,
          borderColor: style.color,
        }}
      >
        <Box
          aria-hidden
          sx={{
            display: "grid",
            placeItems: "center",
            width: 48,
            height: 48,
            borderRadius: 2,
            flexShrink: 0,
            color: style.color,
            bgcolor: "background.paper",
          }}
        >
          <Icon />
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Criticality
          </Typography>
          <Typography variant="h5" component="p" sx={{ fontWeight: 600, color: style.color, lineHeight: 1.2 }}>
            {style.label}
          </Typography>
          {distinctLevels.size > 1 ? (
            <Typography variant="caption" color="text.secondary">
              Highest across the changed files
            </Typography>
          ) : null}
        </Box>
      </Paper>

      <Accordion disableGutters elevation={0} variant="outlined" sx={sectionAccordionSx}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5 }}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ width: "100%", alignItems: "center", justifyContent: "space-between", pr: 1 }}
          >
            <Typography variant="subtitle2">Changed files</Typography>
            <Typography variant="body2" color="text.secondary">
              {fileCountLabel(analysis.changed_files.length)}
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2.5 }}>
          {analysis.changed_files.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No changed files were returned.
            </Typography>
          ) : (
            <Stack spacing={0.75}>
              {analysis.changed_files.map((file) => (
                <Box
                  key={file.file_path}
                  sx={{ px: 1.5, py: 1.25, borderRadius: 1, bgcolor: "#f8f9fb" }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                      fontSize: 13,
                      wordBreak: "break-all",
                    }}
                  >
                    {file.file_path || "Unknown file"}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </AccordionDetails>
      </Accordion>

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Change summary
        </Typography>
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7, color: "text.primary" }}>
          {analysis.change_summary.trim() || "No summary was returned."}
        </Typography>
      </Paper>

      <Accordion defaultExpanded disableGutters elevation={0} variant="outlined" sx={sectionAccordionSx}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5 }}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ width: "100%", alignItems: "center", justifyContent: "space-between", pr: 1 }}
          >
            <Typography variant="subtitle2">Regression risks</Typography>
            <Typography variant="body2" color="text.secondary">
              {riskCount === 1 ? "1 item" : `${riskCount} items`}
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2.5 }}>
          {riskCount === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No regression risks were identified.
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {analysis.regression_risks.map((risk, index) => (
                <Stack key={`${index}-${risk}`} direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                  <Box
                    aria-hidden
                    sx={{
                      mt: 0.15,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "primary.light",
                      color: "primary.dark",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography variant="body2" sx={{ lineHeight: 1.65 }}>
                    {risk}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}

export default function AnalysisView() {
  const [changeIds, setChangeIds] = useState<number[] | null>(null);
  const [state, setState] = useState<RequestState>("requesting");
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);

  const submit = useCallback(
    async (signal?: AbortSignal) => {
      if (!changeIds || changeIds.length === 0) {
        return;
      }
      setState("requesting");
      setError(null);
      setAnalysis(null);
      try {
        const result = await requestAnalysis(changeIds, signal);
        setAnalysis(result);
        setState("ready");
      } catch (err) {
        if (signal?.aborted) {
          return;
        }
        setError(err instanceof Error ? err.message : "Unknown error");
        setState("failed");
      }
    },
    [changeIds],
  );

  useEffect(() => {
    setChangeIds(readStoredChangeIds());
  }, []);

  useEffect(() => {
    if (!changeIds || changeIds.length === 0) {
      return;
    }
    const controller = new AbortController();
    void submit(controller.signal);
    return () => controller.abort();
  }, [changeIds, submit]);

  return (
    <Stack spacing={3}>
      <Box>
        <Button component={Link} href="/" startIcon={<ArrowBackIcon />} sx={{ ml: -1, mb: 1 }}>
          Back to changes
        </Button>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Regression analysis
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Impact analysis for the changes you selected.
        </Typography>
      </Box>

      {changeIds === null ? (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }} aria-live="polite">
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Loading selected changes…
          </Typography>
        </Stack>
      ) : changeIds.length === 0 ? (
        <Alert
          severity="warning"
          action={
            <Button component={Link} href="/" color="inherit" size="small">
              Select changes
            </Button>
          }
        >
          No changes were selected. Choose at least one change to analyze.
        </Alert>
      ) : (
        <>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              {changeIds.length === 1 ? "1 change selected" : `${changeIds.length} changes selected`}
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              {changeIds.slice(0, VISIBLE_ID_CHIPS).map((id) => (
                <Chip key={id} size="small" variant="outlined" label={`#${id}`} />
              ))}
              {changeIds.length > VISIBLE_ID_CHIPS ? (
                <Chip size="small" label={`+${changeIds.length - VISIBLE_ID_CHIPS} more`} />
              ) : null}
            </Stack>
          </Paper>

          {state === "requesting" ? (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }} aria-live="polite">
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Running regression analysis…
              </Typography>
            </Stack>
          ) : null}

          {state === "failed" ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => void submit()}>
                  Retry
                </Button>
              }
            >
              Could not complete the analysis. {error}
            </Alert>
          ) : null}

          {state === "ready" && analysis ? (
            <AnalysisResult analysis={analysis} />
          ) : null}
        </>
      )}
    </Stack>
  );
}
