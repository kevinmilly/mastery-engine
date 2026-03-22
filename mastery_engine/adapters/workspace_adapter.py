"""
Google Workspace adapter using the official Google API Python client.
Auth: OAuth2 user credentials via ~/.mastery-engine/oauth-client.json
      Token cached at ~/.mastery-engine/oauth-token.json after first login.
"""
import os
from dataclasses import dataclass
from pathlib import Path

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow

from mastery_engine.retry import FatalError, RetryableError

SCOPES = [
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

_CONFIG_DIR = Path.home() / ".mastery-engine"
_CLIENT_FILE = _CONFIG_DIR / "oauth-client.json"
_TOKEN_FILE = _CONFIG_DIR / "oauth-token.json"

# Google Drive folder where all files will be created
DRIVE_FOLDER_ID = "1ctT7lQgEXlt2jO7tIi0gmNvxwQ-z4YJG"


def _credentials():
    if not _CLIENT_FILE.exists():
        raise FatalError(
            f"OAuth client file not found at {_CLIENT_FILE}. "
            "Download it from Google Cloud Console > APIs & Services > Credentials."
        )

    creds = None

    # Load cached token if available
    if _TOKEN_FILE.exists():
        try:
            creds = Credentials.from_authorized_user_file(str(_TOKEN_FILE), SCOPES)
        except Exception:
            creds = None

    # Refresh or re-authorize
    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
        except Exception:
            creds = None  # Force re-auth

    if not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_secrets_file(str(_CLIENT_FILE), SCOPES)
        creds = flow.run_local_server(port=0, open_browser=True)
        _TOKEN_FILE.write_text(creds.to_json(), encoding="utf-8")

    return creds


def _handle_http_error(e: HttpError, context: str) -> None:
    msg = str(e)
    if e.status_code in (401, 403):
        raise FatalError(f"Google API auth/permission error during {context}: {msg}")
    raise RetryableError(f"Google API error during {context} (HTTP {e.status_code}): {msg}")


@dataclass
class DocRef:
    id: str
    url: str


@dataclass
class SpreadsheetRef:
    id: str
    url: str
    title: str


class WorkspaceAdapter:

    def __init__(self):
        creds = _credentials()
        self._docs = build("docs", "v1", credentials=creds, cache_discovery=False)
        self._sheets = build("sheets", "v4", credentials=creds, cache_discovery=False)
        self._drive = build("drive", "v3", credentials=creds, cache_discovery=False)

    # ── Docs ──────────────────────────────────────────────────────────────────

    def create_doc(self, title: str) -> DocRef:
        try:
            meta = {
                "name": title,
                "mimeType": "application/vnd.google-apps.document",
                "parents": [DRIVE_FOLDER_ID],
            }
            f = self._drive.files().create(body=meta, fields="id,webViewLink").execute()
        except HttpError as e:
            _handle_http_error(e, f"create_doc({title!r})")
        doc_id = f["id"]
        return DocRef(
            id=doc_id,
            url=f["webViewLink"],
        )

    def write_doc(self, doc_id: str, content: str) -> None:
        """Append plain text content to a document."""
        requests = [{"insertText": {"location": {"index": 1}, "text": content}}]
        try:
            self._docs.documents().batchUpdate(
                documentId=doc_id,
                body={"requests": requests},
            ).execute()
        except HttpError as e:
            _handle_http_error(e, f"write_doc({doc_id})")

    # ── Spreadsheets ──────────────────────────────────────────────────────────

    def create_spreadsheet(self, title: str) -> SpreadsheetRef:
        try:
            meta = {
                "name": title,
                "mimeType": "application/vnd.google-apps.spreadsheet",
                "parents": [DRIVE_FOLDER_ID],
            }
            f = self._drive.files().create(body=meta, fields="id,webViewLink").execute()
        except HttpError as e:
            _handle_http_error(e, f"create_spreadsheet({title!r})")
        sid = f["id"]
        return SpreadsheetRef(
            id=sid,
            url=f["webViewLink"],
            title=title,
        )

    def add_sheet(self, spreadsheet_id: str, title: str) -> None:
        try:
            self._sheets.spreadsheets().batchUpdate(
                spreadsheetId=spreadsheet_id,
                body={"requests": [{"addSheet": {"properties": {"title": title}}}]},
            ).execute()
        except HttpError as e:
            _handle_http_error(e, f"add_sheet({title!r})")

    def _sheet_id(self, spreadsheet_id: str, sheet_title: str) -> int:
        """Resolve a sheet tab title to its numeric sheetId."""
        try:
            meta = self._sheets.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
        except HttpError as e:
            _handle_http_error(e, f"get_spreadsheet({spreadsheet_id})")
        for s in meta.get("sheets", []):
            if s["properties"]["title"] == sheet_title:
                return s["properties"]["sheetId"]
        raise FatalError(f"Sheet tab {sheet_title!r} not found in spreadsheet {spreadsheet_id}")

    def batch_update_cells(self, spreadsheet_id: str, updates: list[tuple[str, str, str]]) -> None:
        """Write multiple cells in one API call. Each update is (sheet, range, value)."""
        data = [
            {"range": f"{sheet}!{range_}", "values": [[value]]}
            for sheet, range_, value in updates
        ]
        try:
            self._sheets.spreadsheets().values().batchUpdate(
                spreadsheetId=spreadsheet_id,
                body={"valueInputOption": "USER_ENTERED", "data": data},
            ).execute()
        except HttpError as e:
            _handle_http_error(e, "batch_update_cells")

    def update_cell(self, spreadsheet_id: str, sheet: str, range_: str, value: str) -> None:
        try:
            self._sheets.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range=f"{sheet}!{range_}",
                valueInputOption="USER_ENTERED",
                body={"values": [[value]]},
            ).execute()
        except HttpError as e:
            _handle_http_error(e, f"update_cell({sheet}!{range_})")

    def update_cell_hyperlink(
        self,
        spreadsheet_id: str,
        sheet: str,
        range_: str,
        url: str,
        label: str = "Open",
    ) -> None:
        formula = f'=HYPERLINK("{url}","{label}")'
        self.update_cell(spreadsheet_id, sheet, range_, formula)

    def set_checkbox_validation(self, spreadsheet_id: str, sheet: str, range_: str) -> None:
        sheet_id = self._sheet_id(spreadsheet_id, sheet)
        start_col, end_col, start_row, end_row = _parse_range(range_)
        try:
            self._sheets.spreadsheets().batchUpdate(
                spreadsheetId=spreadsheet_id,
                body={"requests": [{
                    "setDataValidation": {
                        "range": {
                            "sheetId": sheet_id,
                            "startRowIndex": start_row,
                            "endRowIndex": end_row,
                            "startColumnIndex": start_col,
                            "endColumnIndex": end_col,
                        },
                        "rule": {"condition": {"type": "BOOLEAN"}, "strict": True},
                    }
                }]},
            ).execute()
        except HttpError as e:
            _handle_http_error(e, f"set_checkbox_validation({sheet}!{range_})")

    def bold_row(self, spreadsheet_id: str, sheet: str, row: int) -> None:
        sheet_id = self._sheet_id(spreadsheet_id, sheet)
        row_idx = row - 1  # convert 1-based to 0-based
        try:
            self._sheets.spreadsheets().batchUpdate(
                spreadsheetId=spreadsheet_id,
                body={"requests": [{
                    "repeatCell": {
                        "range": {
                            "sheetId": sheet_id,
                            "startRowIndex": row_idx,
                            "endRowIndex": row_idx + 1,
                        },
                        "cell": {"userEnteredFormat": {"textFormat": {"bold": True}}},
                        "fields": "userEnteredFormat.textFormat.bold",
                    }
                }]},
            ).execute()
        except HttpError as e:
            _handle_http_error(e, f"bold_row({sheet}, row={row})")

    def freeze_row(self, spreadsheet_id: str, sheet: str, rows: int = 1) -> None:
        sheet_id = self._sheet_id(spreadsheet_id, sheet)
        try:
            self._sheets.spreadsheets().batchUpdate(
                spreadsheetId=spreadsheet_id,
                body={"requests": [{
                    "updateSheetProperties": {
                        "properties": {
                            "sheetId": sheet_id,
                            "gridProperties": {"frozenRowCount": rows},
                        },
                        "fields": "gridProperties.frozenRowCount",
                    }
                }]},
            ).execute()
        except HttpError as e:
            _handle_http_error(e, f"freeze_row({sheet}, rows={rows})")

    # ── Doctor check ──────────────────────────────────────────────────────────

    def check(self) -> tuple[bool, str]:
        try:
            creds = _credentials()
            sheets = build("sheets", "v4", credentials=creds, cache_discovery=False)
            sheets.spreadsheets().get(spreadsheetId="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms").execute()
        except FatalError as e:
            return False, str(e)
        except HttpError as e:
            if e.status_code == 404:
                # 404 means auth worked (spreadsheet just doesn't exist) — that's fine
                return True, "Google Workspace: service account connected"
            if e.status_code in (401, 403):
                return False, f"Google Workspace auth error: {e}"
            return True, "Google Workspace: service account connected (probe inconclusive)"
        except Exception as e:
            return False, f"Google Workspace check failed: {e}"
        return True, "Google Workspace: service account connected"


# ── Range parsing helper ───────────────────────────────────────────────────────

def _col_to_idx(col: str) -> int:
    """Convert column letter(s) to 0-based index. 'A'→0, 'B'→1, 'AA'→26."""
    result = 0
    for ch in col.upper():
        result = result * 26 + (ord(ch) - ord("A") + 1)
    return result - 1


def _parse_range(range_: str):
    """
    Parse a range like 'A2:A30' or 'B2' into
    (start_col, end_col, start_row, end_row) as 0-based indices.
    """
    import re
    m = re.fullmatch(r"([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?", range_.upper())
    if not m:
        raise FatalError(f"Cannot parse range: {range_!r}")
    c1, r1, c2, r2 = m.groups()
    start_col = _col_to_idx(c1)
    start_row = int(r1) - 1
    end_col = _col_to_idx(c2) + 1 if c2 else start_col + 1
    end_row = int(r2) if r2 else start_row + 1
    return start_col, end_col, start_row, end_row
