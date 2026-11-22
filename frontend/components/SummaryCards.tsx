import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import type { Change } from "../lib/changes";

type SummaryCardsProps = {
  changes: Change[];
  loading: boolean;
};

export default function SummaryCards({ changes, loading }: SummaryCardsProps) {
  const count = (criticality: Change["criticality"]) =>
    changes.filter((change) => change.criticality === criticality).length;

  const cards = [
    {
      label: "Total changes",
      value: changes.length,
      icon: <DescriptionIcon />,
      color: "primary.main",
      tint: "primary.light",
    },
    {
      label: "High criticality",
      value: count("high"),
      icon: <ReportProblemIcon />,
      color: "error.main",
      tint: "#fdecea",
    },
    {
      label: "Medium criticality",
      value: count("medium"),
      icon: <WarningAmberIcon />,
      color: "warning.dark",
      tint: "#fff4e5",
    },
    {
      label: "Low criticality",
      value: count("low"),
      icon: <CheckCircleIcon />,
      color: "success.main",
      tint: "#edf7ed",
    },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid key={card.label} size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper
            variant="outlined"
            sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2, height: "100%" }}
          >
            <Box
              aria-hidden
              sx={{
                display: "grid",
                placeItems: "center",
                width: 44,
                height: 44,
                borderRadius: 2,
                color: card.color,
                bgcolor: card.tint,
              }}
            >
              {card.icon}
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {card.label}
              </Typography>
              <Typography variant="h5" component="p" sx={{ fontWeight: 600 }}>
                {loading ? <Skeleton width={40} /> : card.value}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
