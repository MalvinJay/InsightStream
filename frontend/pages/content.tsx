import { ChangeEvent, useState } from "react";
import {
  Grid,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import { Add, Refresh } from "@mui/icons-material";
import ContentCard from "../components/ContentCard";
import { useContent } from "../hooks/useApi";
import api from "../lib/api";
import toast from "react-hot-toast";

export default function Content() {
  const [filters, setFilters] = useState({ type: "", sentiment: "" });
  const [createDialog, setCreateDialog] = useState(false);
  const [newContent, setNewContent] = useState({
    title: "",
    content: "",
    type: "article",
    author: "",
  });

  const { content, loading, error, mutate } = useContent(filters);

  const handleFilterChange =
    (field: string) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFilters((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleCreateContent = async () => {
    try {
      await api.post("/content", newContent);
      toast.success("Content created successfully!");
      setCreateDialog(false);
      setNewContent({ title: "", content: "", type: "article", author: "" });
      mutate();
    } catch (error) {
      toast.error("Failed to create content");
      console.error("Create content error:", error);
    }
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load content. Please check if the backend is running.
      </Alert>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Content Analysis
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialog(true)}
        >
          Add Content
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          select
          label="Content Type"
          value={filters.type}
          onChange={handleFilterChange("type")}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="article">Article</MenuItem>
          <MenuItem value="comment">Comment</MenuItem>
          <MenuItem value="review">Review</MenuItem>
        </TextField>

        <TextField
          select
          label="Sentiment"
          value={filters.sentiment}
          onChange={handleFilterChange("sentiment")}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All Sentiments</MenuItem>
          <MenuItem value="positive">Positive</MenuItem>
          <MenuItem value="negative">Negative</MenuItem>
          <MenuItem value="neutral">Neutral</MenuItem>
          <MenuItem value="urgent">Urgent</MenuItem>
          <MenuItem value="informative">Informative</MenuItem>
        </TextField>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => mutate()}
        >
          Refresh
        </Button>
      </Box>

      {/* Content Grid */}
      {loading ? (
        <Typography>Loading content...</Typography>
      ) : (
        <Grid container spacing={3}>
          {content.map((item: { _id: string }) => (
            <Grid item xs={12} md={6} lg={4} key={item._id}>
              <ContentCard content={item} />
            </Grid>
          ))}
          {content.length === 0 && (
            <Grid item xs={12}>
              <Typography
                color="text.secondary"
                sx={{ textAlign: "center", py: 4 }}
              >
                No content found. Try adjusting your filters or add some
                content.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      {/* Create Content Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Content</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={newContent.title}
              onChange={(e) =>
                setNewContent((prev) => ({ ...prev, title: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Content"
              value={newContent.content}
              onChange={(e) =>
                setNewContent((prev) => ({ ...prev, content: e.target.value }))
              }
              multiline
              rows={4}
              fullWidth
            />
            <TextField
              select
              label="Type"
              value={newContent.type}
              onChange={(e) =>
                setNewContent((prev) => ({ ...prev, type: e.target.value }))
              }
              fullWidth
            >
              <MenuItem value="article">Article</MenuItem>
              <MenuItem value="comment">Comment</MenuItem>
              <MenuItem value="review">Review</MenuItem>
            </TextField>
            <TextField
              label="Author"
              value={newContent.author}
              onChange={(e) =>
                setNewContent((prev) => ({ ...prev, author: e.target.value }))
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateContent}
            variant="contained"
            disabled={
              !newContent.title || !newContent.content || !newContent.author
            }
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
