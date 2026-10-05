import http from "node:http";
import os from "node:os";

// Display designed dev banner once servers are ready (no auto-open)
const isDev = process.env.NODE_ENV !== "production" && !process.argv.includes("build");
if (isDev && !process.env.__DEV_BANNER_PRINTED) {
	process.env.__DEV_BANNER_PRINTED = "true";

	const portIndex = process.argv.findIndex((arg) => arg === "-p" || arg === "--port");
	const port = portIndex !== -1 && process.argv[portIndex + 1] ? process.argv[portIndex + 1] : (process.env.PORT || 3000);

	const getNetworkIp = () => {
		const nets = os.networkInterfaces();
		for (const name of Object.keys(nets)) {
			for (const net of nets[name] || []) {
				if (net.family === "IPv4" && !net.internal && !net.address.startsWith("169.254.")) {
					return net.address;
				}
			}
		}
		return null;
	};

	let attempts = 0;
	const maxAttempts = 60;

	const printBanner = () => {
		try {
			const networkIp = getNetworkIp();
			const localUrl = `http://localhost:${port}`;
			const networkUrl = networkIp ? `http://${networkIp}:${port}` : null;
			const apiUrl = "http://localhost:8000";
			const docsUrl = "http://localhost:8000/docs";

			// ANSI formatting tokens
			const c = {
				reset: "\x1b[0m",
				bold: "\x1b[1m",
				dim: "\x1b[2m",
				cyan: "\x1b[36m",
				green: "\x1b[32m",
				yellow: "\x1b[33m",
				gray: "\x1b[90m",
				white: "\x1b[37m"
			};

			const width = 66;
			const stripAnsi = (str) => str.replace(/\x1b\[[0-9;]*m/g, "");

			const topBorder = "  " + c.cyan + "┌" + "─".repeat(width - 2) + "┐" + c.reset;
			const midBorder = "  " + c.cyan + "├" + "─".repeat(width - 2) + "┤" + c.reset;
			const botBorder = "  " + c.cyan + "└" + "─".repeat(width - 2) + "┘" + c.reset;

			const row = (text = "") => {
				const visibleLen = stripAnsi(text).length;
				const padding = Math.max(0, width - 4 - visibleLen);
				return "  " + c.cyan + "│" + c.reset + " " + text + " ".repeat(padding) + " " + c.cyan + "│" + c.reset;
			};

			const lines = [
				"",
				topBorder,
				row(),
				row("  " + c.bold + c.white + "Steganographer" + c.reset),
				row("  " + c.dim + "Secure Image Steganography & Cryptography Platform" + c.reset),
				row(),
				midBorder,
				row(),
				row("  " + c.bold + c.green + "Local:    " + c.reset + c.cyan + localUrl + c.reset),
				...(networkUrl ? [row("  " + c.bold + c.green + "Network:  " + c.reset + c.cyan + networkUrl + c.reset)] : []),
				row(),
				row("  " + c.dim + "API:      " + c.reset + c.white + apiUrl + c.reset),
				row("  " + c.dim + "API Docs: " + c.reset + c.white + docsUrl + c.reset),
				row(),
				midBorder,
				row(),
				row("  " + c.dim + "Ready for secure steganography. Press " + c.reset + c.yellow + "Ctrl+C" + c.reset + c.dim + " to stop." + c.reset),
				row(),
				botBorder,
				""
			];

			process.stdout.write(lines.join("\n") + "\n");
		} catch (err) {
			console.error("[dev-banner] Error displaying banner:", err);
		}
	};

	const checkAndPrint = () => {
		attempts++;
		const req = http.get(`http://127.0.0.1:${port}`, (res) => {
			res.resume();
			setTimeout(printBanner, 800);
		});

		req.on("error", () => {
			if (attempts < maxAttempts) {
				setTimeout(checkAndPrint, 400);
			}
		});
	};

	setTimeout(checkAndPrint, 800);
}

/** @type {import("next").NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	agentRules: false,
	images: {
		remotePatterns: [
			{
				protocol: "http",
				hostname: "localhost",
				port: "8000",
				pathname: "/**"
			},
			{
				protocol: "http",
				hostname: "localhost",
				port: "3000",
				pathname: "/**"
			},
			{
				protocol: "http",
				hostname: "127.0.0.1",
				port: "8000",
				pathname: "/**"
			}
		]
	},
	rewrites: async () => [
		{
			source: "/api/:path*",
			destination: `http://localhost:8000/:path*`
		}
	]
};

export default nextConfig;

