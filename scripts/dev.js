import { spawn } from "node:child_process";

const portArgIndex = process.argv.findIndex((arg) => arg === "--port");
const port = portArgIndex >= 0 ? process.argv[portArgIndex + 1] || "8080" : "8080";

const children = [];

function run(name, command, args) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, FORCE_COLOR: "1" },
  });

  children.push(child);
  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${name} stopped with exit code ${code}`);
      shutdown(code);
    }
  });
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log("Starting XPay Exam Portal...");
console.log(`Frontend: http://localhost:${port}`);
console.log("API:      http://localhost:8787");

run("api", "node", ["server/index.js"]);
run("web", "vite", ["--host", "0.0.0.0", "--port", port]);