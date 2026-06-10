use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum FsError {
    #[error("No workspace folder is open")]
    NoWorkspace,
    #[error("Invalid path: {0}")]
    InvalidPath(String),
    #[error("Path traversal is not allowed")]
    PathTraversal,
    #[error("Path is outside the workspace")]
    OutsideWorkspace,
    #[error("File already exists: {0}")]
    AlreadyExists(String),
    #[error("File not found: {0}")]
    NotFound(String),
    #[error("Cannot delete a directory with this command")]
    IsDirectory,
    #[error("Dialog error: {0}")]
    Dialog(String),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

#[derive(Serialize)]
pub struct CommandError {
    pub code: &'static str,
    pub message: String,
}

impl From<FsError> for CommandError {
    fn from(err: FsError) -> Self {
        let code = match &err {
            FsError::NoWorkspace => "NO_WORKSPACE",
            FsError::InvalidPath(_) => "INVALID_PATH",
            FsError::PathTraversal => "PATH_TRAVERSAL",
            FsError::OutsideWorkspace => "OUTSIDE_WORKSPACE",
            FsError::AlreadyExists(_) => "ALREADY_EXISTS",
            FsError::NotFound(_) => "NOT_FOUND",
            FsError::IsDirectory => "IS_DIRECTORY",
            FsError::Dialog(_) => "DIALOG_ERROR",
            FsError::Io(_) => "IO_ERROR",
        };
        Self {
            code,
            message: err.to_string(),
        }
    }
}

pub type CommandResult<T> = Result<T, CommandError>;
