import { getSettings } from "@/lib/data/content";
import { renderIcon } from "@/lib/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  return renderIcon(await getSettings(), 64);
}
