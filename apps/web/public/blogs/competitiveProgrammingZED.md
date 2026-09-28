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
"""A CPH-compatible local test runner with a debugging-friendly CLI."""

from __future__ import annotations

import argparse
import json
import random
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
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

    exact = []
    for path in candidates:
        try:
            data = json.loads(path.read_text())
            if Path(data.get("srcPath", "")).name == source.name:
                exact.append(path)
        except (OSError, json.JSONDecodeError):
            continue
    return exact[-1] if exact else candidates[-1]


def compact(value: str, limit: int = 500) -> str:
    value = value.replace("\r\n", "\n").strip()
    if len(value) <= limit:
        return value or "<empty>"
    return value[:limit] + f"\n... ({len(value) - limit} more chars)"


def stream(label: str, value: str, limit: int, ansi: str) -> str:
    """Format a captured stream, coloring its label and contents together."""
    return color(ansi, f"    {label}: {compact(value, limit)}")


def parse_selector(value: str) -> list[int]:
    """Parse selectors such as ``1,3-5`` into sorted, unique testcase numbers."""
    numbers: set[int] = set()
    for part in value.replace(" ", "").split(","):
        if not part:
            raise argparse.ArgumentTypeError("empty testcase selector")
        try:
            if "-" in part:
                start_text, end_text = part.split("-", 1)
                start, end = int(start_text), int(end_text)
                if start < 1 or end < start:
                    raise ValueError
                numbers.update(range(start, end + 1))
            else:
                number = int(part)
                if number < 1:
                    raise ValueError
                numbers.add(number)
        except ValueError as error:
            raise argparse.ArgumentTypeError(
                f"invalid testcase selector {value!r}; use N, N,M or N-M"
            ) from error
    return sorted(numbers)


def selected_numbers(total: int, includes: list[list[int]], excludes: list[list[int]]) -> list[int]:
    selected = set(range(1, total + 1))
    if includes:
        selected &= {number for group in includes for number in group}
    selected -= {number for group in excludes for number in group}
    return sorted(selected)


def run_case(binary: Path, test: dict, timeout_ms: int) -> tuple[str, float, str, str, str]:
    started = time.perf_counter()
    try:
        result = subprocess.run(
            [str(binary)],
            input=test.get("input", ""),
            text=True,
            capture_output=True,
            timeout=timeout_ms / 1000,
            check=False,
        )
        elapsed = (time.perf_counter() - started) * 1000
        actual = result.stdout
        if result.returncode != 0:
            return "RTE", elapsed, actual, test.get("output", ""), result.stderr
        expected = test.get("output", "")
        if actual.strip().split() == expected.strip().split():
            return "AC", elapsed, actual, expected, result.stderr
        return "WA", elapsed, actual, expected, result.stderr
    except subprocess.TimeoutExpired as error:
        elapsed = (time.perf_counter() - started) * 1000
        output = error.stdout or ""
        if isinstance(output, bytes):
            output = output.decode(errors="replace")
        return "TLE", elapsed, output, test.get("output", ""), f"limit: {timeout_ms} ms"


