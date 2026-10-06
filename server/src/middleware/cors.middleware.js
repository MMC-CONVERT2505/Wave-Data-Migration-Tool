import cors from "cors";
import waveConfig from "../config/wave.config.js";

export default cors({
  origin: waveConfig.CLIENT_ORIGIN,
  credentials: true,
});