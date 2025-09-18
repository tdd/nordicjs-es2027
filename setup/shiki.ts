import { defineShikiSetup } from "@slidev/types";

export default defineShikiSetup(async () => {
  return {
    themes: {
      dark: "monokai",
      // light: "catppuccin-latte", // Also great-looking
      light: "slack-ochin",
    },
  };
});
