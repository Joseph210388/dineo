import { listStaffPosts } from "../../../backend/actions/blog";
import BlogBoard from "../../../components/staff/blog-board";

export default async function StaffBlogPage() {
  const posts = await listStaffPosts();
  return <BlogBoard posts={posts} />;
}
