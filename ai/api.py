"""Simple REST API for FITAI AI service.

Uses only Python standard library — no Flask/FastAPI needed.
Run: python ai\api.py
Then visit: http://localhost:8000
"""

from __future__ import annotations

import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Any

from .service import FITAI
from .sample_dataset import (
    BEGINNER_USER,
    INTERMEDIATE_USER,
    ADVANCED_USER,
    HIGH_COMPLETION_HISTORY,
    LOW_COMPLETION_HISTORY,
    INCREASING_HISTORY,
    DECLINING_HISTORY,
    BEGINNER_HISTORY,
    INTERMEDIATE_HISTORY,
)

_ai = FITAI()

# Map of sample datasets for demo/test endpoints
SAMPLE_DATASETS = {
    "high_completion": HIGH_COMPLETION_HISTORY,
    "low_completion": LOW_COMPLETION_HISTORY,
    "increasing": INCREASING_HISTORY,
    "declining": DECLINING_HISTORY,
    "beginner": BEGINNER_HISTORY,
    "intermediate": INTERMEDIATE_HISTORY,
}

SAMPLE_USERS = {
    "beginner": BEGINNER_USER,
    "intermediate": INTERMEDIATE_USER,
    "advanced": ADVANCED_USER,
}


class _Handler(BaseHTTPRequestHandler):
    def _send(self, data: Any, status: int = 200):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _read_body(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        return json.loads(raw.decode("utf-8"))

    def do_GET(self):
        path = self.path.rstrip("/").split("?")[0]
        if path == "/health":
            self._send({"status": "ok", "service": "FITAI AI"})
        elif path == "/exercises":
            self._send(_ai.get_exercise_library())
        elif path == "/muscle-groups":
            self._send({"muscle_groups": _ai.get_available_muscle_groups()})
        elif path == "/equipment":
            self._send({"equipment": _ai.get_available_equipment()})
        elif path == "/difficulties":
            self._send({"difficulties": _ai.get_available_difficulties()})
        elif path == "/sample-datasets":
            self._send({"datasets": list(SAMPLE_DATASETS.keys())})
        elif path == "/sample-users":
            self._send({"users": list(SAMPLE_USERS.keys())})
        else:
            self._send({"error": "not found"}, 404)

    def do_POST(self):
        path = self.path.rstrip("/").split("?")[0]
        try:
            body = self._read_body()
        except Exception:
            self._send({"error": "invalid JSON"}, 400)
            return

        if path == "/generate-plan":
            user_profile = body.get("user_profile", body)
            result = _ai.generate_plan(user_profile)
            self._send(result)
        elif path == "/analyze-history":
            workouts = body.get("workouts", [])
            result = _ai.analyze_history(workouts)
            self._send(result)
        elif path == "/compute-progress":
            history = body.get("history", body)
            result = _ai.compute_progress(history)
            self._send(result)
        elif path == "/generate-insights":
            history = body.get("history", body)
            result = _ai.get_insights(history)
            self._send(result)
        elif path == "/adapt-plan":
            user_profile = body.get("user_profile", {})
            current_plan = body.get("current_plan", {})
            history = body.get("history", {})
            result = _ai.adapt_plan(user_profile, current_plan, history)
            self._send(result)
        elif path == "/demo/generate-plan":
            user_key = body.get("user", "beginner")
            user_profile = SAMPLE_USERS.get(user_key, BEGINNER_USER)
            result = _ai.generate_plan(user_profile)
            self._send(result)
        elif path == "/demo/analyze":
            dataset_key = body.get("dataset", "high_completion")
            history = SAMPLE_DATASETS.get(dataset_key, HIGH_COMPLETION_HISTORY)
            analysis = _ai.analyze_history(history["workouts"])
            self._send(analysis)
        elif path == "/demo/progress":
            dataset_key = body.get("dataset", "high_completion")
            history = SAMPLE_DATASETS.get(dataset_key, HIGH_COMPLETION_HISTORY)
            result = _ai.compute_progress(history)
            self._send(result)
        elif path == "/demo/insights":
            dataset_key = body.get("dataset", "high_completion")
            history = SAMPLE_DATASETS.get(dataset_key, HIGH_COMPLETION_HISTORY)
            result = _ai.get_insights(history)
            self._send(result)
        elif path == "/demo/adapt":
            user_key = body.get("user", "beginner")
            dataset_key = body.get("dataset", "high_completion")
            user_profile = SAMPLE_USERS.get(user_key, BEGINNER_USER)
            current_plan = _ai.generate_plan(user_profile)
            history = SAMPLE_DATASETS.get(dataset_key, HIGH_COMPLETION_HISTORY)
            result = _ai.adapt_plan(user_profile, current_plan, history)
            self._send(result)
        else:
            self._send({"error": "not found"}, 404)

    def log_message(self, format, *args):
        # Quiet logging
        pass


def run_server(host: str = "localhost", port: int = 8000):
    server = HTTPServer((host, port), _Handler)
    print(f"FITAI API running at http://{host}:{port}")
    print("Endpoints:")
    print("  GET  /health")
    print("  GET  /exercises")
    print("  GET  /muscle-groups")
    print("  GET  /equipment")
    print("  GET  /difficulties")
    print("  GET  /sample-datasets")
    print("  GET  /sample-users")
    print("  POST /generate-plan")
    print("  POST /analyze-history")
    print("  POST /compute-progress")
    print("  POST /generate-insights")
    print("  POST /adapt-plan")
    print("  POST /demo/generate-plan")
    print("  POST /demo/analyze")
    print("  POST /demo/progress")
    print("  POST /demo/insights")
    print("  POST /demo/adapt")
    server.serve_forever()


if __name__ == "__main__":
    run_server()