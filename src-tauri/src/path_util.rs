use std::path::{Path, PathBuf};

/// Strip Windows extended-length path prefixes (`\\?\`) so paths work with CMD,
/// npm scripts, and other tools that do not accept the `\\?\` prefix.
pub fn normalize_path(path: PathBuf) -> PathBuf {
    #[cfg(windows)]
    {
        let path_str = path.to_string_lossy();
        if let Some(rest) = path_str.strip_prefix(r"\\?\UNC\") {
            return PathBuf::from(format!(r"\\{rest}"));
        }
        if let Some(rest) = path_str.strip_prefix(r"\\?\") {
            return PathBuf::from(rest);
        }
    }

    path
}

pub fn canonicalize_normalized(path: &Path) -> std::io::Result<PathBuf> {
    path.canonicalize().map(normalize_path)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[cfg(windows)]
    fn strips_extended_prefix() {
        let input = PathBuf::from(r"\\?\C:\Users\test\project");
        assert_eq!(
            normalize_path(input),
            PathBuf::from(r"C:\Users\test\project")
        );
    }

    #[test]
    #[cfg(windows)]
    fn converts_extended_unc_prefix() {
        let input = PathBuf::from(r"\\?\UNC\server\share\folder");
        assert_eq!(
            normalize_path(input),
            PathBuf::from(r"\\server\share\folder")
        );
    }

    #[test]
    fn leaves_regular_paths_unchanged() {
        let input = PathBuf::from("/home/user/project");
        assert_eq!(normalize_path(input), PathBuf::from("/home/user/project"));
    }
}
