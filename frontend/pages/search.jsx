import { useState } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import ContentCard from "../components/ContentCard";
import api from "../lib/api";
import toast from "react-hot-toast";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/recommendations/similar", {
        text: query,
        limit: 12,
      });
      setResults(response.data);

      if (response.data.length === 0) {
        toast("No similar content found", { icon: "🔍" });
      } else {
        toast.success(`Found ${response.data.length} similar items`);
      }
    } catch (err) {
      setError("Search failed. Please try again.");
      console.error("Search error:", err);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Vector Search & Recommendations
      </Typography>

      {/* Search Interface */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Semantic Content Search
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter any text to find semantically similar content using Redis Vector
          Search
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Enter text to search for similar content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
          />
          <Button
            variant="contained"
            startIcon={
              loading ? <CircularProgress size={20} /> : <SearchIcon />
            }
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            sx={{ minWidth: 120 }}
          >
            {loading ? "Searching" : "Search"}
          </Button>
        </Box>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Search Results ({results.length})
          </Typography>
          <Grid container spacing={3}>
            {results.map((item) => (
              <Grid item xs={12} md={6} lg={4} key={item._id}>
                <Box sx={{ position: "relative" }}>
                  <ContentCard content={item} />
                  {item.similarity_score && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "primary.main",
                        color: "white",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                      }}
                    >
                      {Math.round(item.similarity_score * 100)}% match
                    </Box>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && query && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Results Found
          </Typography>
          <Typography color="text.secondary">
            Try different keywords or check if content exists in the database.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
