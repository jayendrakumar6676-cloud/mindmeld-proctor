import { spawn } from "node:child_process";

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

console.log("Starting production preview...");
console.log("Open: http://localhost:8080");

run("api", "node", ["server/index.js"]);
run("web", "vite", ["preview", "--host", "0.0.0.0", "--port", "8080"]);