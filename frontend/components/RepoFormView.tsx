"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";

const REFERENCE_DOC_ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.txt,image/*";

function fileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export default function RepoFormView() {
  const router = useRouter();
  const [repoName, setRepoName] = useState("");
  const [repoLink, setRepoLink] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

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
    setDialogOpen(true);
  }

  return (
    <>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Stack component="form" spacing={3} onSubmit={handleSubmit}>
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
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
          />
          <TextField
            label="Repository link"
            name="repo_link"
            type="url"
            value={repoLink}
            onChange={(event) => setRepoLink(event.target.value)}
            required
            fullWidth
            placeholder="https://github.com/owner/repository"
          />

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
              PDF, Word, PowerPoint, text, and image files.
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

          <Button type="submit" variant="contained" size="large">
            Submit repository information
          </Button>
        </Stack>
      </Paper>

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
            {repoName} is ready for the next setup steps.
          </Typography>
          <List dense sx={{ mt: 1 }}>
            {[
              "1. Configure repository access",
              "2. Process reference documents",
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
