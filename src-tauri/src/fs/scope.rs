use std::path::{Component, Path, PathBuf};

use super::error::{FsError, CommandResult};

/// Resolve a relative path within the workspace root. Rejects traversal and absolute paths.
pub fn resolve_workspace_path(workspace: &Path, relative: &str) -> CommandResult<PathBuf> {
    validate_relative_path(relative)?;

    let workspace_root = workspace
        .canonicalize()
        .map_err(FsError::Io)?;

    let mut resolved = workspace_root.clone();
    for component in Path::new(relative).components() {
        match component {
            Component::Normal(part) => resolved.push(part),
            Component::CurDir => {}
            Component::ParentDir | Component::RootDir | Component::Prefix(_) => {
                return Err(FsError::PathTraversal.into());
            }
        }
    }

    if resolved.exists() {
        let canonical = resolved.canonicalize().map_err(FsError::Io)?;
        if !canonical.starts_with(&workspace_root) {
            return Err(FsError::OutsideWorkspace.into());
        }
        return Ok(canonical);
    }

    if !resolved.starts_with(&workspace_root) {
        return Err(FsError::OutsideWorkspace.into());
    }

    Ok(resolved)
}

fn validate_relative_path(relative: &str) -> CommandResult<()> {
    let trimmed = relative.trim();
    if trimmed.is_empty() {
        return Err(FsError::InvalidPath("path must not be empty".into()).into());
    }

    if trimmed.contains('\0') {
        return Err(FsError::InvalidPath("path contains invalid characters".into()).into());
    }

    if Path::new(trimmed).is_absolute() {
        return Err(FsError::InvalidPath("absolute paths are not allowed".into()).into());
    }

    for component in Path::new(trimmed).components() {
        if matches!(component, Component::ParentDir | Component::RootDir | Component::Prefix(_)) {
            return Err(FsError::PathTraversal.into());
        }
    }

    Ok(())
}
