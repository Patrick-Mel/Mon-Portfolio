import { getSettings } from "@/lib/data/content";
import { renderIcon } from "@/lib/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return renderIcon(await getSettings(), 180);
}
