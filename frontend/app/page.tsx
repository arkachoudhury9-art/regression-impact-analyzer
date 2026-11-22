"use client";

import RefreshIcon from "@mui/icons-material/Refresh";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import ChangesTable from "../components/ChangesTable";
import SummaryCards from "../components/SummaryCards";
import { type Change, fetchChanges } from "../lib/changes";

const timeFormatter = new Intl.DateTimeFormat(undefined, { timeStyle: "short" });

export default function Home() {
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadChanges = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      setChanges(await fetchChanges(signal));
      setLastUpdated(new Date());
    } catch (err) {
      if (signal?.aborted) {
        return;
      }
      setError(err instanceof Error ? err.message : "Unknown error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadChanges(controller.signal);
    return () => controller.abort();
  }, [loadChanges]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppHeader />
      <Container component="main" maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" } }}
          >
            <Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Code changes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Every changed file is classified by category and regression risk. Analyze
                anything rated medium or high before release.
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexShrink: 0 }}>
              {lastUpdated ? (
                <Typography variant="caption" color="text.secondary" aria-live="polite">
                  Updated {timeFormatter.format(lastUpdated)}
                </Typography>
              ) : null}
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => void loadChanges()}
                disabled={loading}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>

          {error ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => void loadChanges()}>
                  Retry
                </Button>
              }
            >
              Could not load changes. {error}
            </Alert>
          ) : null}

          <SummaryCards changes={changes} loading={loading} />
          <ChangesTable changes={changes} loading={loading} />
        </Stack>
      </Container>
    </Box>
  );
}
