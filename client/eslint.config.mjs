import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    ignores: [
      ".next/**",
      ".yarn/**",
      "node_modules/**",
      "next-env.d.ts",
      "eslint.config.mjs"
    ]
  }
];
