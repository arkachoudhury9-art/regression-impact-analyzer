"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { fetchRepositoryBranches } from "../lib/github";

const REFERENCE_DOC_ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.txt,image/*";

function fileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export default function RepoFormView() {
  const router = useRouter();
  const [repoName, setRepoName] = useState("");
  const [repoLink, setRepoLink] = useState("");
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branchLookupLoading, setBranchLookupLoading] = useState(false);
  const [branchLookupError, setBranchLookupError] = useState("");
  const [branchLookupComplete, setBranchLookupComplete] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleRepositoryUrlChange(value: string) {
    setRepoLink(value);
    setRepoName("");
    setBranches([]);
    setSelectedBranch("");
    setBranchLookupError("");
    setBranchLookupComplete(false);
    setSubmitError("");
  }

  async function handleRepositoryUrlBlur() {
    if (!repoLink.trim() || branchLookupLoading || branchLookupComplete) {
      return;
    }

    setBranchLookupLoading(true);
    setBranchLookupError("");
    setBranchLookupComplete(false);
    setBranches([]);
    setSelectedBranch("");
    setSubmitError("");

    try {
      const result = await fetchRepositoryBranches(repoLink.trim());
      setRepoName(result.repository_name);
      setBranches(result.branches);
      setBranchLookupComplete(true);
    } catch (error) {
      setBranchLookupError(
        error instanceof Error ? error.message : "An unexpected error occurred while checking the repository.",
      );
    } finally {
      setBranchLookupLoading(false);
    }
  }

  function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.currentTarget.files ?? []);
    setFiles((currentFiles) => {
      const seenKeys = new Set(currentFiles.map(fileKey));
      return [
        ...currentFiles,
        ...selectedFiles.filter((file) => {
          const key = fileKey(file);
          if (seenKeys.has(key)) {
            return false;
          }
          seenKeys.add(key);
          return true;
        }),
      ];
    });
    event.currentTarget.value = "";
  }

  function removeFile(fileToRemove: File) {
    const keyToRemove = fileKey(fileToRemove);
    setFiles((currentFiles) => currentFiles.filter((file) => fileKey(file) !== keyToRemove));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedBranch || !branches.includes(selectedBranch)) {
      setSubmitError("Wait for the GitHub lookup to finish and select a branch before submitting.");
      return;
    }
    setSubmitError("");
    setDialogOpen(true);
  }

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "minmax(0, 1.5fr) minmax(260px, 1fr)",
          },
          gridTemplateAreas: {
            xs: '"form" "documents" "prerequisites"',
            md: '"form documents" "prerequisites prerequisites"',
          },
          gap: { xs: 2, md: 3 },
          alignItems: "start",
        }}
      >
        <Accordion
          disableGutters
          defaultExpanded={false}
          aria-labelledby="webhook-prerequisite-title"
          sx={{
            gridArea: "prerequisites",
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            boxShadow: "none",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="webhook-prerequisite-content"
            id="webhook-prerequisite-title"
          >
            <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 600 }}>
              GitHub webhook prerequisite
            </Typography>
          </AccordionSummary>
          <AccordionDetails id="webhook-prerequisite-content">
            <Typography variant="body2" color="text.secondary">
              Configure this before expecting push events to trigger analysis.
            </Typography>
            <Stack component="ol" spacing={1.25} sx={{ pl: 2.5, my: 2 }}>
              <Box component="li">
                <Typography variant="body2">
                  Deploy the API so GitHub can reach it over public HTTPS.
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  In your repository, open <strong>Settings → Webhooks → Add webhook</strong>.
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">Use this payload URL:</Typography>
                <Typography
                  component="code"
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    p: 1,
                    bgcolor: "action.hover",
                    borderRadius: 1,
                    overflowWrap: "anywhere",
                  }}
                >
                  https://YOUR_API_HOST/webhook/trigger
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Replace YOUR_API_HOST with your deployed API host; localhost will not work.
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  Choose <strong>application/json</strong>, select <strong>Just the push event</strong>,
                  keep the webhook active, then save it.
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  Push a commit to the repository to test the webhook delivery.
                </Typography>
              </Box>
            </Stack>
            <Box
              role="note"
              sx={{ pl: 1.5, py: 0.5, borderLeft: 3, borderColor: "warning.main" }}
            >
              <Typography variant="caption" color="text.secondary">
                Security note: this backend does not currently verify GitHub webhook signatures.
                A GitHub webhook secret is not enforced by the endpoint; add signature verification
                before using it in production.
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Paper
          component="aside"
          variant="outlined"
          aria-labelledby="repository-details-title"
          sx={{ gridArea: "documents", p: 2.5 }}
        >
          <Typography
            id="repository-details-title"
            variant="subtitle1"
            component="h2"
            sx={{ fontWeight: 600 }}
          >
            What to prepare
          </Typography>
          <Stack spacing={2} sx={{ mt: 1.5 }}>
            <Box>
              <Typography variant="subtitle2">Repository name</Typography>
              <Typography variant="body2" color="text.secondary">
                Use the GitHub owner/repository format, such as octocat/hello-world.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Repository link</Typography>
              <Typography variant="body2" color="text.secondary">
                Paste the repository URL, for example https://github.com/owner/repository.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Reference documents (optional)</Typography>
              <Typography variant="body2" color="text.secondary">
                Architecture notes, API specifications, and test plans can provide useful context.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Paper
          component="section"
          variant="outlined"
          aria-labelledby="repository-setup-title"
          sx={{ gridArea: "form", p: { xs: 2.5, sm: 3 } }}
        >
          <Stack component="form" spacing={3} onSubmit={handleSubmit}>
            <Box>
              <Typography
                id="repository-setup-title"
                variant="h5"
                component="h2"
                sx={{ fontWeight: 600 }}
              >
                Repository setup
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                Enter your repository details and add any reference documents.
              </Typography>
            </Box>

            <TextField
              label="Repository name"
              name="repo_name"
              value={repoName}
              onChange={(event) => setRepoName(event.target.value)}
              required
              fullWidth
              autoComplete="organization"
              placeholder="owner/repository"
              helperText="Use the GitHub owner/repository format."
            />
            <TextField
              label="Repository link"
              name="repo_link"
              type="url"
              value={repoLink}
              onChange={(event) => handleRepositoryUrlChange(event.target.value)}
              onBlur={handleRepositoryUrlBlur}
              required
              fullWidth
              disabled={branchLookupLoading}
              placeholder="https://github.com/owner/repository"
              helperText="Only GitHub.com repository URLs are supported. Click outside this field to load branches."
              sx={{ "& .MuiFormHelperText-root": { minHeight: "1.25em" } }}
            />

            {branchLookupLoading ? (
              <Stack direction="row" spacing={1} alignItems="center" role="status">
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Looking up repository branches...
                </Typography>
              </Stack>
            ) : null}
            {branchLookupError ? (
              <Typography variant="body2" color="error" role="alert">
                {branchLookupError}
              </Typography>
            ) : null}
            {branchLookupComplete ? (
              <Typography variant="body2" color="success.main" role="status">
                {branches.length > 0
                  ? `Repository verified. Found ${branches.length} ${branches.length === 1 ? "branch" : "branches"}.`
                  : "Repository verified, but no branches were returned."}
              </Typography>
            ) : null}

            <TextField
              select
              label="Repository branch"
              name="repo_branch"
              value={selectedBranch}
              onChange={(event) => {
                setSelectedBranch(event.target.value);
                setSubmitError("");
              }}
              required
              fullWidth
              disabled={branches.length === 0 || branchLookupLoading}
              helperText={
                branches.length > 0
                  ? "Choose the branch to analyze."
                  : "Move focus out of the repository URL field to load branches."
              }
            >
              {branches.map((branch) => (
                <MenuItem key={branch} value={branch}>
                  {branch}
                </MenuItem>
              ))}
            </TextField>
            {submitError ? (
              <Typography variant="body2" color="error" role="alert">
                {submitError}
              </Typography>
            ) : null}

            <Stack spacing={1.5}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<AttachFileIcon />}
                sx={{ alignSelf: "flex-start" }}
              >
                Add reference documents
                <input
                  hidden
                  type="file"
                  multiple
                  accept={REFERENCE_DOC_ACCEPT}
                  onChange={handleFileSelection}
                />
              </Button>
              <Typography variant="caption" color="text.secondary">
                Optional: architecture notes, API specs, or test plans. PDF, Word, PowerPoint, text,
                and image files are accepted.
              </Typography>

              {files.length > 0 ? (
                <Paper variant="outlined" sx={{ overflow: "hidden" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ px: 2, py: 1, bgcolor: "action.hover" }}
                  >
                    Attached documents ({files.length})
                  </Typography>
                  <List dense disablePadding aria-label="Attached documents">
                    {files.map((file, index) => (
                      <ListItem
                        key={fileKey(file)}
                        divider={index < files.length - 1}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            aria-label={`Remove ${file.name}`}
                            title={`Remove ${file.name}`}
                            onClick={() => removeFile(file)}
                            size="small"
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        }
                        sx={{ py: 0.5, pr: 7 }}
                      >
                        <ListItemText
                          primary={file.name}
                          primaryTypographyProps={{
                            variant: "body2",
                            sx: { overflowWrap: "anywhere" },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              ) : null}
            </Stack>

            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ alignSelf: "center", width: "fit-content" }}
              disabled={branchLookupLoading}
            >
              Submit repository information
            </Button>
          </Stack>
        </Paper>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="repo-submitted-title"
        aria-describedby="repo-submitted-description"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          id="repo-submitted-title"
          sx={{ display: "flex", gap: 1, alignItems: "center" }}
        >
          <CheckCircleOutlineIcon color="success" />
          Repository information submitted successfully
        </DialogTitle>
        <DialogContent>
          <Typography id="repo-submitted-description" variant="body2" color="text.secondary">
            {repoName} ({selectedBranch}) is ready for the next setup steps.
          </Typography>
          <List dense sx={{ mt: 1 }}>
            {[
              "1. Configure the GitHub push webhook",
              "2. Process optional reference documents",
              "3. Prepare the analysis",
            ].map((step) => (
              <ListItem key={step} disableGutters>
                <Typography variant="body2">{step}</Typography>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Close
          </Button>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={() => router.push("/")}
          >
            Continue to dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
