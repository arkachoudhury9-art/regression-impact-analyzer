import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Chip from "@mui/material/Chip";
import type { Criticality } from "../lib/changes";

const CHIP_PROPS = {
  high: { label: "High", color: "error", icon: <ReportProblemIcon /> },
  medium: { label: "Medium", color: "warning", icon: <WarningAmberIcon /> },
  low: { label: "Low", color: "success", icon: <CheckCircleIcon /> },
} as const;

export default function CriticalityChip({ criticality }: { criticality: Criticality | null }) {
  if (!criticality) {
    return <Chip size="small" variant="outlined" label="Unrated" icon={<HelpOutlineIcon />} />;
  }
  const { label, color, icon } = CHIP_PROPS[criticality];
  return <Chip size="small" variant="outlined" label={label} color={color} icon={icon} />;
}