def interactive_prompt(results: list[dict], max_output: int) -> None:
    """Inspect captured streams without rerunning the solution."""
    if not results:
        return
    print("\nInteractive testcase view (the normal summary is already above).")
    print("Commands: [a]ll, [i/e/o/d] N, [s]ummary, [q]uit")
    print("  i=input  e=expected  o=received stdout  d=debug stderr")
    while True:
        try:
            command = input("cp> ").strip().lower()
        except (EOFError, KeyboardInterrupt):
            print()
            return
        if command in {"q", "quit", "exit", ""}:
            return
        if command in {"s", "summary"}:
            for item in results:
                print(f"case {item['number']:<3} {item['status']:<3} {item['elapsed']:7.1f} ms")
            continue
        if command in {"a", "all"}:
            for item in results:
                print(color("1;36", f"\n--- case {item['number']} ({item['status']}) ---"))
                print(color("36", "input:\n" + compact(item["input"], max_output)))
                print(color("32", "expected:\n" + compact(item["expected"], max_output)))
                print(color("31", "received stdout:\n" + compact(item["actual"], max_output)))
                print(color("35", "debug stderr:\n" + compact(item["stderr"], max_output)))
            continue
        parts = command.split(maxsplit=1)
        if len(parts) != 2 or parts[0] not in {"i", "e", "o", "d"}:
            print("Use a, s, q, or one of i/e/o/d followed by a testcase number.")
            continue
        try:
            number = int(parts[1])
            item = next(item for item in results if item["number"] == number)
        except (ValueError, StopIteration):
            print("That testcase was not run.")
            continue
        key = {"i": "input", "e": "expected", "o": "actual", "d": "stderr"}[parts[0]]
        label = {"i": "input", "e": "expected", "o": "received stdout", "d": "debug stderr"}[parts[0]]
        ansi = {"i": "36", "e": "32", "o": "31", "d": "35"}[parts[0]]
        print(color(ansi, f"case {number} {label}:\n{compact(item[key], max_output)}"))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Compile and run CPH .prob testcases for a C++ solution.",
        epilog=(
            "Examples: --case 1,4-6 | --skip 2 --stop-on-fail | "
            "--show-all --sanitize address,undefined"
        ),
    )
    parser.add_argument("source", type=Path, help="solution file, e.g. Problems/A.cpp")
    selection = parser.add_argument_group("testcase selection")
    selection.add_argument(
        "-n", "--case", "--cases", dest="cases", action="append", type=parse_selector,
        metavar="N[,M-N]", help="run selected testcase(s); repeatable (default: all)",
    )
    selection.add_argument(
        "--skip", action="append", type=parse_selector, default=[], metavar="N[,M-N]",
        help="skip testcase(s); repeatable",
    )
    selection.add_argument("--list", action="store_true", help="list testcase numbers and sizes, then exit")
    selection.add_argument("--shuffle", action="store_true", help="randomize selected testcase order")
    selection.add_argument("--seed", type=int, help="random seed for --shuffle (default: random)")
    selection.add_argument("--limit", type=int, metavar="N", help="run at most N selected testcases")
    selection.add_argument("--stop-on-fail", action="store_true", help="stop after the first WA, RTE, or TLE")

    display = parser.add_argument_group("output and diagnostics")
    display.add_argument("-q", "--quiet", action="store_true", help="print only the final summary")
    display.add_argument("-v", "--verbose", action="store_true", help="show command, testcase details, and stderr")
    display.add_argument("--show-all", action="store_true", help="show input, expected, received, and stderr for every case")
    display.add_argument("--show-input", action="store_true", help="show testcase input")
    display.add_argument("--show-expected", action="store_true", help="show expected output")
    display.add_argument("--show-output", action="store_true", help="show received output")
    display.add_argument("--show-stderr", action="store_true", help="show program stderr")
    display.add_argument("--max-output", type=int, default=500, metavar="CHARS", help="truncate displayed streams (default: 500)")
    display.add_argument("--no-color", action="store_true", help="disable ANSI colors")
    display.add_argument("--interactive", action="store_true", help="open the testcase inspection prompt after running")
    display.add_argument("--no-interactive", action="store_true", help="never open the testcase inspection prompt")

    compile_group = parser.add_argument_group("compilation and execution")
    compile_group.add_argument("--compiler", default="g++", help="compiler executable (default: g++)")
    compile_group.add_argument("--std", default="c++17", help="C++ language standard (default: c++17)")
    compile_group.add_argument("--opt", default="-O2", help="optimization flag, e.g. -O0 or -O2")
    compile_group.add_argument("--flag", action="append", default=[], help="extra compiler flag; repeatable")
    compile_group.add_argument("--sanitize", metavar="LIST", help="enable sanitizers, e.g. address,undefined")
    compile_group.add_argument("--timeout", type=int, metavar="MS", help="per-test timeout in milliseconds")
    compile_group.add_argument("--compile-only", action="store_true", help="compile without running testcases")
    compile_group.add_argument("--keep-binary", action="store_true", help="keep the compiled binary and print its path")
    return parser


