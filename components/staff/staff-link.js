import Link from "next/link";

export default function StaffLink({ prefetch = false, ...props }) {
  return <Link prefetch={prefetch} {...props} />;
}
