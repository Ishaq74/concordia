import { blogActions } from "./blog";
import { commentActions } from "./comments";

export const server = {
  blog: blogActions,
  ...commentActions,
};