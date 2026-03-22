import os
from pathlib import Path
from dataclasses import dataclass
import shutil

@dataclass
class FileRef:
    id: str
    url: str  # In local mode, this is the relative path from the curriculum root

class LocalAdapter:
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def create_dir(self, name: str) -> Path:
        path = self.base_dir / name
        path.mkdir(parents=True, exist_ok=True)
        return path

    def write_file(self, rel_path: str, content: str) -> FileRef:
        """Write content to a file and return a FileRef."""
        full_path = self.base_dir / rel_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Clean up any potential markdown code blocks if they were accidentally included by LLM
        clean_content = content.strip()
        if clean_content.startswith("```markdown"):
            clean_content = clean_content.removeprefix("```markdown").removesuffix("```").strip()
        elif clean_content.startswith("```"):
            clean_content = clean_content.removeprefix("```").removesuffix("```").strip()

        full_path.write_text(clean_content, encoding="utf-8")
        
        # For local, 'id' is the filename, 'url' is the relative path
        return FileRef(id=rel_path, url=rel_path)

    def exists(self, rel_path: str) -> bool:
        return (self.base_dir / rel_path).exists()
