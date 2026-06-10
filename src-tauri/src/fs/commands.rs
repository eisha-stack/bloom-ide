use std::fs;

use tauri::{AppHandle, State};
use tauri_plugin_dialog::DialogExt;

use super::error::{CommandResult, FsError};
use super::scope::resolve_workspace_path;
use super::state::WorkspaceState;
use super::types::DirEntry;

/// Open a folder via native dialog and set it as the workspace root.
#[tauri::command]
pub async fn open_folder(app: AppHandle, state: State<'_, WorkspaceState>) -> CommandResult<Option<String>> {
    let picked = app
        .dialog()
        .file()
        .set_title("Open Folder")
        .pick_folder()
        .await;

    let Some(file_path) = picked else {
        return Ok(None);
    };

    let path = file_path
        .into_path()
        .map_err(|e| FsError::Dialog(e.to_string()))?;

    let canonical = path.canonicalize().map_err(FsError::Io)?;

    if !canonical.is_dir() {
        return Err(FsError::InvalidPath("selected path is not a directory".into()).into());
    }

    state.set_root(canonical.clone())?;

    Ok(Some(
        canonical
            .to_str()
            .ok_or_else(|| FsError::InvalidPath("workspace path is not valid UTF-8".into()))?
            .to_string(),
    ))
}

/// Read the current workspace root path, if any.
#[tauri::command]
pub fn get_workspace(state: State<'_, WorkspaceState>) -> CommandResult<Option<String>> {
    let root = state.get_root().ok();
    Ok(root.and_then(|p| p.to_str().map(str::to_string)))
}

/// Read a UTF-8 text file relative to the workspace root.
#[tauri::command]
pub fn read_file(state: State<'_, WorkspaceState>, path: String) -> CommandResult<String> {
    let workspace = state.get_root()?;
    let resolved = resolve_workspace_path(&workspace, &path)?;

    if !resolved.is_file() {
        if resolved.is_dir() {
            return Err(FsError::IsDirectory.into());
        }
        return Err(FsError::NotFound(path).into());
    }

    fs::read_to_string(&resolved).map_err(FsError::Io).map_err(Into::into)
}

/// Write UTF-8 content to a file relative to the workspace root.
#[tauri::command]
pub fn write_file(
    state: State<'_, WorkspaceState>,
    path: String,
    content: String,
) -> CommandResult<()> {
    let workspace = state.get_root()?;
    let resolved = resolve_workspace_path(&workspace, &path)?;

    if resolved.is_dir() {
        return Err(FsError::IsDirectory.into());
    }

    if let Some(parent) = resolved.parent() {
        fs::create_dir_all(parent).map_err(FsError::Io)?;
    }

    fs::write(&resolved, content).map_err(FsError::Io)?;
    Ok(())
}

/// Create a new file relative to the workspace root.
#[tauri::command]
pub fn create_file(
    state: State<'_, WorkspaceState>,
    path: String,
    content: Option<String>,
) -> CommandResult<()> {
    let workspace = state.get_root()?;
    let resolved = resolve_workspace_path(&workspace, &path)?;

    if resolved.exists() {
        return Err(FsError::AlreadyExists(path).into());
    }

    if let Some(parent) = resolved.parent() {
        fs::create_dir_all(parent).map_err(FsError::Io)?;
    }

    fs::write(&resolved, content.unwrap_or_default()).map_err(FsError::Io)?;
    Ok(())
}

/// Delete a file relative to the workspace root (files only, not directories).
#[tauri::command]
pub fn delete_file(state: State<'_, WorkspaceState>, path: String) -> CommandResult<()> {
    let workspace = state.get_root()?;
    let resolved = resolve_workspace_path(&workspace, &path)?;

    if !resolved.exists() {
        return Err(FsError::NotFound(path).into());
    }

    if resolved.is_dir() {
        return Err(FsError::IsDirectory.into());
    }

    fs::remove_file(&resolved).map_err(FsError::Io)?;
    Ok(())
}

/// Rename or move a file within the workspace.
#[tauri::command]
pub fn rename_file(
    state: State<'_, WorkspaceState>,
    old_path: String,
    new_path: String,
) -> CommandResult<()> {
    let workspace = state.get_root()?;
    let from = resolve_workspace_path(&workspace, &old_path)?;
    let to = resolve_workspace_path(&workspace, &new_path)?;

    if !from.exists() {
        return Err(FsError::NotFound(old_path).into());
    }

    if from.is_dir() {
        return Err(FsError::IsDirectory.into());
    }

    if to.exists() {
        return Err(FsError::AlreadyExists(new_path).into());
    }

    if let Some(parent) = to.parent() {
        fs::create_dir_all(parent).map_err(FsError::Io)?;
    }

    fs::rename(&from, &to).map_err(FsError::Io)?;
    Ok(())
}

/// List directory entries relative to workspace (helper for file tree).
#[tauri::command]
pub fn list_dir(
    state: State<'_, WorkspaceState>,
    path: Option<String>,
) -> CommandResult<Vec<DirEntry>> {
    let workspace = state.get_root()?;
    let relative = path.unwrap_or_default();
    let resolved = if relative.is_empty() {
        workspace.canonicalize().map_err(FsError::Io)?
    } else {
        resolve_workspace_path(&workspace, &relative)?
    };

    if !resolved.is_dir() {
        return Err(FsError::NotFound(relative).into());
    }

    let mut entries = Vec::new();
    for entry in fs::read_dir(&resolved).map_err(FsError::Io)? {
        let entry = entry.map_err(FsError::Io)?;
        let file_type = entry.file_type().map_err(FsError::Io)?;
        let name = entry.file_name().to_string_lossy().into_owned();

        if name.starts_with('.') {
            continue;
        }

        let entry_path = entry.path();
        let relative_path = entry_path
            .strip_prefix(&workspace)
            .map_err(|_| FsError::OutsideWorkspace)?
            .to_string_lossy()
            .replace('\\', "/");

        entries.push(DirEntry {
            name,
            path: relative_path,
            is_dir: file_type.is_dir(),
        });
    }

    entries.sort_by(|a, b| {
        b.is_dir
            .cmp(&a.is_dir)
            .then(a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });

    Ok(entries)
}
