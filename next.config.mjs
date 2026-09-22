/** @type {import('next').NextConfig} */
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

const supabaseHost = (() => {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  try {
    return raw ? new URL(raw).hostname : "tpyygppuszvhpupnvmxp.supabase.co";
  } catch {
    return "tpyygppuszvhpupnvmxp.supabase.co";
  }
})();

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
