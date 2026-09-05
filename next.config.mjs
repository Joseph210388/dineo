/** @type {import('next').NextConfig} */
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

const nextConfig = {};

export default nextConfig;
