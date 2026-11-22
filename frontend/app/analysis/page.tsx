import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import AnalysisView from "../../components/AnalysisView";
import AppHeader from "../../components/AppHeader";

export default function AnalysisPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppHeader />
      <Container component="main" maxWidth="xl" sx={{ py: 4 }}>
        <AnalysisView />
      </Container>
    </Box>
  );
}
