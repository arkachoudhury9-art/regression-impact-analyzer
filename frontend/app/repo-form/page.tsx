import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import RepoFormView from "../../components/RepoFormView";
import AppHeader from "../../components/AppHeader";

export default function RepoFormPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppHeader />
      <Container component="main" maxWidth="xl" sx={{ py: { xs: 4, sm: 8 } }}>
        <RepoFormView />
      </Container>
    </Box>
  );
}
