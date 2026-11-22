import InsightsIcon from "@mui/icons-material/Insights";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

export default function AppHeader() {
  return (
    <AppBar position="sticky" color="primary" elevation={0}>
      <Toolbar sx={{ gap: 1.5 }}>
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            width: 36,
            height: 36,
            borderRadius: 1,
            bgcolor: "rgba(255, 255, 255, 0.16)",
          }}
          aria-hidden
        >
          <InsightsIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="h6" component="h1" sx={{ lineHeight: 1.2, fontWeight: 600 }}>
            Regression Impact Analyzer
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Code change risk overview
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
