# Setting up Competitive Programming on the ZED IDE
Right now, ZED doesn't support extensions with a GUI, hence there doesn't exist any CPH extension on it, unlike VS Code.

To set it all up easily for me, I had to use the power of ZED tasks.

## A bit about my setup
So, I have a `CompetitiveProgramming` directory, which is also on github. I use the `Problems` directory within it, for the problems though.

The way it works is simple. I have 2 scripts. One starts the server, and reads PORT 10043. I have ZED tasks setup through which I run them, and on receiving the testcase and the question, they quickly, create the testcase file in the .cph folder, in the exact same format as the CPH extension (kept it to maintain backwards compatibility with it, in case I need to use it on VS Code again), before opening the file. (I do it by opening the file in zed via the terminal. This has the added bonus of directly switching to the zed app too, with the file open)

Then, If i want to run the testcases, I simply use the terminal to display everything that I need to see, as I don't have the option to use the GUI for extensions.

## Codes

`./cpserve.py`
```python
#!/usr/bin/env python3
"""Receive Competitive Companion problems and save them as CPH .prob files."""

from __future__ import annotations

from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import hashlib
import json
from pathlib import Path
import os
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parent
PORT = 10043
ZED_COMMAND = shutil.which("zeditor") or shutil.which("zed") or "/usr/bin/zeditor"


def source_and_prob(problem: dict) -> tuple[Path, Path]:
    source_path = str(problem.get("srcPath", ""))
    filename = Path(source_path.replace("\\", "/")).name
    if not filename:
        safe_name = problem.get("name", "problem").replace("/", "_")
        filename = safe_name + ".cpp"

    # Prefer the source file already present in this repository.
    matches = sorted(ROOT.rglob(filename))
    source = next((p for p in matches if ".cph" not in p.parts), None)
    if source is None:
        source = Path(os.environ.get("CP_PROBLEM_DIR", str(Path.cwd()))) / filename

    digest = hashlib.md5(source_path.encode()).hexdigest()
    prob = source.parent / ".cph" / f".{filename}_{digest}.prob"
    return source, prob


class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self) -> None:
        try:
            length = int(self.headers.get("Content-Length", "0"))
            problem = json.loads(self.rfile.read(length))
            if not isinstance(problem, dict) or not problem.get("tests"):
                raise ValueError("payload does not contain a problem with tests")
            source, path = source_and_prob(problem)
            source.parent.mkdir(parents=True, exist_ok=True)
            if not source.exists():
                source.touch()
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(problem, separators=(",", ":")) + "\n")
            if Path(ZED_COMMAND).exists():
                subprocess.Popen(
                    [ZED_COMMAND, str(source.resolve())],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    start_new_session=True,
                )
            message = f"saved {len(problem['tests'])} testcase(s): {path.relative_to(ROOT)}"
            print(message, flush=True)
            print(f"opened: {source.relative_to(ROOT)}", flush=True)
            self.reply(200, message)
        except (ValueError, json.JSONDecodeError, OSError) as error:
            self.reply(400, f"error: {error}")

    def reply(self, status: int, message: str) -> None:
        body = (message + "\n").encode()
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: object) -> None:
        return


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"Competitive Companion receiver listening on http://127.0.0.1:{PORT}", flush=True)
    print(f"Repository: {ROOT}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")
    finally:
        server.server_close()
```

`./cpserve`
```bash
#!/bin/sh
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
exec python3 "$SCRIPT_DIR/cpserve.py" "$@"
```

