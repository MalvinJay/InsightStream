import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Avatar,
} from "@mui/material";
import { Visibility, ThumbUp, Share, MoreVert } from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";

const sentimentColors = {
  positive: "success",
  negative: "error",
  neutral: "default",
  urgent: "warning",
  informative: "info",
};

export default function ContentCard({ content }) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Chip
            label={content.type}
            size="small"
            variant="outlined"
            sx={{ textTransform: "capitalize" }}
          />
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Box>

        <Typography variant="h6" component="h3" gutterBottom>
          {content.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {content.content}
        </Typography>

        {content.sentiment && (
          <Box sx={{ mb: 2 }}>
            <Chip
              label={`${content.sentiment.label} (${Math.round(
                content.sentiment.confidence * 100
              )}%)`}
              color={sentimentColors[content.sentiment.label]}
              size="small"
            />
          </Box>
        )}

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
          {content.tags?.map((tag, index) => (
            <Chip key={index} label={tag} size="small" variant="outlined" />
          ))}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: "auto",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: "0.75rem" }}>
              {content.author.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              {content.author}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            {formatDistanceToNow(new Date(content.created_at))} ago
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Visibility fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {content.views}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ThumbUp fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {content.reactions}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Share fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {content.shares || 0}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
