use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitFileChange {
    pub path: String,
    pub staged: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitChangeGroup {
    pub modified: Vec<GitFileChange>,
    pub added: Vec<GitFileChange>,
    pub deleted: Vec<GitFileChange>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitStatusResponse {
    pub is_repo: bool,
    pub branch: Option<String>,
    pub staged: GitChangeGroup,
    pub unstaged: GitChangeGroup,
    pub total_changes: usize,
}

impl GitChangeGroup {
    pub fn empty() -> Self {
        Self {
            modified: Vec::new(),
            added: Vec::new(),
            deleted: Vec::new(),
        }
    }

    pub fn len(&self) -> usize {
        self.modified.len() + self.added.len() + self.deleted.len()
    }
}

impl Default for GitChangeGroup {
    fn default() -> Self {
        Self::empty()
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitCommitResponse {
    pub commit_hash: String,
    pub message: String,
}
