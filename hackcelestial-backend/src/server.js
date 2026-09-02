import "dotenv/config";
import { createApp } from "./app.js";

const PORT = process.env.PORT || 8080;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Recoup API listening on port ${PORT}`);
});