def main() -> int:
    argv = sys.argv[1:]
    if argv and argv[0] == "run":
        argv = argv[1:]
    parser = build_parser()
    args = parser.parse_args(argv)

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
    if shutil.which(args.compiler) is None:
        print(color("31", f"error: compiler not found: {args.compiler}"), file=sys.stderr)
        return 2

    try:
        prob_path = find_prob(source)
        problem = json.loads(prob_path.read_text())
    except (FileNotFoundError, json.JSONDecodeError, OSError) as error:
        print(color("31", f"error: {error}"), file=sys.stderr)
        return 2

    all_tests = problem.get("tests", [])
    if not all_tests:
        print(color("33", f"no testcases in {prob_path}"), file=sys.stderr)
        return 2
    if args.list:
        print(f"{problem.get('name') or source.stem}: {len(all_tests)} testcase(s)")
        for number, test in enumerate(all_tests, 1):
            input_size = len(test.get("input", "").encode())
            output_size = len(test.get("output", "").encode())
            print(f"  case {number:<3} input {input_size:>6} bytes  expected {output_size:>6} bytes")
        return 0

    numbers = selected_numbers(len(all_tests), args.cases or [], args.skip)
    invalid = [number for number in numbers if number > len(all_tests)]
    requested = [number for group in (args.cases or []) for number in group]
    invalid += [number for number in requested if number > len(all_tests)]
    if invalid:
        print(color("31", f"error: testcase must be between 1 and {len(all_tests)}"), file=sys.stderr)
        return 2
    if args.shuffle:
        random.Random(args.seed).shuffle(numbers)
    if args.limit is not None:
        if args.limit < 1:
            print(color("31", "error: --limit must be positive"), file=sys.stderr)
            return 2
        numbers = numbers[: args.limit]
    if not numbers:
        print(color("33", "no testcases selected (check --case and --skip)"), file=sys.stderr)
        return 2

    timeout_ms = args.timeout or problem.get("timeLimit", 2000)
    sanitize_flags = []
    if args.sanitize:
        sanitize_flags = [f"-fsanitize={item.strip()}" for item in args.sanitize.split(",") if item.strip()]
    compile_command = [args.compiler, f"-std={args.std}", args.opt, "-pipe", "-Wall", *sanitize_flags, *args.flag]
    title = str(problem.get("name") or source.stem).replace("\r", " ").replace("\n", " ").strip()
    show = args.show_all or args.verbose
    show_input = show or args.show_input
    show_expected = show or args.show_expected
    show_output = show or args.show_output
    show_stderr = show or args.show_stderr

    # Keep the heading unindented and on its own line. This also prevents a
    # problem title containing a newline from making the terminal look broken.
    print(color("1;36", title))
    print(color("2", f"problem: {prob_path.parent.parent}"))
    if not args.quiet:
        print(f"selected {len(numbers)}/{len(all_tests)} case(s), timeout {timeout_ms} ms")

    temp_context = tempfile.TemporaryDirectory(prefix="cp-run-")
    temp_dir = Path(temp_context.name)
    binary = temp_dir / "solution"
    command = [*compile_command, str(source), "-o", str(binary)]
    if args.verbose:
        print("  compile:", " ".join(command))
    compile_result = subprocess.run(command, text=True, capture_output=True, check=False)
    if compile_result.returncode != 0:
        print(color("31", "COMPILE ERROR"))
        print(compile_result.stderr.rstrip())
        temp_context.cleanup()
        return 1
    if args.compile_only:
        print(color("32", "COMPILE OK"))
        if args.keep_binary:
            kept = Path.cwd() / f"{source.stem}.debug"
            shutil.copy2(binary, kept)
            print(f"  binary: {kept}")
        temp_context.cleanup()
        return 0

    passed = 0
    executed = 0
    results: list[dict] = []
    try:
        for number in numbers:
            executed += 1
            test = all_tests[number - 1]
            status, elapsed, actual, expected, stderr = run_case(binary, test, timeout_ms)
            result_info = {
                "number": number,
                "status": status,
                "elapsed": elapsed,
                "input": test.get("input", ""),
                "expected": expected,
                "actual": actual,
                "stderr": stderr,
            }
            results.append(result_info)
            if status == "AC":
                passed += 1
                status_text = color("32", "✓ AC")
            elif status == "WA":
                status_text = color("31", "✗ WA")
            elif status == "TLE":
                status_text = color("33", "⏱ TLE")
            else:
                status_text = color("31", "✗ RTE")
            if not args.quiet:
                print(f"  {status_text}  case {number:<3} {elapsed:7.1f} ms")
            failed = status != "AC"
            if failed or stderr or show_input or show_expected or show_output or show_stderr:
                if show_input or failed:
                    print(stream("input", test.get("input", ""), args.max_output, "36"))
                if status == "WA" and (show_expected or failed):
                    print(stream("expected", expected, args.max_output, "32"))
                if show_output or (failed and status == "WA"):
                    print(stream("received", actual, args.max_output, "31"))
                if show_stderr or (failed and status in ("RTE", "TLE")):
                    print(stream("debug (stderr)", stderr, args.max_output, "35"))
                elif stderr and not args.quiet:
                    # cerr is deliberately separate from the judged stdout.
                    print(stream("debug (stderr)", stderr, args.max_output, "35"))
            if failed and args.stop_on_fail:
                break
    finally:
        if args.keep_binary:
            kept = Path.cwd() / f"{source.stem}.debug"
            shutil.copy2(binary, kept)
            print(f"  binary: {kept}")
        temp_context.cleanup()

    all_passed = passed == executed and executed == len(numbers)
    if all_passed:
        print(color("32", f"\nPASS  {passed}/{executed}"))
    else:
        print(color("31", f"\nFAIL  {passed}/{executed} (selected {len(numbers)})"))

    # Task terminals are the primary interface for this runner, so the
    # inspection prompt is on by default. On a non-interactive pipe, input()
    # receives EOF and returns immediately; --no-interactive is still useful
    # for scripts and CI.
    interactive = (args.interactive or not args.no_interactive) and not args.quiet
    if interactive:
        interactive_prompt(results, args.max_output)
    return 0 if all_passed else 1


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