`./cp.py`
```python
#!/usr/bin/env python3
"""Small CPH-compatible local test runner for this repository."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time

ROOT = Path(__file__).resolve().parent

# ANSI colors are disabled automatically when output is redirected.
USE_COLOR = sys.stdout.isatty()


def color(code: str, text: str) -> str:
    return f"\033[{code}m{text}\033[0m" if USE_COLOR else text


def find_prob(source: Path) -> Path:
    candidates = sorted(ROOT.rglob(f".cph/.{source.name}_*.prob"))
    if not candidates:
        raise FileNotFoundError(
            f"No CPH testcase file found for {source.name}.\n"
            f"Expected: <some directory>/.cph/.{source.name}_<hash>.prob"
        )

    # If there are duplicates, prefer one whose stored srcPath points at this file.
    exact = []
    for path in candidates:
        try:
            data = json.loads(path.read_text())
            stored = Path(data.get("srcPath", "")).name
            if stored == source.name:
                exact.append(path)
        except (OSError, json.JSONDecodeError):
            continue
    return exact[-1] if exact else candidates[-1]


def compact(value: str, limit: int = 500) -> str:
    value = value.replace("\r\n", "\n").strip()
    if len(value) <= limit:
        return value
    return value[:limit] + f"\n... ({len(value) - limit} more chars)"


def run_case(binary: Path, test: dict, timeout_ms: int) -> tuple[str, float, str, str]:
    started = time.perf_counter()
    try:
        result = subprocess.run(
            [str(binary)],
            input=test.get("input", ""),
            text=True,
            capture_output=True,
            timeout=timeout_ms / 1000,
        )
        elapsed = (time.perf_counter() - started) * 1000
        actual = result.stdout
        if result.returncode != 0:
            return "RTE", elapsed, actual, result.stderr
        expected = test.get("output", "")
        if actual.strip().split() == expected.strip().split():
            return "AC", elapsed, actual, ""
        return "WA", elapsed, actual, expected
    except subprocess.TimeoutExpired as error:
        elapsed = (time.perf_counter() - started) * 1000
        return "TLE", elapsed, error.stdout or "", f"limit: {timeout_ms} ms"


def main() -> int:
    # Both `python3 cp.py file.cpp` and the more discoverable
    # `python3 cp.py run file.cpp` are accepted.
    if len(sys.argv) > 1 and sys.argv[1] == "run":
        del sys.argv[1]

    parser = argparse.ArgumentParser(
        description="Run CPH .prob testcases for a C++ solution."
    )
    parser.add_argument("source", type=Path, help="solution file, e.g. Problems/A.cpp")
    parser.add_argument("-n", "--case", type=int, help="run only testcase N (1-based)")
    parser.add_argument("--no-color", action="store_true", help="disable ANSI colors")
    parser.add_argument("--timeout", type=int, help="override per-test timeout in ms")
    args = parser.parse_args()

    global USE_COLOR
    USE_COLOR = USE_COLOR and not args.no_color

    source = args.source if args.source.is_absolute() else ROOT / args.source
    source = source.resolve()
    if not source.is_file():
        print(color("31", f"error: source not found: {args.source}"), file=sys.stderr)
        return 2
    if source.suffix != ".cpp":
        print(color("31", "error: this runner currently supports .cpp files"), file=sys.stderr)
        return 2
    if shutil.which("g++") is None:
        print(color("31", "error: g++ is not installed or not on PATH"), file=sys.stderr)
        return 2

    try:
        prob_path = find_prob(source)
        problem = json.loads(prob_path.read_text())
    except (FileNotFoundError, json.JSONDecodeError, OSError) as error:
        print(color("31", f"error: {error}"), file=sys.stderr)
        return 2

    tests = problem.get("tests", [])
    if args.case is not None:
        if not 1 <= args.case <= len(tests):
            print(color("31", f"error: testcase must be between 1 and {len(tests)}"), file=sys.stderr)
            return 2
        tests = [tests[args.case - 1]]
        first_number = args.case
    else:
        first_number = 1

    if not tests:
        print(color("33", f"no testcases in {prob_path}"), file=sys.stderr)
        return 2

    timeout_ms = args.timeout or problem.get("timeLimit", 2000)
    title = problem.get("name") or source.stem
    print(f"{color('1;36', title)}  {color('2', f'[{prob_path.parent.parent}]')}")

    with tempfile.TemporaryDirectory(prefix="cp-run-") as temp_dir:
        binary = Path(temp_dir) / "solution"
        compile_result = subprocess.run(
            ["g++", "-std=c++17", "-O2", "-pipe", "-Wall", str(source), "-o", str(binary)],
            text=True,
            capture_output=True,
        )
        if compile_result.returncode != 0:
            print(color("31", "COMPILE ERROR"))
            print(compile_result.stderr.rstrip())
            return 1

        passed = 0
        for offset, test in enumerate(tests):
            number = first_number + offset
            status, elapsed, actual, detail = run_case(binary, test, timeout_ms)
            if status == "AC":
                passed += 1
                status_text = color("32", "✓ AC")
            elif status == "WA":
                status_text = color("31", "✗ WA")
            elif status == "TLE":
                status_text = color("33", "⏱ TLE")
            else:
                status_text = color("31", "✗ RTE")
            print(f"  {status_text}  case {number:<3} {elapsed:7.1f} ms")

            if status != "AC":
                print(color("2", "    input:  ") + compact(test.get("input", "")))
                if status == "WA":
                    print(color("2", "    expected:") + compact(detail))
                    print(color("2", "    received:") + compact(actual))
                elif detail:
                    print(color("2", "    details: ") + compact(detail))

        total = len(tests)
        if passed == total:
            print(color("32", f"\nPASS  {passed}/{total}"))
            return 0
        print(color("31", f"\nFAIL  {passed}/{total}"))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
```

`./cprun`
```
#!/bin/sh

# Run from any directory while keeping the repository-relative CPH lookup.
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

# Zed tasks can provide the currently active file as $ZED_FILE.
if [ -n "$ZED_FILE" ]; then
  case "${1:-}" in
    ""| -*) set -- "$ZED_FILE" "$@" ;;
  esac
fi

if [ "$#" -eq 0 ]; then
  echo "usage: cprun <solution.cpp> [options]" >&2
  echo "In Zed, run it as a task to use the active file automatically." >&2
  exit 2
fi

exec python3 "$SCRIPT_DIR/cp.py" "$@"
```

`./.zed/tasks.json` and `./Problems/.zed/task.json`
```json
[
  {
    "label": "Run current C++ solution",
    "command": "/home/darelife/prog/competitiveprogramming/cprun \"$ZED_FILE\"",
    "cwd": "$ZED_WORKTREE_ROOT",
    "reveal": "always",
    "use_new_terminal": false
  },
  {
    "label": "Start Competitive Companion receiver",
    "command": "/home/darelife/prog/competitiveprogramming/cpserve",
    "cwd": "$ZED_WORKTREE_ROOT",
    "reveal": "never",
    "use_new_terminal": false
  }
]
```
