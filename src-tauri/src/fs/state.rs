use std::path::PathBuf;
use std::sync::Mutex;

pub struct WorkspaceState {
    pub root: Mutex<Option<PathBuf>>,
}

impl Default for WorkspaceState {
    fn default() -> Self {
        Self {
            root: Mutex::new(None),
        }
    }
}

impl WorkspaceState {
    pub fn get_root(&self) -> Result<PathBuf, super::error::CommandError> {
        self.root
            .lock()
            .map_err(|_| super::error::CommandError {
                code: "LOCK_ERROR",
                message: "Failed to acquire workspace lock".into(),
            })?
            .clone()
            .ok_or_else(|| super::error::FsError::NoWorkspace.into())
    }

    pub fn set_root(&self, path: PathBuf) -> Result<(), super::error::CommandError> {
        let mut guard = self.root.lock().map_err(|_| super::error::CommandError {
            code: "LOCK_ERROR",
            message: "Failed to acquire workspace lock".into(),
        })?;
        *guard = Some(path);
        Ok(())
    }
}
